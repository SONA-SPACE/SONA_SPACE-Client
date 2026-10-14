import React, { lazy, Suspense, useState, useEffect } from "react";
import { Link, Links, useNavigate, useLocation } from "react-router-dom";
import PageHero from "../../components/PageHero";
import axios from "axios";
import { cancelOrder } from "../../services/userServices";
import { getOrderItems } from "../../api/order";

import type {
  OrderItemAPI,
  OrderAPI,
  OrdersResponse,
  OrderItem,
  UserInfo, CouponCode,
  PromoCodeWithTimer as PromoCode
} from "../../types";
import { convertToAdminApiUrl } from "../../utils/url";
import { toast } from "react-toastify";
import { getAuthToken, getAuthUser, updateAuthUser } from "../../services/loginService";
import {
  EmptyState,
  PageSectionSkeleton,
  RetryState,
} from "../../components/StateFeedback";

// Định nghĩa interface cho API mới
interface ProductColor {
  name: string;
  hex: string;
}

interface ProductRating {
  count: number;
  average: string;
}

interface Coupon {
  couponStatus: number;
}

interface ProductItem {
  id: number;
  slug: string;
  name: string;
  image: string;
  price: string;
  quantity: number;
  color: ProductColor;
  category: string;
  rating: ProductRating;
  status?: string; // ACTIVE, CANCELLED, etc.
  can_cancel?: boolean;
  item_id?: number; // API item ID for cancellation
}

interface OrderData {
  id: number;
  order_hash: string;
  date: string;
  status: string;
  statusStep: number;
  recipientName: string;
  recipientPhone: string;
  address: string;
  subtotal: string;
  shippingFee: number;
  discount: number;
  total: string;
  products: ProductItem[];
}

interface OrdersAPIResponse {
  user_id: string;
  order_count: number;
  orders: OrderData[];
}

// Thay thế toast bằng alert hoặc console.log
// import { toast } from "react-hot-toast";
// Define interfaces for our data types

// CountdownTimer component
const CountdownTimer: React.FC<{
  hours: number;
  minutes: number;
  seconds: number;
  onComplete?: () => void;
}> = ({ hours: initialHours, minutes: initialMinutes, seconds: initialSeconds, onComplete }) => {
  const calcTotalSeconds = () =>
    initialHours * 3600 + initialMinutes * 60 + initialSeconds;

  const [totalSeconds, setTotalSeconds] = useState<number>(calcTotalSeconds());

  useEffect(() => {
    setTotalSeconds(calcTotalSeconds()); // Reset when props change

    const interval = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialHours, initialMinutes, initialSeconds, onComplete]);

  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const format = (n: number) => (n < 10 ? `0${n}` : n.toString());

  return (
    <div className="flash-time">
      {days > 0 && <span className="time-value">{days} ngày</span>}{" "}
      {(days > 0 || hours > 0) && <span className="time-value">{format(hours)} giờ</span>}{" "}
      {(days > 0 || minutes > 0) && <span className="time-value">{format(minutes)} phút</span>}{" "}
      <span className="time-value">{format(seconds)} giây</span>
    </div>
  );
};



