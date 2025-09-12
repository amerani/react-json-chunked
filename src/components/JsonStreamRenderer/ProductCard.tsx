import React, { useState } from 'react';
import { Product } from '../../types/JsonStreamTypes';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'electronics': return '#3b82f6';
      case 'accessories': return '#10b981';
      case 'office': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="product-card">
      <div className="product-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <div className="product-meta">
            <span 
              className="category-badge"
              style={{ backgroundColor: getCategoryColor(product.category) }}
            >
              {product.category}
            </span>
            <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {product.inStock ? '✅ In Stock' : ''}
            </span>
          </div>
        </div>
        <div className="product-price">
          ${product?.price?.toFixed(2)}
        </div>
        <div className="expand-icon">
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      {isExpanded && (
        <div className="product-details">
          {/* Specifications */}
          <div className="detail-section">
            <h4>Specifications</h4>
            <div className="specs-grid">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="spec-item">
                  <span className="spec-label">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                  </span>
                  <span className="spec-value">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="detail-section">
            <h4>Reviews ({product.reviews.length})</h4>
            <div className="reviews-list">
              {product.reviews.map((review: any, index: number) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <div className="review-rating">
                      <span className="stars">{getRatingStars(review.rating)}</span>
                      <span className="rating-number">({review.rating}/5)</span>
                    </div>
                    <div className="review-date">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="review-comment">
                    "{review.comment}"
                  </div>
                  <div className="review-user">
                    User #{review.userId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
