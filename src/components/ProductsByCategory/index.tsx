import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCategoryBySlug, fetchProductsByCategory } from '../../services/categoryService';
import type { Category, Product } from '../../types';
import './styles.css';

// Set to true to enable debug information
const IS_DEBUG_MODE = true;

interface ProductsByCategoryProps {
  initialPage?: number;
  pageSize?: number;
}

const ProductsByCategory: React.FC<ProductsByCategoryProps> = ({
  initialPage = 1,
  pageSize = 12
}) => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const loadCategoryAndProducts = async () => {
      if (!slug) {
        setError('No category slug provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setDebugInfo('Fetching category data...');
        
        // Fetch category details
        const categoryData = await fetchCategoryBySlug(slug);
        setDebugInfo(prev => `${prev}\nCategory data received: ${categoryData ? 'Yes' : 'No'}`);
        
        if (!categoryData) {
          setError(`Category not found for slug: ${slug}`);
          setLoading(false);
          return;
        }
        
        setCategory(categoryData);
        setDebugInfo(prev => `${prev}\nCategory ID: ${categoryData.category_id}`);
        
        // Fetch products for this category
        setDebugInfo(prev => `${prev}\nFetching products for category ID: ${categoryData.category_id}...`);
        const productsData = await fetchProductsByCategory(categoryData.category_id, {
          page: currentPage,
          pageSize: pageSize
        });
        
        setDebugInfo(prev => `${prev}\nProducts data received: ${productsData ? 'Yes' : 'No'}`);
        
        if (productsData) {
          setProducts(productsData.items);
          setTotalPages(productsData.totalPages);
          setDebugInfo(prev => `${prev}\nProducts count: ${productsData.items.length}, Total pages: ${productsData.totalPages}`);
        } else {
          setProducts([]);
          setTotalPages(0);
          setDebugInfo(prev => `${prev}\nNo products data received`);
        }
        
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load category or products: ${errorMessage}`);
        setDebugInfo(prev => `${prev}\nError: ${errorMessage}`);
        console.error('Error loading category or products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryAndProducts();
  }, [slug, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Debug info component
  const DebugInfo = () => (
    IS_DEBUG_MODE ? (
      <div className="debug-info">
        <p>Debug Info:</p>
        <pre>{debugInfo}</pre>
      </div>
    ) : null
  );

  if (loading) {
    return (
      <div className="products-by-category-loading">
        Loading...
        <DebugInfo />
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-by-category-error">
        {error}
        <DebugInfo />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="products-by-category-not-found">
        Category not found
        <DebugInfo />
      </div>
    );
  }

  return (
    <div className="products-by-category-container">
      <DebugInfo />
      
      <div className="products-by-category-header">
        <h1 className="products-by-category-title">{category.category_name}</h1>
        <p className="products-by-category-count">
          {category.product_count} products
        </p>
      </div>

      {products.length === 0 ? (
        <div className="products-by-category-empty">
          No products found in this category
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">
                    {product.priceSale ? (
                      <>
                        <span className="original-price">
                          {product.price.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="sale-price">
                          {product.priceSale.toLocaleString('vi-VN')} đ
                        </span>
                      </>
                    ) : (
                      <span className="regular-price">
                        {product.price.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-button ${page === currentPage ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
              
              <button
                className="pagination-button"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsByCategory; 