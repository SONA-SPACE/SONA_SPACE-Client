export interface Product {
  id: number;
  name: string;
  slug: string;
  image: string;
  attributes: Attribute[];
  category: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at?: string;

  price?: number | null;
  price_sale?: number | null;
  color_hex?: string[];

  description?: string;
  priority?: number;
  images?: string[];
  view?: number;
  stock?: number;
  status?: number;
  sold?: number;
  material?: string;
  height?: number;
  quantity?: number;
  color_name?: string;
  width?: number;
  depth?: number;
  seating_height?: number;
  maxium_weight?: number;

  isNew?: boolean;
  isSale?: boolean;
  priceSale?: number;
  isWishlist?: boolean;
  product_id: number;
  product_slug: string;
  colors?: string[];
  specifications?: ProductSpecification[];
  relatedProducts?: Product[];
  variants?: Variant[];
  variant_id: number;
  rooms?: string[];
}
export interface Attribute {
  name: string;
  value: string | number | null;
  unit?: string;
  is_required: boolean | 0 | 1;
}

export interface ProductSpecification {
  name: string;
  label: string;
  value: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  slug: string;
  category_image: string;
  category_banner: string;
  category_priority: number;
  category_status: number;
  updated_at: string;
  created_at: string;
  deleted_at: string | null;
  product_count: number;
  children?: Category[];
}

// User related interfaces
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  wishlist?: Product[];
  full_name?: string;
}

export interface Address {
  id: number;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

// Order related interfaces
export interface Order {
  id: string;
  date: string;
  status: string;
  statusStep: number;
  recipientName: string;
  recipientPhone: string;
  address: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  products: OrderProduct[];
}

export interface OrderProduct {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
}

export interface CartItem extends OrderProduct {
  slug: string;
}

// Promotion related interfaces
export interface PromoCode {
  code: string;
  discount: string;
  description: string;
  validUntil: string;
  minOrder: string;
  used: boolean;
}

// Form related interfaces
export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  agreeToTerms: boolean;
}

export interface ArchitectFormData extends ContactFormData {
  experience?: Experience[];
  skills?: Skill[];
  education?: Education[];
  portfolio?: string;
}

export interface ContactFormDesign {
  name: string;
  email: string;
  phone: string;
  room_name: string;
  custom_room_name?: string;
  design_description: string;
  require_design: string;
  style_design: string;
  budget: string;
  different_information: string;
  agreeToTerms?: boolean;
}

export interface Experience {
  position: string;
  company: string;
  location: string;
  period: string;
  achievements: string[];
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Education {
  university: string;
  degree: string;
  location: string;
}

export interface Recommendation {
  text: string;
  author: string;
  position?: string;
}

// Room/Space related interfaces
export interface Room {
  room_id: number;
  room_name: string;
  slug: string;
  room_image: string;
  room_banner: string;
  room_description?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  product_count: number;
  products?: Product[];
}

// News/Blog related interfaces
export interface NewsArticle {
  news_id: number;
  news_name: string;
  news_title: string;
  news_slug: string;
  news_image: string;
  news_summary: string;
  news_view: number;
  news_content: string;
  news_publishDate: string;
  news_author?: string;
  news_tags?: string[];
  created_at?: String | undefined;
  news_category_id: string;
}
export interface NewsCategory {
  news_category_id: number;
  title: string;
  news_category_slug: string;
  news_category_status: string;
  news_count: number;
  name: string;
  news_slug: string;
}
// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  code?: string;
  errors?: Record<string, string>;
  message?: string;
}

// Pagination interface | Defind for all user
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Variant {
  color_id: number;
  color_name: string;
  color_hex: string;
  color_priority: number;
  variant_id: number;
  variantId: number;
  variant_slug: string;
  variant_price: number;
  variant_images?: string; // dùng nếu ảnh là chuỗi (dùng split sau)
  image: string[];
  variant_price_sale?: number;
  productId: number;
  variant_height?: number;
  quantity: number;
  price: number;
  priceSale: number;
  variant_width?: number;
  color: {
    id: number;
    name: string;
    hex: string;
    priority: number;
    slug: string;
  };
  variant_depth?: number;
}
export interface CommentStats {
  average_rating: string;
  total_ratings: number;
  rating_breakdown: {
    five_star: string;
    four_star: string;
    three_star: string;
    two_star: string;
    one_star: string;
  };
}

export interface Comment {
  comment_id: number;
  comment_title: string;
  user_id: number;
  user_name: string;
  user_image: string;
  comment_description: string;
  comment_rating: number;
  created_at: string;
}

export interface CommentResponse {
  product_id: number;
  stats: CommentStats;
  comments: Comment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalComments: number;
    commentsPerPage: number;
  };
}

// Interface cho dữ liệu đơn hàng từ API
export interface OrderItemAPI {
  product_id: number;
  product_name: string;
  product_image: string;
  product_price: string;
  variant_id: number;
  quantity: number;
}

export interface OrderAPI {
  order_id: number;
  created_at: string;
  order_status_name: string;
  items: OrderItemAPI[];
}

export interface OrdersResponse {
  user_id: string;
  order_count: number;
  orders: OrderAPI[];
}

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  date: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  status: string;
  customerInfo?: {
    name: string;
    phone: string;
    address: string;
  };
  orderNumber?: string;
  refundDate?: string;
}

export interface UserInfo {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string | string[];
  full_name?: string;
  role?: string;
}

export interface PromoCodeWithTimer extends PromoCode {
  validFrom: string;
  isFlashSale: boolean;
  timeRemaining?: { hours: number; minutes: number; seconds: number };
  combinations: string;
  status: number;
  userUsedStatus: number;
}

export interface CouponCode {
  code: string;
  discount: string;
  description: string;
  validUntil: string;
  validFrom: string;
  minOrder: string;
  used: boolean;
  isFlashSale: boolean;
  combinations: string;
  timeRemaining?: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  agreeToTerms: boolean;
}
