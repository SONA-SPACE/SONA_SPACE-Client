import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import { saveAuthData } from "../services/loginService";
import { loginWithGoogleCredential } from "../services/googleAuthService";

export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleSuccess, setGoogleSuccess] = useState(false);

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    const credential = credentialResponse.credential;

    if (!credential) {
      setGoogleError("Không nhận được thông tin đăng nhập từ Google. Vui lòng thử lại.");
      return;
    }

    setGoogleLoading(true);
    setGoogleError(null);

    try {
      const response = await loginWithGoogleCredential(credential);

      if (response.success && response.data) {
        const { token, user } = response.data;
        saveAuthData(token, user, false);
        auth.login(token, user);
        setGoogleSuccess(true);

        setTimeout(() => {
          navigate("/");
        }, 1000);
        return;
      }

      setGoogleError(
        response.message ||
          "Đăng nhập Google thất bại. Vui lòng kiểm tra cấu hình Google hoặc thử lại."
      );
    } catch {
      setGoogleError("Đã xảy ra lỗi khi đăng nhập Google. Vui lòng thử lại sau.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleError("Không thể mở hoặc hoàn tất đăng nhập Google. Vui lòng thử lại.");
  };

  const clearGoogleError = () => setGoogleError(null);

  return {
    googleLoading,
    googleError,
    googleSuccess,
    handleGoogleLogin,
    handleGoogleError,
    clearGoogleError,
  };
};
