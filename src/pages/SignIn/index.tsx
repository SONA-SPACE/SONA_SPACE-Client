import React from "react";
import { Link } from "react-router-dom";
import PageHero from "../../components/PageHero";
import { useLogin } from "../../hooks/useLogin";
import { useGoogleLogin } from "../../hooks/useGoogleLogin";
import "./styles.css";
import { GoogleLogin } from "@react-oauth/google";

const SignIn: React.FC = () => {
  const {
    formData,
    errors,
    loading,
    success,
    apiError,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    unverifiedError,
  } = useLogin();
  const {
    googleLoading,
    googleError,
    handleGoogleLogin,
    handleGoogleError,
  } = useGoogleLogin();

  return (
    <>
      <PageHero title="Đăng Nhập" breadcrumbs={[{ label: "Trang chủ", to: "/" }, { label: "Đăng Nhập" }]} />
      <div className="signin-page">
        <div className="container">
          <div className="signin-content">
            <h2>Đăng Nhập</h2>
            <p className="signin-description">Chào mừng bạn trở lại!</p>

            {success && (
              <div className="success-message">
                Đăng nhập thành công! Đang chuyển hướng đến trang chủ...
              </div>
            )}
            {unverifiedError && (
              <div className="error-message email-unverified-message">
                {unverifiedError}
              </div>
            )}

            {apiError && (
              <div className="error-message api-error">
                {apiError}
              </div>
            )}
            {googleError && (
              <div className="error-message api-error">
                {googleError}
              </div>
            )}

            <form className="signin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>

              <div className="form-group">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Mật Khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                />
                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>

              <div className="form-options">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="rememberMe">Ghi nhớ tài khoản</label>
                </div>
                <div className="forgot-password">
                  <Link to="/quen-mat-khau">Quên mật khẩu?</Link>
                </div>
              </div>

              <button
                type="submit"
                className="signin-btn"
                disabled={loading || success}
              >
                {loading ? "Đang xử lý..." : "Đăng Nhập"}
              </button>
            </form>

            <div className="social-signin">
              <div className="divider">
                <span>{googleLoading ? "Đang xử lý Google..." : "Đăng nhập với Google"}</span>
              </div>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleError}
              />

              {/* <button className="google-signin-btn" disabled={loading || googleLoading || success}>
                <img src="/images/sign-up/Google.svg" alt="Google" />
                <span>Google</span>
              </button> */}
            </div>

            <div className="signup-link">
              <p>Bạn chưa có tài khoản? <Link to="/dang-ky">Đăng Ký ngay</Link></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
