import axios from 'axios';
import type { Category, PaginatedResponse, Product } from '../types';

// Lấy API URL từ biến môi trường hoặc sử dụng giá trị mặc định
const API_URL = 'http://localhost:3500/api';

// Hàm helper để kiểm tra và xử lý response
const handleApiResponse = (response: any, errorMessage: string) => {
  if (!response || !response.data) {
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  return response.data;
};

/**
 * Get all categories
 * @returns {Promise<Category[]>} List of categories
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    console.log(`Calling API: GET ${API_URL}/categories`);
    const response = await axios.get(`${API_URL}/categories`);
    console.log('API response received:', response.status);
    
    // Kiểm tra nếu response có dữ liệu
    if (!response.data) {
      console.error('API returned empty data for categories');
      // Trả về mảng rỗng thay vì ném lỗi để tránh crash UI
      return [];
    }
    
    // Kiểm tra nếu dữ liệu trả về là mảng
    if (!Array.isArray(response.data)) {
      console.warn('API did not return an array for categories, attempting to extract data');
      
      // Thử lấy dữ liệu từ các cấu trúc phổ biến
      const data = response.data.data || response.data.categories || response.data.items || [];
      console.log('Extracted data:', data);
      return data;
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching categories: ${error.message}`);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      // Thử endpoint khác nếu endpoint chính không hoạt động
      if (error.response?.status === 404) {
        try {
          console.log('Trying alternative endpoint...');
          const altResponse = await axios.get(`${API_URL}/category`);
          return altResponse.data;
        } catch (altError) {
          console.error('Alternative endpoint also failed');
        }
      }
    } else {
      console.error('Error fetching categories:', error);
    }
    throw error;
  }
};

/**
 * Get a category by slug
 * @param {string} slug - The category slug
 * @returns {Promise<Category>} Category data
 */
export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  try {
    console.log(`Calling API: GET ${API_URL}/categories/${slug}`);
    const response = await axios.get(`${API_URL}/categories/${slug}`);
    console.log('API response received:', response.status);
    
    if (!response.data) {
      console.error(`API returned empty data for category slug: ${slug}`);
      throw new Error('Category not found');
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching category with slug ${slug}: ${error.message}`);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      // Thử endpoint khác nếu endpoint chính không hoạt động
      if (error.response?.status === 404) {
        try {
          console.log('Trying alternative endpoint...');
          const altResponse = await axios.get(`${API_URL}/category/${slug}`);
          return altResponse.data;
        } catch (altError) {
          console.error('Alternative endpoint also failed');
        }
      }
    } else {
      console.error(`Error fetching category with slug ${slug}:`, error);
    }
    throw error;
  }
};

/**
 * Get products by category
 * @param {number} categoryId - The category ID
 * @param {Object} params - Query parameters (pagination, filters, etc.)
 * @returns {Promise<PaginatedResponse<Product>>} Products data
 */
export const getProductsByCategory = async (
  categoryId: number, 
  params: { page?: number; pageSize?: number; sort?: string } = {}
): Promise<PaginatedResponse<Product>> => {
  try {
    console.log(`Calling API: GET ${API_URL}/categories/${categoryId}/products with params:`, params);
    const response = await axios.get(`${API_URL}/categories/${categoryId}/products`, { params });
    console.log('API response received:', response.status);
    
    if (!response.data) {
      console.error(`API returned empty data for products in category: ${categoryId}`);
      // Return empty paginated response
      return {
        items: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: 0
      };
    }
    
    // Kiểm tra nếu response.data đã có cấu trúc phân trang
    if (response.data.items || response.data.products) {
      // Đã có cấu trúc phân trang
      const paginatedData = {
        items: response.data.items || response.data.products || [],
        total: response.data.total || response.data.totalItems || 0,
        page: response.data.page || response.data.currentPage || params.page || 1,
        pageSize: response.data.pageSize || response.data.limit || params.pageSize || 10,
        totalPages: response.data.totalPages || response.data.pages || 1
      };
      return paginatedData;
    }
    
    // Nếu response.data là mảng sản phẩm, tạo cấu trúc phân trang
    if (Array.isArray(response.data)) {
      return {
        items: response.data,
        total: response.data.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: 1
      };
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching products for category ${categoryId}: ${error.message}`);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      // Thử endpoint khác nếu endpoint chính không hoạt động
      if (error.response?.status === 404) {
        try {
          console.log('Trying alternative endpoint...');
          const altResponse = await axios.get(`${API_URL}/category/${categoryId}/products`, { params });
          return altResponse.data;
        } catch (altError) {
          console.error('Alternative endpoint also failed');
        }
      }
    } else {
      console.error(`Error fetching products for category ${categoryId}:`, error);
    }
    throw error;
  }
}; 