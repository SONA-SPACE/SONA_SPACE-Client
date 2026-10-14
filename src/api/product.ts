import axios from "axios";
import type { Product, PaginatedResponse, Variant } from "../types";
import { convertToAdminApiUrl } from "../utils/url";
import { getAuthToken } from "../services/loginService";

const handleApiResponse = (response: any, errorMessage: string) => {
  if (!response || !response.data) {
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  return response.data;
};

/**
 * Get all products (optionally with pagination or filter params)
 * @param {Object} params - Query parameters (pagination, filters, etc.)
 * @returns {Promise<PaginatedResponse<Product>>} List of products
 */
export const getAllProducts = async (
  page: number = 1,
  limit: number = 8,
  filters?: {
    category?: string;
    room?: string;
    price?: string;
    color?: string;
    sort?: string;
  }
): Promise<PaginatedResponse<Product>> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.room && { room: filters.room }),
      ...(filters?.price && { price: filters.price }),
      ...(filters?.color && { color: filters.color }),
      ...(filters?.sort && { sort: filters.sort }),
    });

    // console.log(
    //   `Calling API: GET ${convertToAdminApiUrl(
    //     "/products"
    //   )}?${queryParams.toString()}`
    // );

    const token = getAuthToken();

    const response = await axios.get(convertToAdminApiUrl("/products"), {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = handleApiResponse(response, "No data received from API");

    if (!Array.isArray(data.products) || !data.pagination) {
      console.error("Invalid API response structure");
      return {
        items: [],
        total: 0,
        page,
        pageSize: limit,
        totalPages: 0,
      };
    }

    return {
      items: data.products,
      total: data.pagination.totalProducts,
      page: data.pagination.currentPage,
      pageSize: data.pagination.productsPerPage,
      totalPages: data.pagination.totalPages,
    };
  } catch (error) {
    console.error("Error fetching paginated products:", error);
    throw error;
  }
};

/**
 * Get a product by slug
 * @param {string} slug - Product slug
 * @returns {Promise<Product>} Product data
 */

// product.api.ts
export const getProductBySlug = async (
  slug: string
): Promise<{
  product: any;
  colors: any[];
  related_products: any[];
}> => {
  try {
    const response = await axios.get(convertToAdminApiUrl(`/products/${slug}`));
    return handleApiResponse(response, "No data received from API");
  } catch (error) {
    // xử lý lỗi...
    throw error;
  }
};

/**
 * Search products by keyword
 * @param {string} keyword - Keyword to search
 * @param {Object} params - Additional params like pagination, sort...
 * @returns {Promise<PaginatedResponse<Product>>} Search results
 */
export const searchProducts = async (
  keyword: string,
  params: { page?: number; pageSize?: number; sort?: string } = {}
): Promise<PaginatedResponse<Product>> => {
  try {
    // console.log(
    //   `Calling API: GET ${convertToAdminApiUrl(
    //     "/products/search"
    //   )} with keyword: ${keyword}`
    // );

    const response = await axios.get(convertToAdminApiUrl("/products/search"), {
      params: { ...params, keyword },
    });

    const data = response.data;

    if (!data || !data.products || !data.pagination) {
      console.error("Invalid search API response structure");
      return {
        items: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: 0,
      };
    }

    return {
      items: data.products,
      total: data.pagination.totalProducts,
      page: data.pagination.currentPage,
      pageSize: data.pagination.productsPerPage,
      totalPages: data.pagination.totalPages,
    };
  } catch (error) {
    console.error(`Error searching products with keyword "${keyword}":`, error);
    throw error;
  }
};

/**
 * Get newest products
 * @param {number} limit - Number of products to fetch
 * @returns {Promise<Product[]>} List of newest products
 */
export const getNewestProducts = async (
  limit: number = 8
): Promise<Product[]> => {
  try {
    const token = getAuthToken();

    const response = await axios.get(convertToAdminApiUrl("/products/newest"), {
      params: { limit },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const data = response.data;

    if (!data) return [];

    if (Array.isArray(data)) return data;
    if (data.products && Array.isArray(data.products)) return data.products;
    if (data.data && data.data.products && Array.isArray(data.data.products))
      return data.data.products;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.product_id || data.id) return [data];

    return [];
  } catch (error) {
    console.error("Error fetching newest products:", error);
    return [];
  }
};
