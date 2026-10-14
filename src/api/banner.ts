import axios from "axios";
import { convertToAdminApiUrl } from "../utils/url";

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  button_text?: string;
  position: number;
  status: number;
  page: string;
  created_at: string;
  updated_at: string;
}

// API response format từ server
export interface BannerApiResponse {
  banner_id: number;
  category_id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  link?: string;
  link_url?: string;
  button_text?: string;
  page_type: string;
  position: number;
  is_active: number;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface BannerResponse {
  success: boolean;
  data: Banner[];
  message?: string;
}

// Lấy danh sách banner theo trang
export const getBannersByPage = async (page: string): Promise<Banner[]> => {
  try {
    const apiUrl = convertToAdminApiUrl(`/banners/page/${page}`);
    // console.log(`Fetching banners for page: ${page}`);
    // console.log(`API URL: ${apiUrl}`);
    
    // Check if API URL is properly configured
    if (!apiUrl || apiUrl.includes('undefined')) {
      console.error('API URL is not properly configured. Please check VITE_API_BASE_URL environment variable.');
      return [];
    }
    
    const response = await axios.get<BannerApiResponse[]>(apiUrl);
    
    // console.log("Banner API response:", response.data);
    
    // Convert API response format to internal Banner format
    if (Array.isArray(response.data)) {
      const banners: Banner[] = response.data.map((apiItem: BannerApiResponse) => ({
        id: apiItem.banner_id,
        title: apiItem.title,
        subtitle: apiItem.subtitle,
        description: apiItem.description,
        image: apiItem.image_url,
        link: apiItem.link || apiItem.link_url,
        button_text: apiItem.button_text,
        position: apiItem.position,
        status: apiItem.is_active,
        page: apiItem.page_type,
        created_at: apiItem.created_at,
        updated_at: apiItem.updated_at,
      }));
      
      // console.log("Converted banners:", banners);
      return banners;
    }
    
    console.warn("API response is not an array:", response.data);
    return [];
    
  } catch (error: any) {
    console.error("Error fetching banners:", error);
    
    // Log detailed error information
    if (error.response) {
      console.error("Error response status:", error.response.status);
      console.error("Error response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    
    // Return empty array instead of throwing error to prevent app crash
    return [];
  }
};

// Lấy banner cho trang home
export const getHomeBanners = async (): Promise<Banner[]> => {
  return getBannersByPage("home");
};
