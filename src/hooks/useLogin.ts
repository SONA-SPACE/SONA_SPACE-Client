import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  validateLoginForm,
  submitLoginForm,
  saveAuthData,
  submitGoogleLoginForm,
} from "../services/loginService";
import type { LoginFormData, ValidationErrors } from "../services/loginService";
import { useAuth } from "../contexts/AuthContext";
import type { CredentialResponse } from "@react-oauth/google";

export const useLogin = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [success, setSuccess] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [unverifiedError, setUnverifiedError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi khi người dùng bắt đầu sửa
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Xoá lỗi khi người dùng sửa lại
    setApiError(null);
    setUnverifiedError(null);
  };

  // Xử lý thay đổi checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Xử lý validate form
  const validateForm = (): boolean => {
    const validationErrors = validateLoginForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const isValid = validateForm();

    if (isValid) {
      setLoading(true);
      try {
        const response = await submitLoginForm(formData);

        if (response.success && response.data) {
          const { token, user } = response.data;

          saveAuthData(token, user, formData.rememberMe);
          auth.login(token, user);
          setSuccess(true);

          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          if (response.status === 403) {
            setUnverifiedError(
              response.message || "Tài khoản chưa được xác thực."
            );
          } else {
            setApiError(
              response.message ||
                "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
            );
          }
        }
      } catch (error) {
        setApiError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    const googleCredential = credentialResponse.credential;

    if (!googleCredential) {
      setApiError("Không nhận được thông tin đăng nhập từ Google. Vui lòng thử lại.");
      return;
    }

    setApiError(null);
    setUnverifiedError(null);
    setLoading(true);

    try {
      const response = await submitGoogleLoginForm(googleCredential);
      if (response.success && response.data) {
        const { token, user } = response.data;
        saveAuthData(token, user, false);
        auth.login(token, user);
        setSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setApiError(
          response.message ||
            "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
        );
      }
    } catch (error) {
      setApiError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error: any) => {
    // console.log(error);
    setApiError(error.error || "Đăng nhập thất bại. Vui lòng thử lại sau.");
  };

  return {
    formData,
    setFormData,
    errors,
    loading,
    success,
    apiError,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    validateForm,
    unverifiedError,
    handleGoogleLogin,
    handleGoogleError,
  };
};
