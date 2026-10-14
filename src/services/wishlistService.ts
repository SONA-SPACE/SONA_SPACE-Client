import axios from "axios";
import { convertToAdminApiUrl } from "../utils/url";
import { getAuthToken } from "./loginService";

export const addToWishlist = async (variant_id: number, quantity: number) => {
  const token = getAuthToken();

  try {
    const response = await axios.post(
      convertToAdminApiUrl("/wishlists"),
      {
        variant_id,
        quantity,
        status: 1,

      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(" Lỗi khi gọi addToWishlist:", error?.response?.data || error.message || error);
    throw error;
  }
};

export const fetchWishlistFromDatabase = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("Bạn chưa đăng nhập");

  const response = await axios.get(convertToAdminApiUrl("/wishlists?status=1"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
export const loadWishlistService = async () => {
  try {
    const data = await fetchWishlistFromDatabase();
    return {
      success: true,
      wishlistItems: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Lỗi không xác định khi load wishlist",
    };
  }
};

export const removeFromWishlistService = async (variantId: number) => {
  const token = getAuthToken();
  if (!token) throw new Error("Bạn chưa đăng nhập");

  const response = await axios.delete(convertToAdminApiUrl(`/wishlists/variant/${variantId}`), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Kiểm tra variant_id có trong wishlist của user không
export const checkVariantInWishlist = async (variantId: number): Promise<boolean> => {
  const token = getAuthToken();
  if (!token) throw new Error("Bạn chưa đăng nhập");

  try {
    const response = await axios.get(convertToAdminApiUrl(`/wishlists/variant/${variantId}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.exists; // true nếu tồn tại, false nếu không
  } catch (error) {
    console.error("Lỗi khi kiểm tra wishlist:", error);
    throw error;
  }
};



