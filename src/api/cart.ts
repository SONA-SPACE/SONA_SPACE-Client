// api/cart.ts
import axios from "axios";
import { convertToAdminApiUrl } from "../utils/url";
import { getAuthToken } from "../services/loginService";

export const saveToCart = async (data: { status: number; cartItems: any[] }) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token không tồn tại, vui lòng đăng nhập.");
  }

  // Kiểm tra dữ liệu đầu vào trước khi gửi
  if (!Array.isArray(data.cartItems) || data.cartItems.length === 0) {
    throw new Error("Không có sản phẩm trong cartItems.");
  }
  
const cartItem = data.cartItems[0]; // Lấy item đầu tiên từ mảng cartItems
// console.log('variant_id gửi lên:', cartItem.variant_id);
const response = await axios.post(
  convertToAdminApiUrl("/wishlists"),
  {
    variant_id: cartItem.variant_id,
    quantity: cartItem.quantity,
    status: data.status,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);

  return response.data;
};


export const fetchCartFromDatabase = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("Bạn chưa đăng nhập");

  const response = await axios.get(convertToAdminApiUrl("/wishlists?status=0"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
