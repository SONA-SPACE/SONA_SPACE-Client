import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import he from "he";
import "./ChatBot.scss";

const SERVER_URL = "http://localhost:3501/gemini";

const botAvatar =
      "https://res.cloudinary.com/dmgrdgvcf/image/upload/v1754375206/android-chrome-192x192_imxhjz.png";
const userAvatar =
      "https://res.cloudinary.com/dmgrdgvcf/image/upload/v1754414426/ByeWind_zglo0c.svg";

// Giữ typing sau khi end để trông tự nhiên
const TYPING_LAG_MS = 800;          // Gợi ý 600–1200
// Hết keepalive bao lâu thì coi như ngừng gõ
const KEEPALIVE_GRACE_MS = 2500;    // Gợi ý 2000–3500s

type Message = {
      id?: string;
      sender: "user" | "bot";
      text: string;
      image?: string;
      type?: "text" | "image";
      streaming?: boolean;
      meta?: any;
};

const TypingDots: React.FC = () => (
      <span className="typing-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
      </span>
);

const SafeMarkdown: React.FC<{ text: string }> = ({ text }) => {
      if (!text || typeof text !== "string") return <span>{text || ""}</span>;
      const decoded = he.decode(text);
      return (
            <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                        img: ({ node, ...props }) => (
                              <img
                                    {...props}
                                    loading="lazy"
                                    style={{ width: "100%", height: "auto", borderRadius: 4, margin: "10px 0" }}
                              />
                        ),
                        p: ({ children }) => <p>{children}</p>,
                        code: ({ children }) => <code>{children}</code>,
                        a: ({ children, ...props }) => (
                              <a {...props} target="_blank" rel="noreferrer">
                                    {children}
                              </a>
                        ),
                  }}
            >
                  {decoded}
            </ReactMarkdown>
      );
};

