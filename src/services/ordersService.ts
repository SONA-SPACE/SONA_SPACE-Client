// services/paymentService.ts
import axios from "axios";
import { convertToAdminApiUrl } from "../utils/url";
import { getAuthToken } from "./loginService";

export const createOrderService = async (orderData: any) => {
  const token = getAuthToken(); 
  try {
    const res = await axios.post(convertToAdminApiUrl("/orders"), orderData, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi gọi API tạo đơn hàng:", error);
    throw error;
  }
};

/**
 * Gửi yêu cầu trả hàng
 * @param orderId ID của đơn hàng cần trả
 * @param reason Lý do trả hàng
 * @param images Danh sách hình ảnh (File objects)
 * @returns Kết quả từ API
 */
export const returnOrder = async (orderId: number | string, reason: string, images: File[]): Promise<any> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    // Tạo FormData để gửi file và dữ liệu
    const formData = new FormData();
    formData.append('reason', reason);
    
    // Thêm các file hình ảnh
    images.forEach((image) => {
      formData.append(`return_images`, image);
    });

    const response = await axios.post(
      convertToAdminApiUrl(`/orders/return/${orderId}`),
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error returning order:', error);
    throw error;
  }
};
