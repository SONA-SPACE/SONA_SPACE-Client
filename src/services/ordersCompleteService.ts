import axios from 'axios';
import { convertToAdminApiUrl } from '../utils/url';
import { getAuthToken } from './loginService';

export const getOrderByHash = async (orderHash: string) => {
    const token = getAuthToken(); 
  try {
    const response = await axios.get(convertToAdminApiUrl(`/orders/complete/${orderHash}`), {
      headers: {
        Authorization: `Bearer ${token}`, // ← Thêm token vào header
      },
    });
    // console.log(" Dữ liệu từ API:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy đơn hàng:", error);
    return { success: false, message: "Lỗi khi gọi API" };
  }
};