const User: React.FC = () => {
  // Use location to get current path
  const location = useLocation();
  const navigate = useNavigate();

  // State for active tab
  const [activeTab, setActiveTab] = useState<string>("orders");
  // State for active order filter
  const [activeOrderFilter, setActiveOrderFilter] = useState<string>("all");
  const [activePromoFilter, setActivePromoFilter] = useState<string>("all");

  // State cho dữ liệu đơn hàng từ API
  const [apiOrders, setApiOrders] = useState<OrderData[]>([]);
  const [ordersResponse, setOrdersResponse] = useState<OrdersAPIResponse | null>(null);
  const [detailedOrderItems, setDetailedOrderItems] = useState<Map<number, any[]>>(new Map()); // Map of orderId -> detailed items
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filled from the API; starts empty so no placeholder identity is ever shown or saved
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    email: "",
    phone: "",
    address: [],
  });

  // State để theo dõi khi nào cần tải lại dữ liệu người dùng
  const [refreshUserData, setRefreshUserData] = useState<boolean>(false);

  // State cho modal hủy đơn hàng
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrderHash, setSelectedOrderHash] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Lấy thông tin người dùng từ sessionStorage khi component mount
  useEffect(() => {
    try {
      const userData = getAuthUser();
      if (userData) {
        // Cập nhật thông tin người dùng từ sessionStorage
        setUserInfo({
          name: userData.name || userData.full_name || "Chưa cập nhật",
          email: userData.email || "Chưa cập nhật",
          phone: userData.phone || "Chưa cập nhật",
          address: userData.address || "Chưa cập nhật địa chỉ",
          full_name: userData.full_name,
          id: userData.id,
        });

        // Gọi API để lấy dữ liệu đơn hàng
        fetchOrders(userData.id);
      } else {
        // No persisted auth user is available.
        setError("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn");
        setIsLoading(false);
      }
    } catch (error) {
        console.error(
          "Lỗi khi parse dữ liệu người dùng từ sessionStorage:",
          error
        );
      }
      // console.log("Không tìm thấy thông tin người dùng trong sessionStorage");
  }, [refreshUserData]);

  // Hàm lấy dữ liệu đơn hàng từ API
  // Fetch detailed order items to get individual product status
  const fetchDetailedOrderItems = async (orderId: number) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await getOrderItems(orderId, token);

      if (response.success && response.data.items) {
        setDetailedOrderItems(prev => {
          const newMap = new Map(prev.set(orderId, response.data.items));
          return newMap;
        });
      }
    } catch (error) {
      console.error(`Error fetching detailed items for order ${orderId}:`, error);
    }
  };

  // Force refresh specific order data (useful when products are cancelled)
  const refreshOrderData = async (orderId: number) => {
    console.log(`[DEBUG] Force refreshing order data for ${orderId}`);
    await fetchDetailedOrderItems(orderId);

    // Also refresh main orders data
    const userData = getAuthUser();
    if (userData?.id) {
      await fetchOrders(userData.id);
    }
  };

  const fetchOrders = async (userId: number) => {
    if (!userId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Lấy token từ sessionStorage
      const token = getAuthToken();
      if (!token) {
        setError("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn");
        setIsLoading(false);
        return;
      }

      // Gọi API thực tế với cache busting
      const cacheBuster = new Date().getTime();
      const response = await axios.get<OrdersAPIResponse>(
        convertToAdminApiUrl(`/orders-id/${userId}?_t=${cacheBuster}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );

      // Kiểm tra và cập nhật dữ liệu
      if (response.data && response.data.orders) {
        setOrdersResponse(response.data);
        setApiOrders(response.data.orders);

        // Fetch detailed items for each order to get individual product status
        response.data.orders.forEach(order => {
          fetchDetailedOrderItems(order.id);
        });
      } else {
        setError("Dữ liệu đơn hàng không đúng định dạng");
      }
    } catch (error) {
      setError("Không thể tải dữ liệu đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);


  const fetchPromoCodes = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const res = await axios.get(convertToAdminApiUrl("/couponcodes/user-has-coupon"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("fetchPromoCodes: Dữ liệu mã giảm giá từ API:", res.data);
      const now = new Date();

      const updated = res.data
        .filter((coupon: Coupon) => coupon.couponStatus !== 0) // Chỉ lấy coupon hợp lệ
        .map((promo: any) => {
          const isFlashSale = Number(promo.isFlashSale) === 1;
          const commonFields = {
            ...promo,
            isFlashSale,
            timeRemaining: null,
          };

          if (isFlashSale) {
            const end = new Date(promo.validUntil);
            const diff = Math.max(0, end.getTime() - now.getTime());

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            return {
              ...commonFields,
              timeRemaining: { hours, minutes, seconds },
            };
          }

          return commonFields;
        });

      // ✅ Gọi 1 lần duy nhất
      setPromoCodes(updated);

    } catch (error) {
      console.error("Lỗi khi lấy mã giảm giá:", error);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const [userUsedCoupons, setUserUsedCoupons] = useState<{ code: string; status: number }[]>([]);
  const formatDateTime = (dateStr: string | Date) => {
    const date = new Date(dateStr);

    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    });
  };
  // Format price with commas
  // Get detailed product info including status
  const getProductDetails = (orderId: number, productId: number) => {
    const orderItems = detailedOrderItems.get(orderId);

    if (!orderItems) {
      return null;
    }

    // Try exact product ID match first
    let foundItem = orderItems.find(item => item.product && item.product.id === productId);

    // Try string comparison
    if (!foundItem) {
      foundItem = orderItems.find(item => item.product && String(item.product.id) === String(productId));
    }

    // Try item_id match  
    if (!foundItem) {
      foundItem = orderItems.find(item => item.item_id === productId);
    }

    return foundItem;
  };

  // Check if a product is cancelled
  const isProductCancelled = (orderId: number, productId: number) => {
    const productDetails = getProductDetails(orderId, productId);
    return productDetails?.status === 'CANCELLED';
  };

  // Check if order has mixed product statuses (some cancelled, some active)
  const hasPartiallyProcessedOrder = (order: OrderData) => {
    if (!order.products || order.products.length <= 1) return false;

    const productStatuses = order.products.map(product => {
      const productDetails = getProductDetails(order.id, product.id);
      let isCancelled = productDetails?.status === 'CANCELLED';

      // Fallback checks
      if (!isCancelled && product.status) {
        isCancelled = product.status === 'CANCELLED';
      }
      if (!isCancelled && (product.price === "0" || parseFloat(product.price) === 0)) {
        isCancelled = true;
      }

      return isCancelled;
    });

    // Check if we have both cancelled and non-cancelled products
    const hasCancelled = productStatuses.some(status => status === true);
    const hasActive = productStatuses.some(status => status === false);

    return hasCancelled && hasActive;
  };

  // Get display status - prioritize server status, then check local product status
  const getDisplayStatus = (order: OrderData) => {
    // If server already says CANCELLED, trust that
    if (order.status === "CANCELLED") {
      return "CANCELLED";
    }

    // If server says RETURNED, trust that  
    if (order.status === "RETURNED" || order.status === "RETURN") {
      return order.status;
    }

    // For other statuses, check if we have mixed products
    if (hasPartiallyProcessedOrder(order)) {
      return "PROCESSING"; // Mixed status -> show as processing
    }

    // Check if all products are cancelled locally (fallback)
    if (areAllProductsCancelled(order)) {
      return "CANCELLED";
    }

    return order.status;
  };

  // Check if all products in order are cancelled
  const areAllProductsCancelled = (order: OrderData) => {
    if (!order.products || order.products.length === 0) return false;

    return order.products.every(product => {
      const productDetails = getProductDetails(order.id, product.id);
      let isCancelled = productDetails?.status === 'CANCELLED';

      // Super aggressive fallback: if order is CANCELLED, assume all products are cancelled
      if (!isCancelled && order.status === 'CANCELLED') {
        isCancelled = true;
      }

      // Apply same fallback logic as in UI
      if (!isCancelled && product.status) {
        isCancelled = product.status === 'CANCELLED';
      }
      if (!isCancelled && (product.price === "0" || parseFloat(product.price) === 0)) {
        isCancelled = true;
      }
      if (!isCancelled && product.can_cancel === false && parseFloat(product.price) === 0) {
        isCancelled = true;
      }

      return isCancelled;
    });
  };

  // Get refund amount for cancelled product
  const getRefundAmount = (orderId: number, productId: number) => {
    const productDetails = getProductDetails(orderId, productId);
    if (productDetails?.status === 'CANCELLED') {
      return 0; // Cancelled products show 0 price
    }
    return null;
  };

  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === undefined || price === null) {
      return "0đ";
    }
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  // Hàm lấy URL hình ảnh đầu tiên từ chuỗi URL
  const getFirstImageUrl = (imageUrls: string): string => {
    if (!imageUrls) return "/images/products/default.png";

    // Nếu chuỗi chứa dấu phẩy, lấy URL đầu tiên
    if (imageUrls.includes(',')) {
      return imageUrls.split(',')[0].trim();
    }

    return imageUrls;
  };

  // Hàm tính tổng giá trị đơn hàng
  const calculateOrderTotal = (order: OrderData): number => {
    return parseFloat(order.total);
  };

  // Hàm tính tổng số lượng sản phẩm trong đơn hàng
  const calculateTotalQuantity = (order: OrderData): number => {
    return order.products.reduce((total, product) => total + product.quantity, 0);
  };

  // Hàm chuyển đổi trạng thái đơn hàng thành class CSS
  const getStatusClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    // console.log(`getStatusClass - original: "${status}", lowercase: "${statusLower}"`);

    let result = "";
    switch (statusLower) {
      case "pending":
        result = "pending";
        break;
      case "confirmed":
      case "processing":
        result = "confirmed";
        break;
      case "shipping":
      case "shipped":
        result = "shipping";
        break;
      case "completed":
      case "delivered":
      case "success":
        result = "completed";
        break;
      case "failed":
        result = "failed";
        break;

      case "cancelled":
        result = "cancelled";
        break;
      case "return":
      case "returned":
        result = "returned";
        break;
      default:
        result = "";
        break;
    }

    // console.log(`getStatusClass result: "${result}" for status: "${status}"`);
    return result;
  };

  // Hàm chuyển đổi trạng thái từ API sang tên hiển thị
  const getStatusDisplayName = (status: string): string => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return "Chờ xác nhận";
      case "processing":
      case "confirmed":
        return "Đang xử lý";
      case "shipping":
      case "shipped":
        return "Đang giao hàng";
      case "completed":
      case "delivered":
      case "success":  // Thêm trạng thái SUCCESS
        return "Hoàn thành";
      case "failed":
        return "Thất bại";
      case "cancelled":
        return "Đã hủy";
      case "return":
      case "returned":
        return "Trả hàng";
      default:
        return status;
    }
  };

  // Handle user info form submission
  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Lấy token từ sessionStorage
      const token = getAuthToken();
      if (!token) {
        toast.success("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn");
        return;
      }

      // Lấy thông tin người dùng từ sessionStorage để lấy ID
      const userData = getAuthUser();
      if (!userData) {
        toast.warn("Không tìm thấy thông tin người dùng");
        return;
      }

      const userId = userData.id;

      // Chuẩn bị dữ liệu để cập nhật
      const updatedUserInfo = {
        full_name: userInfo.name,
        phone: userInfo.phone,
        address:
          typeof userInfo.address === "string"
            ? userInfo.address
            : userInfo.address[0],
        // Giữ nguyên mật khẩu và role
        password: userData.password || "Thành phố Hồ Chí Minh",
        role: userData.role || "user",
      };

      // Gọi API cập nhật thông tin người dùng
      const response = await axios.put(
        convertToAdminApiUrl(`/users/${userId}`),
        updatedUserInfo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật thông tin người dùng trong sessionStorage
      const updatedUser = {
        ...userData,
        full_name: userInfo.name,
        phone: userInfo.phone,
        address:
          typeof userInfo.address === "string"
            ? userInfo.address
            : userInfo.address[0],
      };
      updateAuthUser(updatedUser);

      // Cập nhật state để tải lại thông tin người dùng
      setRefreshUserData((prev) => !prev);

      toast.success("Thông tin cá nhân đã được cập nhật!");
      setShowEditModal(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      toast.error("Cập nhật thông tin thất bại. Vui lòng thử lại sau.");
    }
  };

  // Handle adding new address
  const handleAddAddress = () => {
    const newAddress = prompt("Nhập địa chỉ mới:");
    if (newAddress && newAddress.trim() !== "") {
      setUserInfo({
        ...userInfo,
        address: Array.isArray(userInfo.address)
          ? [...userInfo.address, newAddress]
          : [userInfo.address, newAddress],
      });
    }
  };

  // State for password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Open API v2
  const OPEN_API = "https://provinces.open-api.vn/api/v2/";

  type Province = { code: number; name: string };
  type Ward = { code: number; name: string; division_type?: string; codename?: string; province_code?: number };

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // value của <select> dùng string cho chắc
  const [provinceCode, setProvinceCode] = useState<string>('');
  const [wardCode, setWardCode] = useState<string>('');

  // ô số nhà, tên đường (chúng ta sẽ ghép với ward + province)
  const [street, setStreet] = useState<string>('');
  const [pendingWardName, setPendingWardName] = useState<string>("");
  const vnNormalize = (s?: string) =>
    (s || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .toLowerCase().trim();

  useEffect(() => {
    if (!showEditModal) return;

    let abort = false;
    (async () => {
      try {
        const r = await fetch(`${OPEN_API}p`);
        const arr = await r.json();
        if (abort) return;

        const list: Province[] = Array.isArray(arr)
          ? arr.map((p: any) => ({ code: p.code, name: p.name }))
          : [];
        setProvinces(list);

        const addrStr = typeof userInfo.address === "string"
          ? userInfo.address
          : (Array.isArray(userInfo.address) && userInfo.address[0]) ? userInfo.address[0] : "";

        if (addrStr) {
          const parts = addrStr.split(",").map(s => s.trim());
          const pNameGuess = parts[parts.length - 1] || "";
          const wNameGuess = parts.length >= 2 ? parts[parts.length - 2] : "";
          const streetGuess = parts.slice(0, -2).join(", ");

          const pFound = list.find(p => vnNormalize(p.name) === vnNormalize(pNameGuess));
          setStreet(streetGuess);

          if (pFound) {
            setProvinceCode(String(pFound.code));   // sẽ kích hoạt useEffect #2
            setPendingWardName(wNameGuess);         // để lát nữa map vào wards
          } else {
            setProvinceCode("");
            setWardCode("");
            setWards([]);
          }
        } else {
          setStreet("");
          setProvinceCode("");
          setWardCode("");
          setWards([]);
        }
      } catch {
        setProvinces([]);
      }
    })();

    return () => { abort = true; };
  }, [showEditModal]);


  useEffect(() => {
    if (!provinceCode) { setWards([]); setWardCode(''); return; }

    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(`${OPEN_API}p/${provinceCode}?depth=2`, { signal: ac.signal });
        const data = await r.json();

        let list: Ward[] = Array.isArray(data?.wards) ? data.wards : [];
        if ((!list || list.length === 0) && Array.isArray(data?.districts)) {
          const wardBatches = await Promise.all(
            data.districts.map((d: any) =>
              fetch(`${OPEN_API}d/${d.code}`, { signal: ac.signal })
                .then(x => x.json())
                .catch(() => null)
            )
          );
          list = wardBatches.flatMap((d: any) =>
            Array.isArray(d?.wards) ? d.wards : []
          );
        }

        list = list.filter(w => {
          const t = (w.division_type || '').toLowerCase();
          return t === 'phường' || t === 'xã' || t === 'thị trấn';
        });

        setWards(list);
        // nếu user tự đổi tỉnh bằng tay, hãy xóa phường cũ:
        setWardCode(prev => pendingWardName ? prev : '');
      } catch {
        setWards([]); setWardCode('');
      }
    })();

    return () => ac.abort();
  }, [provinceCode]);

  useEffect(() => {
    if (!pendingWardName || wards.length === 0) return;
    const wFound = wards.find(w => vnNormalize(w.name) === vnNormalize(pendingWardName));
    if (wFound) setWardCode(String(wFound.code));
    setPendingWardName(""); // chỉ prefill 1 lần
  }, [wards, pendingWardName]);

  useEffect(() => {
    const pName = provinces.find(p => String(p.code) === provinceCode)?.name;
    const wName = wards.find(w => String(w.code) === wardCode)?.name;
    const combined = [street, wName, pName].filter(Boolean).join(', ');
    setUserInfo(prev => ({ ...prev, address: combined || prev.address }));
  }, [street, provinceCode, wardCode, provinces, wards]);

  // Hàm xử lý đổi mật khẩu
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.warn("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    try {
      // Lấy token từ sessionStorage
      const token = getAuthToken();
      if (!token) {
        toast.error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn");
        return;
      }

      // Lấy thông tin người dùng từ sessionStorage
      const userData = getAuthUser();
      if (!userData) {
        toast.error("Không tìm thấy thông tin người dùng");
        return;
      }

      const userId = userData.id;

      // Gọi API đổi mật khẩu
      const response = await axios.put(
        convertToAdminApiUrl(`/users/${userId}`),
        {
          password: passwordData.newPassword,
          // Giữ nguyên các thông tin khác
          full_name: userData.full_name || userData.name,
          phone: userData.phone,
          address: userData.address,
          role: userData.role || "user",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật thông tin người dùng trong sessionStorage
      const updatedUser = {
        ...userData,
        password: passwordData.newPassword,
      };
      updateAuthUser(updatedUser);

      // Thông báo thành công
      toast.success("Đổi mật khẩu thành công");

      // Cập nhật state để tải lại thông tin người dùng
      setRefreshUserData((prev) => !prev);

      // Đóng form
      setShowPasswordForm(false);

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      toast.error("Đổi mật khẩu thất bại. Vui lòng thử lại sau.");
    }
  };

  // Get filtered orders based on active filter
  const getFilteredOrders = () => {
    if (apiOrders.length === 0) {
      return [];
    }

    if (activeOrderFilter === "all") {
      return apiOrders;
    }

    const statusMap: Record<string, string> = {
      pending: "PENDING",
      confirmed: "CONFIRMED",
      shipping: "SHIPPING",
      completed: "SUCCESS",
      cancelled: "CANCELLED",
      returned: "RETURNED",
    };

    return apiOrders.filter(
      (order) => {
        const orderStatus = order.status.toUpperCase();
        const targetStatus = statusMap[activeOrderFilter];

        // Đặc biệt xử lý cho returned - bao gồm cả RETURN và RETURNED
        if (activeOrderFilter === "returned") {
          return orderStatus === "RETURNED" || orderStatus === "RETURN";
        }

        return orderStatus === targetStatus;
      }
    );
  };

  // Xử lý hủy đơn hàng - mở modal
  const handleCancelOrderClick = (orderId: number, orderHash: string) => {
    setSelectedOrderId(orderId);
    setSelectedOrderHash(orderHash);
    setShowCancelModal(true);
  };

  // Xử lý submit form hủy đơn hàng từ modal
  const handleCancelOrderSubmit = async (reason: string) => {
    if (!selectedOrderId) return;

    try {
      setIsCancelling(true);
      const result = await cancelOrder(selectedOrderId, reason);
      // console.log("Hủy đơn hàng thành công:", result);

      // Cập nhật lại danh sách đơn hàng
      const userData = getAuthUser();
      if (userData?.id) {
        await fetchOrders(userData.id);
      }

      toast.success("Đơn hàng đã được hủy thành công!");

      // Đóng modal và reset state
      setShowCancelModal(false);
      setSelectedOrderId(null);
      setSelectedOrderHash('');
    } catch (error: any) {
      console.error("Lỗi khi hủy đơn hàng:", error);

      // Hiển thị thông báo lỗi cụ thể từ API nếu có
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Lỗi: ${error.response.data.message}`);
      } else {
        toast.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  // Xử lý đóng modal hủy đơn hàng
  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setSelectedOrderId(null);
    setSelectedOrderHash('');
  };

  // Handle when a flash sale countdown completes
  const handleCountdownComplete = (index: number) => {
    setPromoCodes((prevCodes) => {
      const updatedCodes = [...prevCodes];
      updatedCodes[index] = {
        ...updatedCodes[index],
        isFlashSale: false, // End the flash sale when countdown completes
      };
      return updatedCodes;
    });
  };

  // Copy promo code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        toast.success("Mã giảm giá đã được sao chép!");
      })
      .catch((err) => {
        console.error("Không thể sao chép: ", err);
        toast.error("Không thể sao chép mã giảm giá. Vui lòng thử lại.");
      });
  };

  // Apply promo code
  const applyPromoCode = (code: string) => {
    toast.success(`Mã giảm giá ${code} đã được áp dụng!`);
    // Implement actual promo code application logic here
  };

  // Filter promo codes based on active filter
  const getFilteredPromoCodes = () => {
    if (activePromoFilter === "all") {
      return promoCodes;
    } else if (activePromoFilter === "flash") {
      return promoCodes.filter((promo) => promo.isFlashSale);
    } else if (activePromoFilter === "regular") {
      return promoCodes.filter((promo) => !promo.isFlashSale);
    }
    return promoCodes;
  };

  // Handle user logout
  const handleLogout = () => {
    try {
      // Xóa token và thông tin người dùng khỏi sessionStorage
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("user");

      // Thông báo đăng xuất thành công
      toast.success("Đăng xuất thành công!");

      // Chuyển hướng đến trang đăng nhập
      window.location.href = "/dang-nhap";
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.");
    }
  };

  // Update activeTab based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path === "/tai-khoan" || path === "/tai-khoan/") {
      setActiveTab("orders");
    } else if (path === "/tai-khoan/thong-tin") {
      setActiveTab("info");
    } else if (path === "/tai-khoan/ma-giam-gia") {
      setActiveTab("promo");
    } else if (path === "/tai-khoan/don-hang") {
      setActiveTab("wishlist");
    }
  }, [location.pathname]);

  // Handle tab navigation
  const handleTabNavigation = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "orders":
        navigate("/tai-khoan");
        break;
      case "info":
        navigate("/tai-khoan/thong-tin");
        break;
      case "promo":
        navigate("/tai-khoan/ma-giam-gia");
        break;
      case "wishlist":
        navigate("/tai-khoan/don-hang");
        break;
      default:
        navigate("/tai-khoan");
    }
  };

  const retryFetchOrders = () => {
    const userData = getAuthUser();
    if (userData?.id) {
      fetchOrders(userData.id);
    }
  };

  const accountHero = (
    <PageHero
      title="Tài khoản của bạn"
      breadcrumbs={[{ label: "Trang chủ", to: "/" }, { label: "Tài khoản" }]}
    />
  );

  if (!getAuthToken()) {
    return (
      <>
        {accountHero}
        <div className="account-guest">
          <EmptyState
            title="Đăng nhập để xem tài khoản"
            message="Theo dõi đơn hàng, quản lý địa chỉ và mã giảm giá sau khi đăng nhập."
            actionLabel="Đăng nhập"
            actionTo="/dang-nhap"
            secondaryActionLabel="Tạo tài khoản"
            secondaryActionTo="/dang-ky"
          />
        </div>
      </>
    );
  }

  return (
    <>
      {accountHero}
      <div className="user-account-page">
        <div className="container">
          <div className="account-wrapper">
            {/* Sidebar Navigation */}
            <div className="account-sidebar">
              <div className="sidebar-header">
                <h3>Quản lý tài khoản</h3>
              </div>
              <ul className="sidebar-menu">
                <li className={activeTab === "orders" ? "active" : ""}>
                  <button onClick={() => handleTabNavigation("orders")}>
                    <i className="icon-box">
                      <img src="/images/icons/Puzzle.svg" alt="icon-box" />
                    </i>
                    <span>Tổng quan</span>
                  </button>
                </li>
                <li className={activeTab === "info" ? "active" : ""}>
                  <button onClick={() => handleTabNavigation("info")}>
                    <i className="icon-user">
                      <img src="/images/icons/User_02.svg" alt="icon-box" />
                    </i>
                    <span>Thông tin cá nhân</span>
                  </button>
                </li>
                <li className={activeTab === "promo" ? "active" : ""}>
                  <button onClick={() => handleTabNavigation("promo")}>
                    <i className="icon-gift">
                      <img
                        src="/images/icons/Ticket_Voucher.svg"
                        alt="icon-box"
                      />
                    </i>
                    <span>Mã giảm giá</span>
                  </button>
                </li>
                <li className={activeTab === "wishlist" ? "active" : ""}>
                  <button onClick={() => handleTabNavigation("wishlist")}>
                    <i className="icon-heart">
                      <img
                        src="/images/icons/Shopping_Cart_02.svg"
                        alt="icon-box"
                      />
                    </i>
                    <span>Đơn hàng</span>
                  </button>
                </li>
                <li>
                  <button onClick={handleLogout}>
                    <i className="icon-logout">
                      <img src="/images/icons/Log_Out.svg" alt="icon-box" />
                    </i>
                    <span>Đăng xuất</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Main Content Area */}
            <div className="account-content">
              {activeTab === "orders" && (
                <div className="content-section orders-section">
                  <div className="content-section orders-header">
                    <h2 className="orders-header__name">
                      Xin chào, {userInfo.name}
                    </h2>
                    <div className="orders-header__email">
                      Email: {userInfo.email}
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="loading-state">
                      <PageSectionSkeleton variant="account-list" count={3} />
                    </div>
                  ) : error ? (
                    <div className="error-state">
                      <RetryState
                        message={error}
                        onRetry={retryFetchOrders}
                        secondaryActionLabel="Khám phá sản phẩm"
                        secondaryActionTo="/san-pham"
                      />
                    </div>
                  ) : apiOrders.length > 0 ? (
                    <div className="order-list">
                      {apiOrders.map((order) => (
                        <div className="order-item" key={order.id}>
                          <div className="order-header">
                            <div className="aside">
                              <div className="order-info">
                                <span className="label">Đơn hàng: </span>
                                <span className="value">{order.order_hash}</span>
                              </div>
                              <div className="order-info">
                                <span className="label">Ngày đặt: </span>
                                <span className="value">
                                  {new Date(order.date).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                            <div className="order-status">
                              <span
                                className={`status ${getStatusClass(getDisplayStatus(order))}`}
                              >
                                {getStatusDisplayName(getDisplayStatus(order))}
                              </span>
                            </div>
                          </div>

                          <div className="order-content">
                            {order.products && order.products.length > 0 && (
                              <>
                                <div className="product-image">
                                  <img
                                    src={getFirstImageUrl(order.products[0].image)}
                                    alt={order.products[0].name}
                                  />
                                </div>

                                <div className="product-details">
                                  <h4>{order.products[0].name}</h4>
                                  <span className="product-price">
                                    <span className="label">Thành tiền: </span>
                                    {formatPrice(parseFloat(order.total))}
                                  </span>
                                  <div className="product-meta">
                                    <div className="meta-item">
                                      <span className="label">Số lượng sản phẩm:</span>
                                      <span className="value">
                                        {calculateTotalQuantity(order)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="product-link">
                                    <Link to={`/san-pham/${order.products[0].slug}`}>
                                      Xem sản phẩm
                                    </Link>
                                  </div>
                                </div>
                              </>
                            )}

                            <div className="order-pricing">
                              <h4>Thông tin</h4>
                              <div className="price-info">
                                <span className="label">Tên người nhận: </span>
                                <span className="value">{order.recipientName}</span>
                              </div>
                              <div className="delivery-info">
                                <span className="label">Số điện thoại: </span>
                                <span className="value">{order.recipientPhone}</span>
                              </div>
                              <div className="total-info">
                                <span className="label">Địa chỉ: </span>
                                <span className="value">
                                  {order.address}
                                </span>
                              </div>
                              <div className="order-actions">
                                {/* <button className="btn-outline">
                                  {order.status === "PENDING" ? "Chờ" : "Xem"}
                                </button> */}
                                <Link
                                  to={`/chi-tiet-don-hang/${order.order_hash}`}
                                  className="btn-primary"
                                >
                                  Xem chi tiết
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <EmptyState
                        title="Bạn chưa có đơn hàng nào"
                        message="Các đơn hàng mới sẽ xuất hiện tại đây sau khi bạn hoàn tất thanh toán."
                        actionLabel="Khám phá sản phẩm"
                        actionTo="/san-pham"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Personal Information Tab */}
              {activeTab === "info" && (
                <div className="content-section info-section">
                  {!showPasswordForm ? (
                    <div className="profile-info-container">
                      <div className="heading-content">
                        <h2>Hồ sơ cá nhân</h2>
                        <p>
                          Xem và cập nhật thông tin hồ sơ của bạn, bao gồm tên,
                          email và số điện thoại của bạn. Bạn cũng có thể cập
                          nhật địa chỉ thanh toán hoặc thay đổi mật khẩu của
                          mình.
                        </p>
                      </div>
                      <div className="profile-info-header">
                        <h3>Thông tin cá nhân</h3>
                      </div>

                      <div className="profile-info-grid">
                        <div className="profile-info-item">
                          <div className="info-label">Tên</div>
                          <div className="info-value">
                            {userInfo.full_name || userInfo.name}
                          </div>
                        </div>

                        <div className="profile-info-item">
                          <div className="info-label">Email</div>
                          <div className="info-value">{userInfo.email}</div>
                        </div>

                        <div className="profile-info-item">
                          <div className="info-label">Số điện thoại</div>
                          <div className="info-value">{userInfo.phone}</div>
                        </div>

                        <div className="profile-info-item">
                          <div className="info-label">Địa chỉ</div>
                          <div className="info-value">
                            {typeof userInfo.address === "string"
                              ? userInfo.address
                              : userInfo.address && userInfo.address.length > 0
                                ? userInfo.address[0]
                                : "Chưa cập nhật địa chỉ"}
                          </div>
                        </div>
                      </div>

                      <div className="profile-actions">
                        <button
                          className="btn-secondary"
                          onClick={() => setShowPasswordForm(true)}
                        >
                          Đổi mật khẩu
                        </button>
                        <button
                          className="btn-primary"
                          onClick={() => setShowEditModal(true)}
                        >
                          Chỉnh sửa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-info-container">
                      <div className="profile-info-header">
                        <h3>Đổi mật khẩu</h3>
                      </div>

                      <div className="password-change-container">
                        <p className="password-instruction">
                          Bạn có thể thay đổi mật khẩu tài khoản của mình tại
                          đây. Vui lòng nhập mật khẩu hiện tại, sau đó nhập mật
                          khẩu mới và xác nhận lại để hoàn tất quá trình. Đảm
                          bảo mật khẩu mới có độ bảo mật cao để bảo vệ tài khoản
                          của bạn.
                        </p>

                        <form
                          className="password-form"
                          onSubmit={handlePasswordChange}
                        >
                          <div className="form-group">
                            <div className="info-label">Nhập mật khẩu cũ</div>
                            <input
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  currentPassword: e.target.value,
                                })
                              }
                              className="password-input"
                              placeholder="Mật khẩu cũ"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <div className="info-label">Nhập mật khẩu mới</div>
                            <input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  newPassword: e.target.value,
                                })
                              }
                              className="password-input"
                              placeholder="Mật khẩu mới"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <div className="info-label">
                              Nhập lại mật khẩu mới
                            </div>
                            <input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="password-input"
                              placeholder="Nhập lại mật khẩu mới"
                              required
                            />
                          </div>

                          <div className="forgot-password">
                            <a href="#">Quên mật khẩu?</a>
                          </div>

                          <div className="password-actions">
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => {
                                setShowPasswordForm(false);
                                setPasswordData({
                                  currentPassword: "",
                                  newPassword: "",
                                  confirmPassword: "",
                                });
                              }}
                            >
                              Trở về
                            </button>
                            <button type="submit" className="btn-primary">
                              Xác nhận
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Modal chỉnh sửa thông tin */}
                  {showEditModal && (
                    <div className="modal-overlay">
                      <div className="modal-content">
                        <h3>Chỉnh sửa thông tin</h3>
                        <form
                          className="info-form"
                          onSubmit={handleUserInfoSubmit}
                        >
                          <div className="form-group">
                            <label htmlFor="fullName">Họ và tên</label>
                            <input
                              type="text"
                              id="fullName"
                              value={userInfo.name}
                              onChange={(e) =>
                                setUserInfo({
                                  ...userInfo,
                                  name: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                              type="email"
                              id="email"
                              value={userInfo.email}
                              onChange={(e) =>
                                setUserInfo({
                                  ...userInfo,
                                  email: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                              type="tel"
                              id="phone"
                              value={userInfo.phone}
                              onChange={(e) =>
                                setUserInfo({
                                  ...userInfo,
                                  phone: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="address">Địa chỉ</label>

                            {/* Tỉnh/Thành */}
                            <select
                              aria-label="Tỉnh/Thành phố"
                              value={provinceCode}
                              onChange={(e) => setProvinceCode(e.target.value)}
                            >
                              <option value="">Chọn Tỉnh/Thành phố (Việt Nam)</option>
                              {provinces.map(p => (
                                <option key={p.code} value={String(p.code)}>{p.name}</option>
                              ))}
                            </select>

                            {/* Phường/Xã */}
                            <select
                              aria-label="Phường/Xã"
                              value={wardCode}
                              onChange={(e) => setWardCode(e.target.value)}
                              disabled={!provinceCode}
                              style={{ marginTop: 10 }}
                            >
                              <option value="">Chọn Phường/Xã</option>
                              {wards.map(w => (
                                <option key={w.code} value={String(w.code)}>{w.name}</option>
                              ))}
                            </select>

                            {/* Số nhà, tên đường */}
                            <input
                              type="text"
                              placeholder="Số nhà, tên đường"
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              style={{ marginTop: 10 }}
                            />
                          </div>


                          <div className="modal-actions">
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => setShowEditModal(false)}
                            >
                              Hủy
                            </button>
                            <button type="submit" className="btn-primary">
                              Lưu thay đổi
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="content-section addresses-section">
                  <h2>Sổ địa chỉ</h2>

                  <div className="addresses-list">
                    {Array.isArray(userInfo.address) ? (
                      userInfo.address.map((address, index) => (
                        <div className="address-item" key={index}>
                          <div className="address-content">
                            <h4>
                              {index === 0
                                ? "Địa chỉ mặc định"
                                : `Địa chỉ ${index + 1}`}
                            </h4>
                            <p>{address}</p>
                          </div>
                          <div className="address-actions">
                            <button className="btn-link">Sửa</button>
                            {index !== 0 && (
                              <button
                                className="btn-link delete"
                                onClick={() => {
                                  const newAddresses = [
                                    ...(userInfo.address as string[]),
                                  ];
                                  newAddresses.splice(index, 1);
                                  setUserInfo({
                                    ...userInfo,
                                    address: newAddresses,
                                  });
                                }}
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="address-item">
                        <div className="address-content">
                          <h4>Địa chỉ mặc định</h4>
                          <p>{userInfo.address}</p>
                        </div>
                        <div className="address-actions">
                          <button className="btn-link">Sửa</button>
                        </div>
                      </div>
                    )}

                    <button
                      className="btn-add-address"
                      onClick={handleAddAddress}
                    >
                      <i className="icon-plus"></i>
                      <span>Thêm địa chỉ mới</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Promo Codes Tab */}
              {activeTab === "promo" && (
                <div className="content-section promo-section">
                  <h2>Mã giảm giá</h2>
                  <p className="promo-description-text">
                    Xem và quản lý các mã giảm giá hiện có của bạn. Bạn có thể
                    kiểm tra thông tin chi tiết về từng mã, bao gồm giá trị ưu
                    đãi, điều kiện áp dụng và ngày hết hạn.
                  </p>

                  <div className="promo-section-header">
                    <h3>Mã giảm giá của bạn</h3>
                  </div>

                  {/* Add tab filter for promo codes */}
                  <div className="order-filter-tabs">
                    <button
                      className={activePromoFilter === "all" ? "active" : ""}
                      onClick={() => setActivePromoFilter("all")}
                    >
                      Tất cả
                    </button>
                    <button
                      className={activePromoFilter === "flash" ? "active" : ""}
                      onClick={() => setActivePromoFilter("flash")}
                    >
                      Flash Sale
                    </button>
                    <button
                      className={
                        activePromoFilter === "regular" ? "active" : ""
                      }
                      onClick={() => setActivePromoFilter("regular")}
                    >
                      Thường xuyên
                    </button>
                  </div>

                  <div className="voucher-grid">
                    {getFilteredPromoCodes().map((promo, index) => {
                      const isUsedUp = Number(promo.used) === 0;

                      return (
                        <div
                          className={`voucher-card ${isUsedUp ? "voucher-disabled" : ""}`}
                          key={index}
                        >
                          <div className="voucher-header">
                            <div className="voucher-discount">{promo.discount}</div>
                            <div className="voucher-type">{promo.description}</div>
                          </div>

                          <div className="voucher-code">
                            <span>Code: {promo.code}</span>
                          </div>

                          {promo.isFlashSale && promo.timeRemaining && (
                            <div className="flash-sale-banner">
                              <div className="flash-icon">⚡</div>
                              <div className="flash-text">Flash sale</div>
                              <CountdownTimer
                                hours={promo.timeRemaining.hours}
                                minutes={promo.timeRemaining.minutes}
                                seconds={promo.timeRemaining.seconds}
                                onComplete={() => handleCountdownComplete(index)}
                              />
                            </div>
                          )}

                          <div className="voucher-details">
                            <ul className="voucher-info-list">
                              <li>
                                <span>
                                  {formatDateTime(promo.validFrom)} - {formatDateTime(promo.validUntil)}
                                </span>
                              </li>
                              <li>
                                <span>{promo.description}</span>
                              </li>
                              <li>
                                <span>Ưu đãi: Cho khách hàng</span>
                              </li>
                            </ul>
                          </div>

                          <div className="voucher-actions">
                            <button
                              className="btn-copy"
                              onClick={() => {
                                if (!isUsedUp) copyToClipboard(promo.code);
                              }}
                              disabled={isUsedUp}
                            >
                              <img src="/images/icons/content_copy.svg" alt="" />
                              <span>{isUsedUp ? "Hết lượt sử dụng" : "Copy"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* Wishlist Tab (renamed to Order Management) */}
              {activeTab === "wishlist" && (
                <div className="content-section orders-management-section">
                  <h2>Đơn hàng của bạn</h2>

                  <div className="order-filter-tabs">
                    <button
                      className={activeOrderFilter === "all" ? "active" : ""}
                      onClick={() => setActiveOrderFilter("all")}
                    >
                      Tất cả
                    </button>
                    <button
                      className={
                        activeOrderFilter === "pending" ? "active" : ""
                      }
                      onClick={() => setActiveOrderFilter("pending")}
                    >
                      Chờ xác nhận
                    </button>
                    <button
                      className={
                        activeOrderFilter === "shipping" ? "active" : ""
                      }
                      onClick={() => setActiveOrderFilter("shipping")}
                    >
                      Đang giao hàng
                    </button>
                    <button
                      className={
                        activeOrderFilter === "completed" ? "active" : ""
                      }
                      onClick={() => setActiveOrderFilter("completed")}
                    >
                      Hoàn thành
                    </button>
                    <button
                      className={
                        activeOrderFilter === "cancelled" ? "active" : ""
                      }
                      onClick={() => setActiveOrderFilter("cancelled")}
                    >
                      Đã hủy
                    </button>
                    <button
                      className={
                        activeOrderFilter === "returned" ? "active" : ""
                      }
                      onClick={() => setActiveOrderFilter("returned")}
                    >
                      Trả hàng/hoàn tiền
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="loading-state">
                      <PageSectionSkeleton variant="account-list" count={3} />
                    </div>
                  ) : error ? (
                    <div className="error-state">
                      <RetryState
                        message={error}
                        onRetry={retryFetchOrders}
                        secondaryActionLabel="Khám phá sản phẩm"
                        secondaryActionTo="/san-pham"
                      />
                    </div>
                  ) : getFilteredOrders().length > 0 ? (
                    <div className="order-list-container">
                      {getFilteredOrders().map((order, index) => (
                        <div className="order-item" key={`order-detail-${index}`}>
                          <div className="order-header">
                            <div className="order-number">
                              <span>Đơn hàng: {order.order_hash}</span>
                              <span>Ngày đặt: {new Date(order.date).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="order-status">
                              <span className={`status ${getStatusClass(getDisplayStatus(order))}`}>
                                {getStatusDisplayName(getDisplayStatus(order))}
                              </span>
                            </div>
                          </div>

                          {order.products && order.products.map((product, itemIndex) => {
                            const productDetails = getProductDetails(order.id, product.id);

                            let isCancelled = productDetails?.status === 'CANCELLED';

                            // SUPER AGGRESSIVE FALLBACK: If order is CANCELLED, assume all products are cancelled
                            if (!isCancelled && order.status === 'CANCELLED') {
                              isCancelled = true;
                            }

                            // Fallback: check if product has status field
                            if (!isCancelled && product.status) {
                              isCancelled = product.status === 'CANCELLED';
                            }

                            // Another fallback: if price is "0" it might be cancelled
                            if (!isCancelled && (product.price === "0" || parseFloat(product.price) === 0)) {
                              isCancelled = true;
                            }

                            // Additional fallback: check for can_cancel = false (might indicate already cancelled)
                            if (!isCancelled && product.can_cancel === false && parseFloat(product.price) === 0) {
                              isCancelled = true;
                            }

                            return (
                              <div className="order-content" key={`item-${itemIndex}`}>
                                <div className="product-image">
                                  <img
                                    src={getFirstImageUrl(product.image)}
                                    alt={product.name}
                                    style={{
                                      opacity: isCancelled ? 0.6 : 1,
                                      filter: isCancelled ? 'grayscale(50%)' : 'none'
                                    }}
                                  />
                                </div>

                                <div className="product-details">
                                  <h4 style={{
                                    textDecoration: isCancelled ? 'line-through' : 'none',
                                    color: isCancelled ? '#999' : 'inherit'
                                  }}>
                                    {product.name}
                                    {isCancelled && <span style={{ color: '#ff4757', marginLeft: '10px', fontSize: '14px' }}>(Đã hủy)</span>}
                                  </h4>
                                  <p className="product-category">{product.category}</p>
                                  <div className="product-price">
                                    {isCancelled ? (
                                      <span style={{ color: '#ff4757', fontWeight: 'bold' }}>
                                        Đã hủy
                                      </span>
                                    ) : (
                                      <span>
                                        Thành tiền: {formatPrice(parseFloat(product.price) * product.quantity)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="product-meta">
                                    {product.color && (
                                      <div className="meta-item">
                                        <span>Màu: {product.color.name}</span>
                                        <span
                                          className="color-dot"
                                          style={{ backgroundColor: product.color.hex }}
                                        ></span>
                                      </div>
                                    )}
                                    <div className="meta-item">
                                      <span>Số lượng: {product.quantity}</span>
                                    </div>
                                  </div>
                                  <div className="product-link">
                                    <Link to={`/san-pham/${product.slug}`}>Xem sản phẩm</Link>
                                  </div>
                                </div>

                                <div className="order-info">
                                  <h4>Thông tin:</h4>
                                  <div className="info-item">
                                    <span className="value">
                                      {order.recipientName}
                                    </span>
                                  </div>
                                  <div className="info-item">
                                    <span className="value">
                                      {order.recipientPhone}
                                    </span>
                                  </div>
                                  <div className="info-item">
                                    <span className="value">
                                      {order.address}
                                    </span>
                                  </div>

                                  <div className="order-actions">
                                    {order.status === "PENDING" && !isCancelled && (
                                      <>
                                        <button
                                          className="btn-cancel-order"
                                          onClick={() => handleCancelOrderClick(order.id, order.order_hash)}
                                          disabled={isCancelling}
                                        >
                                          {isCancelling ? "Đang xử lý..." : "Hủy đơn hàng"}
                                        </button>
                                        <Link to={`/chi-tiet-don-hang/${order.order_hash}`} className="btn-view-details">
                                          Xem chi tiết
                                        </Link>
                                      </>
                                    )}

                                    {order.status === "PENDING" && isCancelled && (
                                      <>
                                        <Link to={`/san-pham/${product.slug}`} className="btn-action-primary">
                                          Mua lại
                                        </Link>
                                        <Link to={`/chi-tiet-don-hang/${order.order_hash}`} className="btn-view-details">
                                          Xem chi tiết
                                        </Link>
                                      </>
                                    )}

                                    {order.status === "CONFIRMED" && (
                                      <>
                                        <Link to={`/chi-tiet-don-hang/${order.order_hash}`} className="btn-view-details">
                                          Xem chi tiết
                                        </Link>
                                      </>
                                    )}

                                    {order.status === "SHIPPING" && (
                                      <>
                                        <Link to={`/chi-tiet-don-hang/${order.order_hash}`} className="btn-view-details">
                                          Xem chi tiết
                                        </Link>
                                      </>
                                    )}

                                    {order.status === "SUCCESS" && (
                                      <>
                                        <Link to={`/san-pham/${product.slug}`} className="btn-action-primary">
                                          Mua lại
                                        </Link>
                                        <Link to={`/chi-tiet-don-hang/${order.order_hash}`} className="btn-view-details">
                                          Xem chi tiết
                                        </Link>
                                      </>
                                    )}

                                    {order.status === "CANCELLED" && (
                                      <>
                                        <Link to={`/san-pham/${product.slug}`} className="btn-action-primary">
                                          Mua lại
                                        </Link>
                                        <Link to={`/chi-tiet-don-hang/${order.order_hash}`} className="btn-view-details">
                                          Xem chi tiết
                                        </Link>
                                      </>
                                    )}

                                    {(order.status === "RETURNED" || order.status === "RETURN") && (
                                      <>
                                        <Link to={`/san-pham/${product.slug}`} className="btn-action-primary">
                                          Mua lại
                                        </Link>
                                        <Link to={`/chi-tiet-don-hang/${order.order_hash}`} className="btn-view-details">
                                          Xem chi tiết
                                        </Link>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <EmptyState
                        title="Không có đơn hàng nào trong trạng thái này"
                        message="Hãy đổi bộ lọc hoặc tiếp tục mua sắm để tạo đơn hàng mới."
                        actionLabel="Tiếp tục mua sắm"
                        actionTo="/san-pham"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Design Services Showcase */}
      </div>

      {/* Modal hủy đơn hàng */}
      {showCancelModal && (
        <Suspense fallback={null}>
          <CancelOrderModal
            visible={showCancelModal}
            onCancel={handleCancelModalClose}
            onSubmit={handleCancelOrderSubmit}
            loading={isCancelling}
            orderHash={selectedOrderHash}
            orderId={selectedOrderId || undefined}
          />
        </Suspense>
      )}
    </>
  );
};

export default User;
const CancelOrderModal = lazy(() => import("../../components/CancelOrderModal"));
