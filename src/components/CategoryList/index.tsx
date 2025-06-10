import React, { useEffect, useState } from 'react';
import { fetchAllCategories, formatCategoryForDisplay } from '../../services/categoryService';
import type { Category } from '../../types';
import { Link } from 'react-router-dom';
import './styles.css';

interface CategoryListProps {
  limit?: number;
  showProductCount?: boolean;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  limit, 
  showProductCount = true 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setDebugInfo('Fetching categories...');
        
        console.log('CategoryList: Fetching categories');
        const data = await fetchAllCategories();
        console.log('CategoryList: Received categories:', data);
        setDebugInfo(prev => `${prev}\nReceived ${data.length} categories`);
        
        // Apply limit if provided
        const limitedData = limit ? data.slice(0, limit) : data;
        setCategories(limitedData);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load categories: ${errorMessage}`);
        setDebugInfo(prev => `${prev}\nError: ${errorMessage}`);
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [limit]);

  // Debug info component (only shown in development)
  const DebugInfo = () => {
    const isDev = true; // Always show debug info for now
    return isDev && debugInfo ? (
      <div className="category-list-debug">
        <details>
          <summary>Debug Info</summary>
          <pre>{debugInfo}</pre>
        </details>
      </div>
    ) : null;
  };

  if (loading) {
    return (
      <div className="category-list-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh mục sản phẩm...</p>
        <DebugInfo />
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-list-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
        <DebugInfo />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="category-list-empty">
        <p>Không tìm thấy danh mục sản phẩm nào</p>
        <DebugInfo />
      </div>
    );
  }

  return (
    <div className="category-list-container">
      <DebugInfo />
      <div className="category-list">
        {categories.map((category) => {
          const formattedCategory = formatCategoryForDisplay(category);
          return (
            <Link 
              to={`/danh-muc/${formattedCategory.slug}`} 
              key={formattedCategory.id} 
              className="category-item"
            >
              <div className="category-image">
                <img 
                  src={formattedCategory.image} 
                  alt={formattedCategory.name} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/images/placeholder.jpg'; // Fallback image
                  }}
                />
              </div>
              <div className="category-info">
                <h3 className="category-name">{formattedCategory.name}</h3>
                {showProductCount && (
                  <span className="category-product-count">
                    {formattedCategory.productCount} sản phẩm
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryList; 