import React, { useState } from 'react';
import ApiTest from '../../components/ApiTest';
import ProductsByCategory from '../../components/ProductsByCategory';
import './styles.css';

const TestPage: React.FC = () => {
  const [categorySlug, setCategorySlug] = useState<string>('');
  const [showProductsByCategory, setShowProductsByCategory] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowProductsByCategory(true);
  };

  return (
    <div className="test-page-container">
      <h1>API & Components Test Page</h1>
      
      <section className="test-section">
        <h2>1. API Connection Test</h2>
        <ApiTest />
      </section>
      
      <section className="test-section">
        <h2>2. ProductsByCategory Component Test</h2>
        <div className="test-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="categorySlug">Enter Category Slug:</label>
              <input
                type="text"
                id="categorySlug"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                placeholder="e.g. ban"
                required
              />
            </div>
            <button type="submit">Load Products</button>
          </form>
        </div>
        
        {showProductsByCategory && categorySlug && (
          <div className="component-test-result">
            <h3>Results for category slug: {categorySlug}</h3>
            <ProductsByCategory key={categorySlug} />
          </div>
        )}
      </section>
    </div>
  );
};

export default TestPage; 