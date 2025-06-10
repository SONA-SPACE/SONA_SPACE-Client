import { useState, useEffect, useCallback } from 'react';
import { fetchAllCategories, formatCategoryForDisplay } from '../services/categoryService';
import type { Category } from '../types';

interface UseCategoriesResult {
  categories: Category[];
  formattedCategories: ReturnType<typeof formatCategoryForDisplay>[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage categories
 * @param {boolean} autoFetch - Whether to fetch categories automatically on mount
 * @returns {UseCategoriesResult} Categories data and state
 */
export const useCategories = (autoFetch = true): UseCategoriesResult => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error in useCategories hook:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [autoFetch, fetchCategories]);

  // Format categories for display
  const formattedCategories = categories.map(category => formatCategoryForDisplay(category));

  return {
    categories,
    formattedCategories,
    loading,
    error,
    refetch: fetchCategories
  };
};

export default useCategories; 