// Common interfaces for SONA SPACE client application For All Users

// Product related interfaces For All Users
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  colors: string[];
  isNew?: boolean;
  isSale?: boolean;
  createdAt?: string;
  priceSale?: number;
  slug: string;
  isWishlist?: boolean;
  description?: string;
  category?: string;
  specifications?: ProductSpecification[];
  relatedProducts?: Product[];
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  category_slug: string;
  category_image: string;
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
  id: number;
  name: string;
  slug: string;
  image: string;
  description?: string;
  products?: Product[];
}

// News/Blog related interfaces
export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  image: string;
  summary: string;
  content: string;
  publishDate: string;
  author?: string;
  tags?: string[];
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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