import React, { Suspense, lazy, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import axios from "axios";
import { returnOrder } from "../../services/ordersService";
import { cancelOrder } from "../../services/userServices";
import { convertToAdminApiUrl } from "../../utils/url";
import { Modal } from "antd";
import { getOrderItems, OrderItem, cancelOrderProduct } from "../../api/order";
import { getAuthToken } from "../../services/loginService";
import { PageSectionSkeleton, RetryState } from "../../components/StateFeedback";
import { toast } from "react-toastify";

const ReturnOrderModal = lazy(() => import("../../components/ReturnOrderModal"));
const CancelOrderModal = lazy(() => import("../../components/CancelOrderModal"));

interface OrderProduct {
  order_item_id: string;
  product_id: string;
  name: string;
  image: string;
  price: number;
  color: { name: string; hex: string };
  size: string;
  quantity: number;
  slug: string;
  has_comment?: boolean;
  commented?: boolean;
  is_cancelled?: boolean;
  status?: string;
}

interface OrderDetails {
  id?: number;
  order_hash: string;
  date: string;
  status: string;
  statusStep: number;
  processType?: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  subtotal: number;
  shippingFee: number;
  couponValue: number;
  discount: number;
  total: number;
  products: OrderProduct[];
  returnInfo?: {
    return_id: number;
    reason: string;
    return_type: string;
    total_refund: string;
    return_status: string;
    return_created_at: string;
    return_updated_at: string;
  };
}

const firstImageUrl = (value: unknown): string => {
  if (Array.isArray(value)) {
    return String(value.find((image) => String(image || "").trim()) || "/images/default.jpg");
  }

  return String(value || "")
    .split(",")
    .map((image) => image.trim())
    .find(Boolean) || "/images/default.jpg";
};

const DetailOrder: React.FC = () => {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isOrderLoading, setIsOrderLoading] = useState(true);
  const [orderLoadError, setOrderLoadError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const [detailedOrderItems, setDetailedOrderItems] = useState<Map<string, OrderItem[]>>(new Map());
  const starFilledImg = "/images/404/star-filled.svg";
  const starOutlineImg = "/images/404/star-outline.svg";
  const ratingLabels = ["", "Rất tệ", "Tệ", "Trung bình", "Tốt", "Rất tốt"];
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentReviewProduct, setCurrentReviewProduct] =
    useState<OrderProduct | null>(null);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewDescription, setReviewDescription] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [allProductsReviewed, setAllProductsReviewed] = useState(false);
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingProductId, setCancellingProductId] = useState<string | null>(null);

  const fetchOrder = async () => {
    setIsOrderLoading(true);
    setOrderLoadError(null);
    try {
      const token = getAuthToken();
      const res = await axios.get(
          convertToAdminApiUrl(`/orders/hash/${id}?_t=${Date.now()}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );
      if (res.data.success) {
        const mappedProducts: OrderProduct[] = res.data.order.products.map(
          (p: any) => {
            return {
              order_item_id: p.id || p.item_id || p.order_item_id,
              product_id: p.product_id || p.id,
              name: p.product_name || p.name,
              image: firstImageUrl(p.image || p.product_image),
              price: p.price_sale ?? p.price,
              quantity: p.quantity,
              slug: p.slug,
              color: {
                name: p.color_name,
                hex: p.color_hex,
              },
              has_comment: p.has_comment,
              is_cancelled: p.is_cancelled || false,
              status: p.status || 'active'
            };
          }
        );
        
        // Map order data and ensure processType and statusStep are properly set
        const orderData = {
          ...res.data.order,
          products: mappedProducts,
          processType: res.data.order.processType || undefined,
          statusStep: res.data.order.statusStep !== null && res.data.order.statusStep !== undefined 
            ? res.data.order.statusStep 
            : 1,
          returnInfo: res.data.order.returnInfo || undefined
        };
        
        setOrder(orderData);
        
        // Fetch detailed order items for enhanced cancelled product detection
        if (orderData.id) {
          await fetchDetailedOrderItems(orderData.id);
        }
        
        const allCommented = mappedProducts.every(
          (product) => product.has_comment
        );
        setAllProductsReviewed(allCommented);
      } else {
        setOrder(null);
        setOrderLoadError(res.data.message || "Không thể tải thông tin đơn hàng.");
      }
    } catch (err) {
      setOrder(null);
      setOrderLoadError("Không thể tải thông tin đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsOrderLoading(false);
    }
  };

  // Enhanced API call to get detailed order items with cache busting
  const fetchDetailedOrderItems = async (orderId: number) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await getOrderItems(orderId, token);
      
      if (response.success && response.data?.items) {
        const orderHash = response.data.order.hash || id || '';
        setDetailedOrderItems(prev => new Map(prev.set(orderHash, response.data.items)));
      }
    } catch (error) {
      console.error("Error fetching detailed order items:", error);
    }
  };

  // Enhanced product details lookup with multiple ID matching strategies
  const getProductDetails = (product: OrderProduct, orderHash: string): OrderItem | null => {
    const items = detailedOrderItems.get(orderHash);
    if (!items || !Array.isArray(items)) return null;

    // Multiple ID matching strategies for robust detection
    const matchingItem = items.find(item => {
      return (
        item.item_id?.toString() === product.order_item_id?.toString() ||
        item.product?.id?.toString() === product.product_id?.toString() ||
        item.item_id?.toString() === product.product_id?.toString() ||
        (item.product?.name === product.name && item.quantity === product.quantity)
      );
    });

    return matchingItem || null;
  };

  // Get display status with server status prioritization
  const getDisplayStatus = (product: OrderProduct, orderHash: string): string => {
    // Server status check first
    if (product.status && product.status.toLowerCase().includes('cancel')) {
      return 'Đã hủy';
    }
    
    if (product.is_cancelled === true) {
      return 'Đã hủy';
    }

    // API data status check
    const detailItem = getProductDetails(product, orderHash);
    if (detailItem?.status) {
      const statusLower = detailItem.status.toLowerCase();
      if (statusLower.includes('cancel') || statusLower.includes('hủy') || statusLower.includes('huy')) {
        return 'Đã hủy';
      }
      if (statusLower.includes('return_requested')) {
        return 'Đang yêu cầu trả hàng';
      }
      if (statusLower.includes('return')) {
        return 'Đang trả hàng';
      }
    }

    // Super aggressive fallback - if order is cancelled, assume all products are cancelled
    if (order?.status === 'CANCELLED') {
      return 'Đã hủy';
    }

    return '';
  };

  // Check if product is cancelled with comprehensive detection
  const isProductCancelled = (product: OrderProduct, orderHash: string): boolean => {
    // Direct status check
    if (product.is_cancelled === true) return true;
    if (product.status && product.status.toLowerCase().includes('cancel')) return true;

    // API data check
    const detailItem = getProductDetails(product, orderHash);
    if (detailItem?.status) {
      const statusLower = detailItem.status.toLowerCase();
      if (statusLower.includes('cancel') || statusLower.includes('hủy') || statusLower.includes('huy')) {
        return true;
      }
    }

    // Super aggressive fallback
    if (order?.status === 'CANCELLED') return true;

    return false;
  };

  // Check if all products in order are cancelled
  const areAllProductsCancelled = (products: OrderProduct[], orderHash: string): boolean => {
    if (!products || products.length === 0) return false;
    
    // If order status is CANCELLED, assume all products are cancelled
    if (order?.status === 'CANCELLED') return true;
    
    return products.every(product => isProductCancelled(product, orderHash));
  };

  // Check if individual product can be cancelled
  const canCancelProduct = (product: OrderProduct): boolean => {
    // Don't allow cancelling already cancelled products
    if (isProductCancelled(product, order?.order_hash || '')) return false;
    
    // Don't allow cancelling if product is in return process
    const detailItem = getProductDetails(product, order?.order_hash || '');
    if (detailItem?.status) {
      const statusLower = detailItem.status.toLowerCase();
      if (statusLower.includes('return') || statusLower.includes('trả')) {
        return false;
      }
    }
    
    // Only allow cancelling if order is in cancellable states
    if (!order) return false;
    
    const cancellableOrderStatuses = ['PENDING', 'CONFIRMED', 'APPROVED'];
    return cancellableOrderStatuses.includes(order.status);
  };

  // Get reason why product cannot be cancelled (for better UX)
  const getCannotCancelReason = (product: OrderProduct): string => {
    if (isProductCancelled(product, order?.order_hash || '')) {
      return 'Sản phẩm đã được hủy';
    }
    
    const detailItem = getProductDetails(product, order?.order_hash || '');
    if (detailItem?.status) {
      const statusLower = detailItem.status.toLowerCase();
      if (statusLower.includes('return_requested')) {
        return 'Sản phẩm đang trong quá trình yêu cầu trả hàng';
      }
      if (statusLower.includes('return')) {
        return 'Sản phẩm đang trong quá trình trả hàng';
      }
    }
    
    if (!order) return 'Không thể xác định trạng thái đơn hàng';
    
    const cancellableOrderStatuses = ['PENDING', 'CONFIRMED', 'APPROVED'];
    if (!cancellableOrderStatuses.includes(order.status)) {
      return 'Đơn hàng đã ở trạng thái không thể hủy';
    }
    
    return 'Không thể hủy sản phẩm này';
  };

  useEffect(() => {
    fetchOrder();
    
  }, [id]);

  useEffect(() => {
    if (order && order.products) {
      const allCommented = order.products.every(
        (product) => product.has_comment
      );
      setAllProductsReviewed(allCommented);
    }
  }, [order]);

  const formatDate = (dateString: string): string | undefined => {
    const date = new Date(dateString);
    const DD = ("0" + date.getDate()).slice(-2);
    const MM = ("0" + (date.getMonth() + 1)).slice(-2);
    const YYYY = date.getFullYear();
    const HH = ("0" + date.getHours()).slice(-2);
    const mm = ("0" + date.getMinutes()).slice(-2);
    const ss = ("0" + date.getSeconds()).slice(-2);
    return `${DD}/${MM}/${YYYY} ${HH}:${mm}:${ss}`;
  };

  const formatPrice = (price: number): string => {
    const rounded = Math.round(price);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const translateOrderStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "SHIPPING":
        return "Đang giao hàng";
      case "SUCCESS":
        return "Giao hàng thành công";
      case "FAILED":
        return "Thất bại";
      case "CANCELLED":
        return "Đã hủy";
      case "RETURN":
        return "Đã trả hàng";
      default:
        return "Không xác định";
    }
  };

  // Xác định loại quy trình dựa trên trạng thái đơn hàng
  const getProcessType = (status: string, processType?: string): 'normal' | 'cancellation' | 'failed' | 'return' => {
    // Nếu có processType từ backend, ưu tiên sử dụng
    if (processType) {
      if (processType.toLowerCase() === 'return') return 'return';
      if (processType.toLowerCase() === 'cancellation') return 'cancellation';
      if (processType.toLowerCase() === 'failed') return 'failed';
      if (processType.toLowerCase() === 'normal') return 'normal';
    }
    
    const statusUpper = status.toUpperCase();
    const statusLower = status.toLowerCase();
    
    // Kiểm tra các trạng thái return
    if (statusUpper === 'RETURN' || statusLower.includes('trả') || statusLower.includes('return')) {
      return 'return';
    }
    
    // Kiểm tra các trạng thái hủy
    if (statusUpper === 'CANCELLED' || statusLower.includes('hủy') || statusLower.includes('huy') || statusLower.includes('cancel')) {
      return 'cancellation';
    }
    
    // Kiểm tra trạng thái thất bại
    if (statusUpper === 'FAILED' || statusLower.includes('thất bại') || statusLower.includes('failed')) {
      return 'failed';
    }
    
    // Mặc định là quy trình bình thường
    return 'normal';
  };

  // Lấy các bước của quy trình dựa trên loại
  const getProcessSteps = (processType: 'normal' | 'cancellation' | 'failed' | 'return') => {
    switch (processType) {
      case 'normal':
        return [
          { label: "Chờ xác nhận", icon: "fas fa-hourglass-start" },
          { label: "Xác nhận đơn", icon: "fas fa-check" },
          { label: "Đang giao hàng", icon: "fas fa-truck" },
          { label: "Hoàn thành", icon: "fas fa-box" },
          { label: "Đánh giá", icon: "fas fa-star" }
        ];
      case 'cancellation':
        return [
          { label: "Yêu cầu hủy", icon: "fas fa-times-circle" },
          { label: "Chờ xử lý hủy", icon: "fas fa-hourglass-half" },
          { label: "Xác nhận hủy", icon: "fas fa-check-circle" },
          { label: "Đã hủy hoàn tất", icon: "fas fa-ban" }
        ];
      case 'return':
        return [
          { label: "Yêu cầu trả hàng", icon: "fas fa-undo" },
          { label: "Chờ xử lý trả hàng", icon: "fas fa-hourglass-half" },
          { label: "Xác nhận trả hàng", icon: "fas fa-check-circle" },
          { label: "Xử lý hoàn tất", icon: "fas fa-box-open" }
        ];
      case 'failed':
        return [
          { label: "Đơn hàng thất bại", icon: "fas fa-exclamation-triangle" }
        ];
      default:
        return [];
    }
  };

  // Xác định bước hiện tại dựa trên trạng thái và loại quy trình
  const getCurrentStep = (status: string, processType: 'normal' | 'cancellation' | 'failed' | 'return', defaultStep: number, orderData?: OrderDetails): number => {
    const statusUpper = status.toUpperCase();
    const statusLower = status.toLowerCase();
    
    switch (processType) {
      case 'normal':
        switch (statusUpper) {
          case 'PENDING': return 1;
          case 'CONFIRMED':
          case 'APPROVED': return 2;
          case 'SHIPPING': return 3;
          case 'SUCCESS':
          case 'COMPLETED': return 4;
          default: 
            // Kiểm tra trạng thái tiếng Việt
            if (statusLower.includes('chờ')) return 1;
            if (statusLower.includes('xác nhận') || statusLower.includes('confirm')) return 2;
            if (statusLower.includes('giao') || statusLower.includes('ship')) return 3;
            if (statusLower.includes('hoàn thành') || statusLower.includes('thành công') || statusLower.includes('complete')) return 4;
            return defaultStep;
        }
      case 'cancellation':
        // Ưu tiên sử dụng statusStep từ API nếu có và hợp lệ
        if (defaultStep && defaultStep >= 1 && defaultStep <= 4) {
          return defaultStep;
        }
        
        switch (statusUpper) {
          case 'CANCEL_REQUESTED': return 1;
          case 'CANCEL_PENDING': return 2;
          case 'CANCEL_CONFIRMED': return 3;
          case 'CANCELLED': return 4;
          default:
            // Kiểm tra các trạng thái có chứa từ khóa hủy
            if (statusLower.includes('yêu cầu hủy') || statusLower.includes('cancel_request')) return 1;
            if (statusLower.includes('chờ xử lý hủy') || statusLower.includes('cancel_pending')) return 2;
            if (statusLower.includes('xác nhận hủy') || statusLower.includes('cancel_confirm')) return 3;
            if (statusLower.includes('hủy hoàn tất') || statusLower.includes('đã hủy') || statusLower.includes('hủy') || statusLower.includes('huy') || statusLower.includes('cancel')) {
              return 4; // Đã hủy hoàn tất
            }
            return defaultStep;
        }
      case 'return':
        // Ưu tiên kiểm tra returnInfo trước vì nó chứa thông tin chính xác nhất
        if (orderData && (orderData as any).returnInfo) {
          const returnInfo = (orderData as any).returnInfo;
          const returnStatus = returnInfo.return_status;
          
          switch (returnStatus) {
            case 'PENDING': 
              return 1;     // Chờ xử lý trả hàng
            case 'APPROVED': 
              return 2;    // Xác nhận trả hàng
            case 'CANCEL_CONFIRMED':
              return 3;
            case 'REJECTED': 
            case 'CANCELLED':  // Thêm CANCELLED vào case
              return 4;    // Đã trả hàng hoàn tất (bị từ chối/hủy)
            case 'COMPLETED': 
              return 4;   // Đã trả hàng hoàn tất (thành công)
            default: 
              return 1;            // Yêu cầu trả hàng
          }
        }
        
        // Sau đó mới kiểm tra statusStep từ API nếu có và hợp lệ
        if (typeof defaultStep === 'number' && defaultStep >= 1 && defaultStep <= 4) {
          return defaultStep;
        }
        
        // Backend sử dụng chung logic CANCEL cho trả hàng, fallback nếu không có statusStep
        switch (statusUpper) {
          case 'RETURN':
          case 'RETURN_REQUESTED':
          case 'CANCEL_REQUESTED': return 1; // Yêu cầu trả hàng
          case 'RETURN_PENDING':
          case 'CANCEL_PENDING': return 2;   // Chờ xử lý trả hàng
          case 'RETURN_CONFIRMED':
          case 'CANCEL_CONFIRMED': return 3; // Xác nhận trả hàng
          case 'RETURNED':
          case 'REJECTED':
          case 'CANCELLED': return 4;        // Đã trả hàng hoàn tất
          default:
            // Kiểm tra các trạng thái có chứa từ khóa trả hàng
            if (statusLower.includes('yêu cầu trả') || statusLower.includes('return_request') || statusLower.includes('return')) return 1;
            if (statusLower.includes('chờ xử lý trả') || statusLower.includes('return_pending')) return 2;
            if (statusLower.includes('xác nhận trả') || statusLower.includes('return_confirm')) return 3;
            if (statusLower.includes('trả hoàn tất') || statusLower.includes('đã trả') || statusLower.includes('trả')) {
              return 4; // Đã trả hàng hoàn tất
            }
            return 1; // Default to step 1 for return process
        }
      case 'failed':
        return 1; // Chỉ có 1 bước cho failed
      default:
        return defaultStep;
    }
  };

  // Kiểm tra xem đơn hàng có thể hủy được không
  const canCancelOrder = (status: string, processType?: string): boolean => {
    const currentProcessType = getProcessType(status, processType);
    
    // Không thể hủy nếu đang trong quy trình hủy, trả hàng hoặc thất bại
    if (currentProcessType === 'cancellation' || currentProcessType === 'return' || currentProcessType === 'failed') {
      return false;
    }
    
    // Chỉ có thể hủy khi đơn hàng đang chờ xác nhận hoặc đã xác nhận (chưa vận chuyển)
    const cancellableStatuses = ['PENDING', 'CONFIRMED', 'APPROVED'];
    return cancellableStatuses.includes(status);
  };

  // Kiểm tra xem đơn hàng có thể trả hay không (đã hoàn thành và trong vòng 30 ngày)
  const canReturnOrder = (orderDate: string, status: string): { canReturn: boolean; daysLeft: number | null } => {
    // Chỉ cho phép trả hàng khi đơn hàng đã hoàn thành
    if (status !== "SUCCESS" && status !== "COMPLETED") {
      return { canReturn: false, daysLeft: null };
    }
    
    const orderDateTime = new Date(orderDate);
    const currentDateTime = new Date();
    
    // Tính số ngày giữa ngày đặt hàng và hiện tại
    const timeDiff = currentDateTime.getTime() - orderDateTime.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    // Kiểm tra xem có trong vòng 30 ngày không
    if (daysDiff <= 30) {
      return { canReturn: true, daysLeft: 30 - daysDiff };
    } else {
      return { canReturn: false, daysLeft: null };
    }
  };

  const openReviewForm = (product: OrderProduct) => {
    setCurrentReviewProduct(product);
    setShowReviewForm(true);
    setReviewTitle("");
    setReviewDescription("");
    setReviewRating(0);
    setReviewMessage("");
  };

  const closeReviewForm = useCallback(() => {
    setShowReviewForm(false);
    setCurrentReviewProduct(null);
    setReviewTitle("");
    setReviewDescription("");
    setReviewRating(0);
    setReviewMessage("");
  }, []);

  const handleRatingChange = (rating: number) => {
    setReviewRating(rating);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReviewProduct || reviewRating === 0) {
      setReviewMessage("Vui lòng chọn số sao và nhập đủ thông tin.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewMessage("");

    try {
      const token = getAuthToken();
      const payload = {
        order_item_id: currentReviewProduct.order_item_id,
        product_id: currentReviewProduct.product_id,
        comment_title: reviewTitle,
        comment_description: reviewDescription,
        comment_rating: reviewRating,
      };
      const res = await axios.post(
        convertToAdminApiUrl("/comments"),
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        setReviewMessage("Đánh giá của bạn đã được gửi thành công!");
        // Reload order data to reflect the new review status
        await fetchOrder(); // <--- Call fetchOrder here
        closeReviewForm();
        setTimeout(() => {
          closeReviewForm();
        }, 2000);
      } else {
        setReviewMessage(
          res.data.message || "Đã có lỗi xảy ra khi gửi đánh giá."
        );
      }
    } catch (error: any) {
      if (error.response) {
        setReviewMessage(
          error.response.data.message || "Lỗi từ server: Không rõ nguyên nhân."
        );
      } else if (error.request) {
        setReviewMessage("Không nhận được phản hồi từ server.");
      } else {
        setReviewMessage("Lỗi kết nối hoặc thiết lập request.");
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Xử lý khi người dùng nhấn nút trả hàng
  const handleReturnOrder = () => {
    setShowReturnModal(true);
  };

  // Xử lý submit form trả hàng từ modal
  const handleReturnOrderSubmit = async (reason: string, images: File[]) => {
    if (!order || !order.order_hash) return;
    
    try {
      setIsProcessingReturn(true);
      await returnOrder(order.order_hash, reason, images);
      
      toast.success("Yêu cầu trả hàng đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm.");
      
      // Đóng modal
      setShowReturnModal(false);
      
      // Tải lại thông tin đơn hàng để cập nhật statusStep và processType mới
      await fetchOrder();
    } catch (error: any) {
      // Hiển thị thông báo lỗi cụ thể từ API nếu có
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Lỗi: ${error.response.data.message}`);
      } else {
        toast.error("Không thể gửi yêu cầu trả hàng. Vui lòng thử lại sau.");
      }
    } finally {
      setIsProcessingReturn(false);
    }
  };

  // Xử lý đóng modal trả hàng
  const handleReturnModalCancel = () => {
    setShowReturnModal(false);
  };

  // Xử lý khi người dùng nhấn nút hủy đơn hàng - mở modal
  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  // Xử lý submit form hủy đơn hàng từ modal
  const handleCancelOrderSubmit = async (reason: string) => {
    if (!order) return;

    try {
      setIsProcessingCancel(true);
      
      // Sử dụng order ID từ API response hoặc trích xuất từ order_hash
      let orderId: number;
      
      if (order.id) {
        orderId = order.id;
      } else {
        // Trích xuất số từ order_hash nếu không có ID trực tiếp
        const hashNumbers = order.order_hash.match(/\d+/g);
        if (hashNumbers && hashNumbers.length > 0) {
          orderId = parseInt(hashNumbers[hashNumbers.length - 1]);
        } else {
          throw new Error("Không thể xác định ID đơn hàng");
        }
      }
      
      await cancelOrder(orderId, reason);
      
      toast.success("Đơn hàng đã được hủy thành công!");
      
      // Đóng modal
      setShowCancelModal(false);
      
      // Tải lại thông tin đơn hàng để cập nhật trạng thái
      await fetchOrder();
    } catch (error: any) {
      // Hiển thị thông báo lỗi cụ thể từ API nếu có
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Lỗi: ${error.response.data.message}`);
      } else {
        toast.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
      }
    } finally {
      setIsProcessingCancel(false);
    }
  };

  // Xử lý đóng modal hủy đơn hàng
  const handleCancelModalClose = () => {
    setShowCancelModal(false);
  };

  // Xử lý hủy sản phẩm cụ thể
  const handleCancelProduct = async (product: OrderProduct) => {
    if (!order || !order.id) {
      console.error("No order or order.id found:", { order, orderId: order?.id });
      toast.error("Không thể xác định thông tin đơn hàng");
      return;
    }

    const productName = product.name || "sản phẩm này";
    
    // Confirm before cancelling only the selected product.
    Modal.confirm({
      title: 'Xác nhận hủy sản phẩm',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn hủy sản phẩm <strong>"{productName}"</strong> không?</p>
          <p style={{ color: '#52c41a', fontSize: '14px' }}>
            ✓ Chỉ hủy sản phẩm này, không hủy toàn bộ đơn hàng
          </p>
        </div>
      ),
      okText: 'Xác nhận hủy',
      cancelText: 'Không',
      okType: 'danger',
      onOk: async () => {
        try {
          setCancellingProductId(product.order_item_id);
          
          const token = getAuthToken();
          if (!token) {
            console.error("No auth token found");
            toast.error("Vui lòng đăng nhập lại");
            return;
          }

          // Sử dụng order_item_id làm itemId để đảm bảo hủy đúng sản phẩm
          const itemId = parseInt(product.order_item_id);
          
          await cancelOrderProduct(
            order.id!,
            itemId,
            `Khách hàng yêu cầu hủy sản phẩm: ${productName}`,
            token
          );
          toast.success(`Đã hủy sản phẩm "${productName}" thành công!`);
          
          // Tải lại thông tin đơn hàng để cập nhật trạng thái
          await fetchOrder();
        } catch (error: any) {
          console.error("Error cancelling product:", error);
          
          if (error.message) {
            toast.error(`Lỗi: ${error.message}`);
          } else {
            toast.error("Không thể hủy sản phẩm. Vui lòng thử lại sau.");
          }
        } finally {
          setCancellingProductId(null);
        }
      },
    });
  };

const formatPrice1 = (value: number | string): string => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString("vi-VN") : "0";
};

  
  if (isOrderLoading) {
    return (
      <>
        <Header />
        <main className="detail-order-page">
          <div className="container">
            <PageSectionSkeleton variant="cart-list" count={2} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!order || orderLoadError) {
    return (
      <>
        <Header />
        <main className="detail-order-page">
          <div className="container">
            <RetryState
              message={orderLoadError || "Không tìm thấy thông tin đơn hàng."}
              onRetry={fetchOrder}
              secondaryActionLabel="Quay lại tài khoản"
              secondaryActionTo="/tai-khoan/don-hang"
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <section className="detail-order-page">
        <div className="container">
          <div className="order-overview">
            <div className="order-header">
              <div className="order-id">
                <h2>Đơn hàng: {order.order_hash}</h2>
                <p className="order-date">Ngày đặt: {formatDate(order.date)}</p>
              </div>
              <div className="order-actions">
                <div className="order-status">
                  <span className="status">
                    {translateOrderStatus(order.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="order-status-progress">
              <div className="status-timeline">
                {(() => {
                  // Xác định loại quy trình và các bước
                  const processType = getProcessType(order.status, order.processType);
                  const steps = getProcessSteps(processType);
                  const currentStep = getCurrentStep(order.status, processType, order.statusStep || 1, order);
                  
                  return steps.map((step, index) => (
                    <React.Fragment key={index}>
                      <div
                        className={`status-step ${
                          currentStep >= index + 1 ||
                          (processType === 'normal' && step.label === "Đánh giá" && allProductsReviewed)
                            ? "active"
                            : ""
                        } ${processType}`}
                      >
                        <div className="status-icon">
                          <i className={step.icon}></i>
                        </div>
                        <div className="status-label">
                          <p>{step.label}</p>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`status-line ${
                            currentStep > index + 1 ||
                            (processType === 'normal' && step.label === "Hoàn thành" && allProductsReviewed)
                              ? "active"
                              : ""
                          }`}
                        ></div>
                      )}
                    </React.Fragment>
                  ));
                })()}
              </div>
            </div>
          </div>

          <div className="delivery-info">
            <h3>Địa chỉ nhận hàng</h3>
            <div className="recipient-info">
              <div className="payment-summary">
                {" "}
                <div className="summary-row">
                  <span className="row1">Họ và tên:</span>
                  <span className="row2">{order.recipientName}</span>
                </div>
                <div className="summary-row">
                  <span className="row1">Số điện thoại:</span>
                  <span className="row2">{order.recipientPhone}</span>
                </div>
                <div className="summary-row">
                  <span className="row1">Địa chỉ:</span>
                  <span className="row2">{order.address}</span>
                </div>
                <div className="summary-row">
                  <span className="row1">Thanh toán khi nhận hàng</span>
                </div>
              </div>
              <div className="payment-summary">
                <div className="summary-row">
                  <span className="row1">Tổng tiền hàng:</span>
                  <span className="row2">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span className="row1">Phí vận chuyển:</span>
                  <span className="row2">
                    {formatPrice(order.shippingFee)}
                  </span>{" "}
                </div>
                <div className="summary-row discount">
                  <span className="row1">Mã giảm giá:</span>
                  <span className="row2">
                    -{formatPrice(order.discount)}
                  </span>
                </div>
                <div className="summary-row total">
                  <span className="row1">Thành tiền:</span>
                  <span className="row2">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-summary">
            <div className="summary-header">
              <h3>Tổng sản phẩm</h3>
            </div>
            <div className="product-list">
              {order.products?.map((product: OrderProduct) => {
                const orderHash = order.order_hash;
                const isCancelled = isProductCancelled(product, orderHash);
                const displayStatus = getDisplayStatus(product, orderHash);
                
                return (
                  <div className="product-item" key={product.order_item_id}>
                    <div className="product-image">
                      <img
                        src={firstImageUrl(product.image)}
                        alt={product.name}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "/images/default.jpg";
                        }}
                      />
                    </div>
                    <div className="product-detailss">
                      <h4>{product.name}</h4>
                      <div className="product-meta">
                        {product.color && product.color.hex && (
                          <span
                            className="product-color"
                            style={{ backgroundColor: product.color.hex }}
                            title={`Màu: ${
                              product.color.name || product.color.hex
                            }`}
                          ></span>
                        )}
                        {product.size && <span>Size: {product.size}</span>}{" "}
                        <span>Số lượng: {product.quantity}</span>
                      </div>
                      <span>Giá: {formatPrice1(product.price)}đ</span>
                      {displayStatus && (
                        <div className="product-status cancelled">
                          <span>{displayStatus}</span>
                        </div>
                      )}
                    </div>
                    <div className="product-price">
                      <p>
                        Thành tiền:{" "}
                        <span>
                          {formatPrice1(product.price * product.quantity)}đ
                        </span>
                      </p>
                    </div>
                    <div className="product-actions">
                      <Link to={`/san-pham/${product.slug}`}>
                        <button className="btn-product-action">
                          Xem chi tiết
                        </button>
                      </Link>
                      {isCancelled ? (
                        <Link to={`/san-pham/${product.slug}`}>
                          <button className="btn-buy-again">Mua lại</button>
                        </Link>
                      ) : canCancelProduct(product) ? (
                        <button
                          onClick={() => handleCancelProduct(product)}
                          className="btn-cancel-product"
                          disabled={cancellingProductId === product.order_item_id}
                        >
                          {cancellingProductId === product.order_item_id ? (
                            <>
                              <span className="spinner"></span> Đang hủy...
                            </>
                          ) : (
                            "Hủy sản phẩm"
                          )}
                        </button>
                      ) : displayStatus.includes('trả hàng') ? (
                        <button 
                          className="status-return-process" 
                          disabled 
                          title={getCannotCancelReason(product)}
                        >
                          Đang trả hàng
                        </button>
                      ) : order.status === "SUCCESS" && !product.has_comment ? (
                        <button
                          onClick={() => openReviewForm(product)}
                          className="btn-product-review"
                        >
                          Đánh giá
                        </button>
                      ) : order.status === "SUCCESS" && product.has_comment ? (
                        <button className="status-reviewed">Đã đánh giá</button>
                      ) : (
                        <button 
                          className="status-cantnot-review"
                          title={getCannotCancelReason(product)}
                        >
                          Chưa thể đánh giá
                        </button>
                      )}
                    </div>

                    {showReviewForm &&
                      currentReviewProduct?.order_item_id ===
                        product.order_item_id && (
                        <div className="review-form-section">
                          <h4>Đánh giá sản phẩm: {product.name}</h4>
                          <form onSubmit={handleSubmitReview}>
                            <div className="form-group">
                              <label className="form-label">
                                Chất lượng sản phẩm:
                              </label>
                              <div className="star-rating-container">
                                {Array.from({ length: 5 }, (_, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className="star-button"
                                    onClick={() => handleRatingChange(index + 1)}
                                  >
                                    <img
                                      src={
                                        reviewRating > index
                                          ? starFilledImg
                                          : starOutlineImg
                                      }
                                      alt={
                                        reviewRating > index
                                          ? "Sao đã chọn"
                                          : "Sao chưa chọn"
                                      }
                                      className="star-icon-img"
                                    />
                                  </button>
                                ))}
                                <br />
                              </div>
                              <span className="rating-text">
                                {reviewRating > 0 ? (
                                  <>
                                    <span className="form-label rating-description">
                                      {ratingLabels[reviewRating]}{" "}
                                      {`(${reviewRating}/5 sao)`}
                                    </span>
                                  </>
                                ) : (
                                  ratingLabels[0]
                                )}
                              </span>
                            </div>
                            <div className="form-group">
                              <label htmlFor="reviewTitle" className="form-label">
                                Tiêu đề:
                              </label>
                              <input
                                type="text"
                                id="reviewTitle"
                                className="form-input"
                                value={reviewTitle}
                                onChange={(e) => setReviewTitle(e.target.value)}
                                placeholder="Tiêu đề đánh giá (VD: Sản phẩm rất tốt!)"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label
                                htmlFor="reviewDescription"
                                className="form-label"
                              >
                                Nội dung đánh giá:
                              </label>
                              <textarea
                                id="reviewDescription"
                                className="form-textarea"
                                rows={4}
                                value={reviewDescription}
                                onChange={(e) =>
                                  setReviewDescription(e.target.value)
                                }
                                placeholder="Viết đánh giá của bạn về sản phẩm..."
                                required
                              ></textarea>
                            </div>
                            {reviewMessage && (
                              <p
                                className={`review-message ${
                                  reviewMessage.includes("thành công")
                                    ? "success"
                                    : "error"
                                }`}
                              >
                                {reviewMessage}
                              </p>
                            )}
                            <div className="form-actions">
                              <button
                                type="submit"
                                className="submit-review-button"
                                disabled={isSubmittingReview}
                              >
                                {isSubmittingReview ? (
                                  <>
                                    <span className="spinner"></span> Đang gửi...
                                  </>
                                ) : (
                                  <>Gửi đánh giá</>
                                )}
                              </button>
                              <button
                                type="button"
                                className="cancel-review-button"
                                onClick={closeReviewForm}
                                disabled={isSubmittingReview}
                              >
                                Hủy
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="order-actions-bottom">
            {canCancelOrder(order.status, order.processType) && (
              <button 
                className="btn-primary"
                onClick={handleCancelOrder}
                disabled={isProcessingCancel}
              >
                {isProcessingCancel ? (
                  <>
                    <span className="spinner"></span> Đang xử lý...
                  </>
                ) : (
                  "Hủy đơn hàng"
                )}
              </button>
            )}
            {(order.status === "SUCCESS" || order.status === "COMPLETED") && (
              <>
                {canReturnOrder(order.date, order.status).canReturn ? (
                  <button 
                    className="btn-primary btn-return"
                    onClick={handleReturnOrder}
                    disabled={isProcessingReturn}
                  >
                    {isProcessingReturn ? (
                      <>
                        <span className="spinner"></span> Đang xử lý...
                      </>
                    ) : (
                      <>Trả hàng (còn {canReturnOrder(order.date, order.status).daysLeft} ngày)</>
                    )}
                  </button>
                ) : (
                  <button className="btn-primary btn-return disabled" disabled title="Đã quá thời hạn trả hàng 30 ngày">
                    Quá hạn trả hàng
                  </button>
                )}
              </>
            )}
            {/* Show "Mua lại" button if all products are cancelled */}
            {areAllProductsCancelled(order.products || [], order.order_hash) && (
              <div className="order-actions">
                <Link to="/san-pham">
                  <button className="btn-primary btn-buy-again-all">
                    Mua lại tất cả
                  </button>
                </Link>
              </div>
            )}
            <button className="btn-outline">Liên hệ với SONA</button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modal trả hàng */}
      {showReturnModal && (
        <Suspense fallback={null}>
          <ReturnOrderModal
            visible={showReturnModal}
            onCancel={handleReturnModalCancel}
            onSubmit={handleReturnOrderSubmit}
            loading={isProcessingReturn}
          />
        </Suspense>
      )}

      {/* Modal hủy đơn hàng */}
      {showCancelModal && (
        <Suspense fallback={null}>
          <CancelOrderModal
            visible={showCancelModal}
            onCancel={handleCancelModalClose}
            onSubmit={handleCancelOrderSubmit}
            loading={isProcessingCancel}
            orderHash={order?.order_hash || ''}
          />
        </Suspense>
      )}
    </>
  );
};

export default DetailOrder;

