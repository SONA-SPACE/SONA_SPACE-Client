import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { saveToOrCart } from "../../services/cartService";
import { toast } from "react-toastify";
import type { MiniCartHandle } from "../../components/MiniCart";
import { convertToAdminApiUrl } from "../../utils/url";
import { getAuthToken } from "../../services/loginService";
import {
  EmptyState,
  InlineErrorState,
  PageSectionSkeleton,
  RetryState,
} from "../StateFeedback";

interface WishlistItem {
  wishlist_id: number;
  status: number;
  created_at: string;
  variant_id: number;
  product_id: number;
  price: string;
  price_sale: string | null;
  image: string;
  product_name: string;
  category: string;
  product_slug: string;
  color_name?: string;
  color_hex?: string;
  slug: string;
}

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistSidebar: React.FC<WishlistSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [productNames, setProductNames] = useState<Record<number, string>>({});
  const [pendingRemoveId, setPendingRemoveId] = useState<number | null>(null);
  const [pendingAddVariantId, setPendingAddVariantId] = useState<number | null>(null);
  const miniCartRef = useRef<MiniCartHandle>(null);

  useEffect(() => {
    const handleWishlistChanged = () => {
      if (isOpen) {
        fetchWishlistItems();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetchWishlistItems();
      window.addEventListener("wishlist-changed", handleWishlistChanged);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("wishlist-changed", handleWishlistChanged);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const fetchProductNames = async (productIds: number[]) => {
    if (productIds.length === 0) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const names: Record<number, string> = {};

      await Promise.all(
        productIds.map(async (productId) => {
          try {
            const response = await axios.get(
              convertToAdminApiUrl("/wishlists?status=1"),
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.data && response.data.product_name) {
              names[productId] = response.data.product_name;
            } else {
              names[productId] = `Sản phẩm #${productId}`;
            }
          } catch (err) {
            console.error(
              `Lỗi khi lấy tên sản phẩm cho ID ${productId}:`,
              err
            );
            names[productId] = `Sản phẩm #${productId}`;
          }
        })
      );

      setProductNames(names);
    } catch (err) {
      console.error("Lỗi khi lấy tên sản phẩm:", err);
    }
  };

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError("Vui lòng đăng nhập để xem danh sách yêu thích.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        convertToAdminApiUrl("/wishlists?status=1"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const items: WishlistItem[] = Array.isArray(response.data)
        ? response.data
        : [];

      setWishlistItems(items);
      fetchProductNames([...new Set(items.map((item) => item.product_id))]);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách yêu thích:", err);
      setError("Không thể lấy danh sách yêu thích. Vui lòng thử lại sau.");
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (variantId: number) => {
    if (pendingAddVariantId === variantId) {
      return;
    }

    setPendingAddVariantId(variantId);

    try {
      const token = getAuthToken();
      if (!token) {
        toast.warning("Vui lòng đăng nhập để thêm vào giỏ hàng.", {
          position: "top-right",
          autoClose: 1500,
        });
        return;
      }

      const response = await saveToOrCart({
        status: 0,
        cartItems: [
          {
            variant_id: Number(variantId),
            quantity: 1,
          },
        ],
      });

      if (response.success) {
        toast.success("Đã thêm vào giỏ hàng!", {
          position: "top-right",
          autoClose: 1000,
        });

        if (miniCartRef.current) {
          miniCartRef.current.notifyCartChanged();
          miniCartRef.current.toggleMiniCart();
        }
      } else {
        toast.error("Lỗi khi thêm vào giỏ hàng: " + response.message, {
          position: "top-right",
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.", {
        position: "top-right",
        autoClose: 1500,
      });
    } finally {
      setPendingAddVariantId((current) =>
        current === variantId ? null : current
      );
    }
  };

  const handleRemoveFromWishlist = async (wishlistId: number) => {
    if (pendingRemoveId === wishlistId) {
      return;
    }

    setPendingRemoveId(wishlistId);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Vui lòng đăng nhập để chỉnh sửa danh sách yêu thích.");
        return;
      }

      const removedItem = wishlistItems.find(
        (item) => item.wishlist_id === wishlistId
      );

      await axios.delete(convertToAdminApiUrl(`/wishlists/${wishlistId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setWishlistItems(
        wishlistItems.filter((item) => item.wishlist_id !== wishlistId)
      );

      if (removedItem) {
        const event = new CustomEvent("wishlist-changed", {
          detail: { variantId: removedItem.variant_id },
        });
        window.dispatchEvent(event);
      }
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm khỏi danh sách yêu thích:", err);
      setError("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setPendingRemoveId((current) =>
        current === wishlistId ? null : current
      );
    }
  };

  const getFirstImageUrl = (imageUrls: string): string => {
    if (!imageUrls) return "";

    if (imageUrls.includes(",")) {
      return imageUrls.split(",")[0];
    }

    return imageUrls;
  };

  const formatPrice = (price: string | null): string => {
    if (!price) return "0đ";
    return parseInt(price).toLocaleString("vi-VN") + "đ";
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`wishlist-sidebar-container ${isOpen ? "open" : ""}`}
      onClick={handleOverlayClick}
    >
      <div
        className="wishlist-sidebar"
        id="wishlist-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Danh sách yêu thích"
      >
        <div className="wishlist-sidebar-header">
          <h2>Danh sách yêu thích</h2>
          <button
            className="close-button"
            type="button"
            aria-label="Đóng danh sách yêu thích"
            onClick={onClose}
          >
            <img src="/images/icons/close.svg" alt="Đóng" />
          </button>
        </div>
        <div className="wishlist-sidebar-content">
          {loading ? (
            <PageSectionSkeleton variant="account-list" count={3} />
          ) : error ? (
            <RetryState
              message={error}
              onRetry={fetchWishlistItems}
              secondaryActionLabel="Khám phá sản phẩm"
              secondaryActionTo="/san-pham"
            />
          ) : wishlistItems.length === 0 ? (
            <EmptyState
              title="Danh sách yêu thích đang trống"
              message="Lưu các sản phẩm bạn quan tâm để quay lại nhanh hơn."
              actionLabel="Khám phá sản phẩm"
              actionTo="/san-pham"
            />
          ) : (
            <div className="wishlist-items">
              {Array.isArray(wishlistItems) ? (
                wishlistItems.map((item) => (
                  <div className="wishlist-item" key={item.wishlist_id}>
                    <div className="wishlist-item-image">
                      <Link to={`/san-pham/${item.slug}`}>
                        <img src={getFirstImageUrl(item.image)} alt="Product" />
                      </Link>
                    </div>
                    <div className="wishlist-item-info">
                      <Link
                        to={`/san-pham/${item.slug}`}
                        className="wishlist-item-name"
                      >
                        {item.product_name ||
                          productNames[item.product_id] ||
                          `Sản phẩm #${item.product_id}`}
                      </Link>
                      <div className="wishlist-item-price">
                        {Number(item.price_sale) > 0 &&
                        Number(item.price_sale) < Number(item.price) ? (
                          <>
                            <span className="sale-price">
                              {formatPrice(item.price_sale)}
                            </span>
                            <span className="original-price">
                              {formatPrice(item.price)}
                            </span>
                          </>
                        ) : (
                          <span className="regular-price">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                      <div className="wishlist-item-actions">
                        {error && pendingRemoveId === item.wishlist_id && (
                          <InlineErrorState message={error} />
                        )}
                        <button
                          className="remove-button"
                          type="button"
                          disabled={
                            pendingRemoveId === item.wishlist_id ||
                            pendingAddVariantId === item.variant_id
                          }
                          aria-label={
                            pendingRemoveId === item.wishlist_id
                              ? "Đang xóa khỏi danh sách yêu thích"
                              : "Xóa khỏi danh sách yêu thích"
                          }
                          onClick={() =>
                            handleRemoveFromWishlist(item.wishlist_id)
                          }
                        >
                          {pendingRemoveId === item.wishlist_id ? (
                            <span className="wishlist-item-action-label">
                              Đang xóa...
                            </span>
                          ) : (
                            <img src="/images/icons/trash-2.svg" alt="Xóa" />
                          )}
                        </button>
                        <button
                          className="add-to-cart-button"
                          type="button"
                          disabled={
                            pendingAddVariantId === item.variant_id ||
                            pendingRemoveId === item.wishlist_id
                          }
                          aria-label={
                            pendingAddVariantId === item.variant_id
                              ? "Đang thêm vào giỏ hàng"
                              : "Thêm vào giỏ hàng"
                          }
                          onClick={() => handleAddToCart(item.variant_id)}
                        >
                          {pendingAddVariantId === item.variant_id ? (
                            <span className="wishlist-item-action-label">
                              Đang thêm...
                            </span>
                          ) : (
                            <img
                              src="/images/icons/shopping-basket.svg"
                              alt="Thêm vào giỏ hàng"
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <InlineErrorState message="Lỗi hiển thị danh sách yêu thích" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistSidebar;