export default function ChatBot() {
      const [open, setOpen] = useState(false);
      const [minimized, setMinimized] = useState(false);
      const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
      const [input, setInput] = useState("");
      const [messages, setMessages] = useState<Message[]>([]);
      const [botTyping, setBotTyping] = useState(false);
      const [selectedImage, setSelectedImage] = useState<File | null>(null);
      const [imagePreview, setImagePreview] = useState<string | null>(null);
      const receivedFinalRef = useRef(false);
      const endedRef = useRef(false);

      const socketRef = useRef<Socket | null>(null);
      const chatBodyRef = useRef<HTMLDivElement>(null);
      const fileInputRef = useRef<HTMLInputElement>(null);
      const chatWidgetRef = useRef<HTMLDivElement>(null);

      // Effect để detect screen size changes
      useEffect(() => {
            const handleResize = () => {
                  const newIsDesktop = window.innerWidth >= 1024;
                  setIsDesktop(newIsDesktop);

                  // Reset minimize state khi chuyển sang tablet/mobile
                  if (!newIsDesktop && minimized) {
                        setMinimized(false);
                  }
            };

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
      }, [minimized]);

      // Effect để handle click outside và scroll
      useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                  // Không đóng chat nếu đang minimize (chỉ trên desktop)
                  if (isDesktop && minimized) return;

                  // Không đóng chat nếu bot đang typing hoặc user đang nhập
                  if (botTyping || input.trim()) return;

                  if (
                        open &&
                        chatWidgetRef.current &&
                        !chatWidgetRef.current.contains(event.target as Node)
                  ) {
                        setOpen(false);
                        setMinimized(false);
                  }
            };

            if (open) {
                  document.addEventListener("mousedown", handleClickOutside);
            }

            return () => {
                  document.removeEventListener("mousedown", handleClickOutside);
            };
      }, [open, isDesktop, minimized, botTyping, input]);


      const sendingRef = useRef(false);

      // Theo dõi stream hiện tại
      const currentStreamIdRef = useRef<string | null>(null);
      const lastKeepaliveRef = useRef<number>(0);
      const typingLagTimerRef = useRef<number | null>(null);

      function upsertStreamingMessage(id: string, chunk: string) {
            setMessages((prev) => {
                  const idx = prev.findIndex((m) => m.id === id);
                  if (idx >= 0) {
                        const existing = prev[idx];
                        return [
                              ...prev.slice(0, idx),
                              { ...existing, text: existing.text + (chunk || ""), streaming: true },
                              ...prev.slice(idx + 1),
                        ];
                  }
                  // CHỈ tạo message lần đầu khi đã có CHUNK
                  return [
                        ...prev,
                        { id, sender: "bot", text: chunk || "", type: "text", streaming: true },
                  ];
            });
      }

      function finalizeStreamingMessage(id: string, finalText?: string, meta?: any) {
            setMessages((prev) => {
                  const idx = prev.findIndex((m) => m.id === id);
                  if (idx >= 0) {
                        const existing = prev[idx];
                        return [
                              ...prev.slice(0, idx),
                              {
                                    ...existing,
                                    text:
                                          (finalText && finalText.trim()) ||
                                          existing.text ||
                                          "Xin chào! Mình có thể giúp gì cho bạn?",
                                    streaming: false,
                                    meta: meta ?? existing.meta,
                              },
                              ...prev.slice(idx + 1),
                        ];
                  }
                  // Fallback: ít gặp (server gửi final trước chunk)
                  return [
                        ...prev,
                        {
                              id,
                              sender: "bot",
                              text:
                                    (finalText && finalText.trim()) ||
                                    "Xin chào! Mình có thể giúp gì cho bạn?",
                              type: "text",
                              streaming: false,
                              meta,
                        },
                  ];
            });
      }

      useEffect(() => {
            socketRef.current = io(SERVER_URL, { transports: ["websocket"] });

            socketRef.current.on("connect", () => {
                  // Connected
            });

            socketRef.current.on("connect_error", () => {
                  setMessages((prev) => [
                        ...prev,
                        {
                              sender: "bot",
                              text: "Không kết nối được máy chủ Gemini chat. Vui lòng thử lại sau.",
                              type: "text",
                        },
                  ]);
                  setBotTyping(false);
            });

            // 1) START: KHÔNG tạo message ở đây — chỉ bật typing
            socketRef.current.on("bot_response_start", ({ id }) => {
                  currentStreamIdRef.current = id;
                  receivedFinalRef.current = false;
                  endedRef.current = false;
                  setBotTyping(true);
                  lastKeepaliveRef.current = Date.now();
            });


            // 2) CHUNK: lần đầu sẽ tạo message, sau đó chỉ nối text
            socketRef.current.on("bot_response_chunk", ({ id, chunk }) => {
                  if (id !== currentStreamIdRef.current || endedRef.current) return;
                  upsertStreamingMessage(id, chunk || "");
                  setBotTyping(true);
                  lastKeepaliveRef.current = Date.now();
            });


            // Keepalive để giữ typing nếu stream tạm dừng
            socketRef.current.on("bot_keepalive", ({ id }) => {
                  if (id !== currentStreamIdRef.current) return;     // sai stream -> bỏ
                  if (receivedFinalRef.current || endedRef.current) return; // đã final/end -> bỏ

                  lastKeepaliveRef.current = Date.now();
                  setBotTyping(true);

                  // gia hạn tắt typing nếu không có keepalive mới
                  window.clearTimeout(typingLagTimerRef.current || 0);
                  typingLagTimerRef.current = window.setTimeout(() => {
                        const diff = Date.now() - lastKeepaliveRef.current;
                        if (diff >= KEEPALIVE_GRACE_MS) setBotTyping(false);
                  }, KEEPALIVE_GRACE_MS + 50) as unknown as number;
            });


            // 3) FINAL: chốt nội dung
            socketRef.current.on("bot_response", ({ id, response, groundingMetadata }) => {
                  if (id !== currentStreamIdRef.current) return; // an toàn
                  receivedFinalRef.current = true;

                  finalizeStreamingMessage(id, response, { groundingMetadata: groundingMetadata || null });

                  // chỉ giữ typing 1 chút cho mượt (không cho keepalive can thiệp nữa)
                  window.clearTimeout(typingLagTimerRef.current || 0);
                  typingLagTimerRef.current = window.setTimeout(() => {
                        setBotTyping(false);
                  }, TYPING_LAG_MS) as unknown as number;
            });


            // 4) END: đảm bảo không còn streaming treo
            socketRef.current.on("bot_response_end", ({ id }) => {
                  if (id !== currentStreamIdRef.current) return;
                  endedRef.current = true;

                  setMessages(prev => {
                        const idx = prev.findIndex(m => m.id === id && m.streaming);
                        if (idx < 0) return prev;
                        const m = prev[idx];
                        return [
                              ...prev.slice(0, idx),
                              { ...m, streaming: false, text: m.text || "Không nhận được nội dung trả về. Vui lòng thử lại." },
                              ...prev.slice(idx + 1),
                        ];
                  });

                  window.clearTimeout(typingLagTimerRef.current || 0);
                  typingLagTimerRef.current = window.setTimeout(() => setBotTyping(false), TYPING_LAG_MS) as unknown as number;

                  currentStreamIdRef.current = null;
            });


            socketRef.current.on("error_response", (data: { error?: string; message?: string }) => {
                  const errorMsg = data.error || data.message || "Lỗi không xác định";
                  setMessages((prev) => [...prev, { sender: "bot", text: errorMsg, type: "text" }]);
                  setBotTyping(false);
            });

            return () => {
                  if (socketRef.current) {
                        socketRef.current.removeAllListeners();
                        socketRef.current.disconnect();
                  }
            };
      }, []);

      // Auto scroll
      useEffect(() => {
            if (chatBodyRef.current) {
                  chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
            }
      }, [messages, open, botTyping]);

      const handleSend = () => {
            const hasText = !!input.trim();
            const hasImage = !!selectedImage;
            if (sendingRef.current) return;
            sendingRef.current = true;
            setTimeout(() => (sendingRef.current = false), 800);

            if (!hasText && !hasImage) return;

            if (!socketRef.current || !socketRef.current.connected) {
                  setMessages((prev) => [
                        ...prev,
                        { sender: "bot", text: "Chưa kết nối với server. Vui lòng thử lại.", type: "text" },
                  ]);
                  return;
            }

            if (hasImage) {
                  const file = selectedImage!;
                  const reader = new FileReader();
                  reader.onload = (e) => {
                        const imageData = e.target?.result as string;
                        setMessages((prev) => [
                              ...prev,
                              {
                                    sender: "user",
                                    text: hasText ? input.trim() : file.name,
                                    image: imageData,
                                    type: "image",
                              },
                        ]);
                        socketRef.current?.emit("user_image", {
                              data: imageData,
                              prompt: hasText ? input.trim() : "Hãy mô tả nội dung hình ảnh chi tiết.",
                        });
                        setBotTyping(true);
                        setInput("");
                        setSelectedImage(null);
                        setImagePreview(null);
                  };
                  reader.onerror = () => {
                        setMessages((prev) => [...prev, { sender: "bot", text: "Không thể đọc file hình ảnh.", type: "text" }]);
                  };
                  reader.readAsDataURL(file);
                  return;
            }

            if (hasText) {
                  const text = input.trim();
                  setMessages((prev) => [...prev, { sender: "user", text, type: "text" }]);
                  socketRef.current?.emit("user_message", { message: text });
                  setBotTyping(true);
                  setInput("");
            }
      };

      const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file && file.type.startsWith("image/")) {
                  setSelectedImage(file);
                  const reader = new FileReader();
                  reader.onload = (event) => setImagePreview(event.target?.result as string);
                  reader.readAsDataURL(file);
            }
      };

      const removeImage = () => {
            setSelectedImage(null);
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
      };

      // Có message đang stream?
      const hasStreaming = messages.some((m) => m.sender === "bot" && m.streaming);

      return (
            <div className="chat-widget" ref={chatWidgetRef}>
                  <button
                        className={`chat-bubble ${open ? "hidden" : ""}`}
                        onClick={() => setOpen(true)}
                        aria-label="Mở trợ lý chat"
                        aria-expanded={open}
                  >
                        <img src={botAvatar} alt="Bot" />
                  </button>

                  <div
                        className={`chat-popup ${!open ? "hidden" : ""} ${isDesktop && minimized ? "minimized" : ""}`}
                        inert={!open}
                        style={isDesktop && minimized ? { height: "60px", overflow: "hidden" } : {}}
                        title={!(isDesktop && minimized) ? "Chat sẽ tự đóng khi bạn scroll hoặc click ra ngoài" : ""}
                  >
                        <div
                              className="chat-header"
                              onClick={isDesktop && minimized ? () => setMinimized(false) : undefined}
                              style={isDesktop && minimized ? { cursor: "pointer" } : {}}
                              title={isDesktop && minimized ? "Click để mở rộng" : ""}
                        >
                              <span>Sona Space</span>
                              <div className="header-buttons">
                                    {isDesktop && (
                                          <button
                                                onClick={(e) => {
                                                      e.stopPropagation();
                                                      setMinimized(!minimized);
                                                }}
                                                title={minimized ? "Mở rộng" : "Thu nhỏ"}
                                                className="minimize-btn"
                                          >
                                                {minimized ? (
                                                      <i className="fa-solid fa-window-maximize"></i>
                                                ) : (
                                                      <i className="fa-solid fa-window-minimize"></i>
                                                )}
                                          </button>
                                    )}
                                    <button
                                          onClick={(e) => {
                                                e.stopPropagation();
                                                setOpen(false);
                                          }}
                                          title="Đóng"
                                          className="close-btn"
                                    >
                                          ×
                                    </button>
                              </div>
                        </div>

                        {!(isDesktop && minimized) && (
                              <>
                                    <div
                                          className="chat-body"
                                          ref={chatBodyRef}
                                          onScroll={(e) => e.stopPropagation()}
                                    >
                                          {messages.map((msg, i) => (
                                                <div
                                                      key={msg.id || i}
                                                      className={`chat-message ${msg.sender === "user" ? "right" : "left"}`}
                                                >
                                                      <img src={msg.sender === "user" ? userAvatar : botAvatar} alt={msg.sender} />
                                                      <div className="message-content">
                                                            {msg.type === "image" && msg.image ? (
                                                                  <div className="image-message">
                                                                        <img src={msg.image} alt={msg.text} className="chat-image" />
                                                                        <span className="image-filename">{msg.text}</span>
                                                                  </div>
                                                            ) : (
                                                                  <div className="markdown-body">
                                                                        {msg.text ? (
                                                                              <>
                                                                                    <SafeMarkdown text={msg.text} />
                                                                                    {msg.meta?.groundingMetadata?.groundingChunks && (
                                                                                          <div className="sources">
                                                                                                {msg.meta.groundingMetadata.groundingChunks
                                                                                                      .slice(0, 3)
                                                                                                      .map((c: any, idx: number) => (
                                                                                                            <div key={idx} className="source-link">
                                                                                                                  <a href={c.web?.uri} target="_blank" rel="noreferrer">
                                                                                                                        📄 {c.web?.title || c.web?.uri || "Nguồn tham khảo"}
                                                                                                                  </a>
                                                                                                            </div>
                                                                                                      ))}
                                                                                          </div>
                                                                                    )}
                                                                              </>
                                                                        ) : (
                                                                              <span>...</span>
                                                                        )}
                                                                  </div>
                                                            )}
                                                      </div>
                                                </div>
                                          ))}

                                          {/* Indicator DƯỚI: chỉ hiện khi CHƯA có message stream (tức là đang "chuẩn bị" hoặc vừa end) */}
                                          {botTyping && !hasStreaming && (
                                                <div className="chat-message left">
                                                      <img src={botAvatar} alt="Bot" />
                                                      <TypingDots />
                                                </div>
                                          )}
                                    </div>

                                    <div className="chat-input">
                                          {imagePreview && (
                                                <div className="image-preview">
                                                      <img src={imagePreview} alt="Preview" />
                                                      <button type="button" onClick={removeImage} className="remove-image">
                                                            ×
                                                      </button>
                                                </div>
                                          )}

                                          <div className="input-container">
                                                <input
                                                      value={input}
                                                      onChange={(e) => setInput(e.target.value)}
                                                      placeholder="Nhập tin nhắn..."
                                                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                                />
                                                <input
                                                      ref={fileInputRef}
                                                      type="file"
                                                      accept="image/*"
                                                      onChange={handleImageSelect}
                                                      style={{ display: "none" }}
                                                />
                                                <button
                                                      type="button"
                                                      onClick={() => fileInputRef.current?.click()}
                                                      className="image-btn"
                                                      title="Đính kèm hình ảnh"
                                                >
                                                      <i className="fa-solid fa-paperclip"></i>
                                                </button>
                                                <button onClick={handleSend}>Gửi</button>
                                          </div>
                                    </div>
                              </>
                        )}
                  </div>
            </div>
      );
}
