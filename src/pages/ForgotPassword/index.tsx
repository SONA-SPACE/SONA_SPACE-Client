import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { convertToAdminApiUrl } from "../../utils/url";


// Định nghĩa các bước phục hồi mật khẩu
enum RecoveryStep {
  EMAIL_INPUT = 1,
  OTP_VERIFICATION = 2,
  NEW_PASSWORD = 3
}

// Định nghĩa kiểu dữ liệu cho form
interface FormData {
  email: string;
  otp: string[];
  newPassword: string;
  confirmPassword: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<RecoveryStep>(RecoveryStep.EMAIL_INPUT);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    otp: ["", "", "", "", "", ""],
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordsMatch, setPasswordsMatch] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Hàm chung để gọi API, trả về kết quả thành công/thất bại và dữ liệu/lỗi
  // Hàm này KHÔNG TỰ HIỂN THỊ TOAST nữa
  const callApi = async (url: string, method: string, body?: any) => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseText = await response.text();
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (jsonError) {
        console.error("Phản hồi không phải JSON:", responseText);
        // Ném lỗi để được bắt ở khối catch bên ngoài
        throw new Error(`Máy chủ trả về dữ liệu không hợp lệ. Vui lòng thử lại. (${responseText.substring(0, 50)}...)`);
      }

      if (!response.ok) {
        // Ném lỗi từ server để được bắt ở khối catch bên ngoài
        throw new Error(data?.error || "Có lỗi xảy ra từ server.");
      }

      // Trả về dữ liệu thành công
      return { success: true, data: data };
    } catch (err: any) {
      // Trả về đối tượng lỗi để hàm gọi xử lý hiển thị toast
      return { success: false, error: err.message || "Lỗi không xác định." };
    } finally {
      setLoading(false);
    }
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      email: e.target.value
    });
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...formData.otp];
    newOtp[index] = value.replace(/[^0-9]/g, "").slice(0, 1);

    setFormData({
      ...formData,
      otp: newOtp
    });

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle OTP input keydown for backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Handle password input change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === "newPassword") {
      setPasswordsMatch(value === formData.confirmPassword || formData.confirmPassword === "");
    } else if (name === "confirmPassword") {
      setPasswordsMatch(value === formData.newPassword);
    }
  };

  // Handle email submission (Step 1)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.dismiss(); // Đóng tất cả các toast đang hiển thị

    if (!formData.email) {
      toast.error("Vui lòng nhập địa chỉ email."); // Toast cho lỗi client-side
      return;
    }

    const result = await callApi(convertToAdminApiUrl("/auth/send-otp"), "POST", { email: formData.email });
    if (result?.success) {
      toast.success(result.data.message); // Chỉ hiển thị toast thành công TẠI ĐÂY
      setCurrentStep(RecoveryStep.OTP_VERIFICATION);
    } else {
      toast.error(result?.error || "Lỗi khi gửi yêu cầu OTP."); // Chỉ hiển thị toast lỗi TẠI ĐÂY
    }
  };

  // Handle OTP verification (Step 2)
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.dismiss(); // Đóng tất cả các toast đang hiển thị

    const enteredOtp = formData.otp.join("");
    if (enteredOtp.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số OTP."); // Toast cho lỗi client-side
      return;
    }

    const result = await callApi(convertToAdminApiUrl("/auth/verify-otp"), "POST", {
      email: formData.email,
      otp: enteredOtp,
    });

    if (result?.success && result.data.resetToken) {
      toast.success(result.data.message); // Chỉ hiển thị toast thành công TẠI ĐÂY
      setResetToken(result.data.resetToken);
      setCurrentStep(RecoveryStep.NEW_PASSWORD);
    } else {
      toast.error(result?.error || "Lỗi khi xác thực OTP."); // Chỉ hiển thị toast lỗi TẠI ĐÂY
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    toast.dismiss(); // Đóng tất cả các toast đang hiển thị

    if (!formData.email) {
      toast.error("Không có email để gửi lại OTP."); // Toast cho lỗi client-side
      return;
    }
    const result = await callApi(convertToAdminApiUrl("/auth/send-otp"), "POST", { email: formData.email });
    if (result?.success) {
      toast.success(result.data.message); // Chỉ hiển thị toast thành công TẠI ĐÂY
    } else {
      toast.error(result?.error || "Lỗi khi gửi lại OTP."); // Chỉ hiển thị toast lỗi TẠI ĐÂY
    }
  };

  // Handle new password submission (Step 3)
  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.dismiss(); // Đóng tất cả các toast đang hiển thị

    if (formData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự."); // Toast cho lỗi client-side
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordsMatch(false);
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp."); // Toast cho lỗi client-side
      return;
    }

    if (!resetToken) {
      toast.error("Không tìm thấy token đặt lại mật khẩu. Vui lòng bắt đầu lại quá trình."); // Toast cho lỗi client-side
      return;
    }

    const result = await callApi(convertToAdminApiUrl("/auth/reset-password"), "POST", {
      newPassword: formData.newPassword,
      token: resetToken,
    });

    if (result?.success) {
      toast.success(result.data.message); // Chỉ hiển thị toast thành công TẠI ĐÂY
      setTimeout(() => {
        navigate("/dang-nhap");
      }, 2000);
    } else {
      toast.error(result?.error || "Lỗi khi đặt lại mật khẩu."); // Chỉ hiển thị toast lỗi TẠI ĐÂY
    }
  };

  return (
    <>
      <div className="forgot-password-page">
        <div className="container">
          <div className="forgot-password-content">
            {/* Đã loại bỏ các thẻ p hiển thị lỗi/thông báo cũ */}
            {/* {loading && <p style={{ textAlign: 'center', color: '#007bff' }}>Đang tải...</p>} */}

            {/* Step 1: Email Input */}
            {currentStep === RecoveryStep.EMAIL_INPUT && (
              <div className="step-content">
                <h1>Quên mật khẩu</h1>
                <p className="description">
                  Nếu bạn quên mật khẩu, hãy nhập địa chỉ email để đăng ký để nhận hướng dẫn đặt lại mật khẩu.
                </p>

                <form className="email-form" onSubmit={handleEmailSubmit}>
                  <div className="form-group">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleEmailChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Đang gửi..." : "Xác nhận"}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === RecoveryStep.OTP_VERIFICATION && (
              <div className="step-content">
                <h1>Nhập OTP</h1>
                <p className="description">
                  Bạn hãy kiểm tra email, chúng tôi đã gửi cho bạn mã OTP để thực hiện đặt lại mật khẩu.
                </p>

                <form className="otp-form" onSubmit={handleOtpSubmit}>
                  <div className="otp-inputs">
                    {formData.otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        required
                        disabled={loading}
                      />
                    ))}
                  </div>

                  <div className="resend-otp">
                    <button type="button" onClick={handleResendOtp} disabled={loading}>
                      {loading ? "Đang gửi lại..." : "Gửi lại mã"}
                    </button>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Đang xác nhận..." : "Xác nhận"}
                  </button>
                </form>
              </div>
            )}

            {/* Step 3: New Password */}
            {currentStep === RecoveryStep.NEW_PASSWORD && (
              <div className="step-content">
                <h1>Đặt lại mật khẩu mới</h1>
                <p className="description">
                  Hãy đặt lại mật khẩu mới cho lần đăng nhập tiếp theo.
                </p>

                <form className="new-password-form" onSubmit={handleNewPasswordSubmit}>
                  <div className="form-group">
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      placeholder="Mật Khẩu mới"
                      value={formData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className={!passwordsMatch ? "error" : ""}
                      disabled={loading}
                    />
                    {!passwordsMatch && <p className="error-message" style={{ color: 'red' }}>Mật khẩu không khớp</p>}
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Đang đặt lại..." : "Xác nhận"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right"
        autoClose={1000}
        style={{ marginTop: "100px" }}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={1} />
    </>
  );
};

export default ForgotPassword;
