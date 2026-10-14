import { googleLogin, loginUser } from "../api/login";
import type { ApiResponse } from "../types";
import axios from "axios";

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
}

export const validateLoginForm = (data: LoginFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate email
  if (!data.email.trim()) {
    errors.email = "Email không được để trống";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Email không hợp lệ";
  }

  // Validate password
  if (!data.password) {
    errors.password = "Mật khẩu không được để trống";
  }

  return errors;
};

export const submitLoginForm = async (
  data: LoginFormData
): Promise<ApiResponse<any>> => {
  // Chuyển đổi dữ liệu form sang định dạng API yêu cầu
  const apiData = {
    email: data.email,
    password: data.password,
  };

  // Gọi API đăng nhập
  return await loginUser(apiData);
};

// Lưu thông tin đăng nhập vào localStorage hoặc sessionStorage
export const saveAuthData = (token: string, user: any, rememberMe: boolean) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("authToken", token);
  storage.setItem("user", JSON.stringify(user));
};

// Kiểm tra người dùng đã đăng nhập hay chưa
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Lấy token xác thực
export const getAuthToken = (): string | null => {
  return (
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  );
};

// Lấy thông tin người dùng đã đăng nhập
export const getAuthUser = (): any => {
  const userStr =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const updateAuthUser = (user: any) => {
  const storage =
    localStorage.getItem("authToken") || localStorage.getItem("user")
      ? localStorage
      : sessionStorage;

  storage.setItem("user", JSON.stringify(user));
};

// đăng nhập với google
export const submitGoogleLoginForm = async (accessToken: string) => {
  return await googleLogin({ accessToken });
};

// Đăng xuất
export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("user");
};
