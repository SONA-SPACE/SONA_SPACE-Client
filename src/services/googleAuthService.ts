import axios from "axios";
import type { ApiResponse, User } from "../types";
import { convertToAdminApiUrl } from "../utils/url";

export interface GoogleAuthResponse {
  token: string;
  user: User;
}

export const loginWithGoogleCredential = async (
  credential: string
): Promise<ApiResponse<GoogleAuthResponse>> => {
  if (!credential) {
    return {
      success: false,
      status: 400,
      code: "GOOGLE_CREDENTIAL_MISSING",
      error: "Không nhận được thông tin đăng nhập từ Google.",
      message: "Không nhận được thông tin đăng nhập từ Google.",
    };
  }

  try {
    const response = await axios.post(convertToAdminApiUrl("/auth/google-login"), {
      token: credential,
    });

    return {
      success: true,
      data: {
        token: response.data.token,
        user: response.data.user,
      },
      message: response.data.message || "Đăng nhập Google thành công.",
    };
  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const errorCode = error.response?.data?.code;
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Đăng nhập Google thất bại. Vui lòng thử lại.";

    return {
      success: false,
      status: statusCode,
      error: errorMessage,
      message: errorMessage,
      ...(errorCode ? { code: errorCode } : {}),
    };
  }
};
