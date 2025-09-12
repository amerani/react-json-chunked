import React, { useRef, useEffect } from 'react';
import { JsonStreamData } from '../../types/JsonStreamTypes';
import { UserCard } from './UserCard'
import { ProductCard } from './ProductCard';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ConfigPanel } from './ConfigPanel';
import { MetaDataPanel } from './MetaDataPanel';
import './styles.css';

interface JsonStreamRendererProps {
  data: JsonStreamData | null | undefined;
  className?: string;
}

const SectionLoadingSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="section-loading">
      <div className="section-spinner">
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
      </div>
      <p className="section-loading-text">{message}</p>
    </div>
  );
};

export const JsonStreamRenderer: React.FC<JsonStreamRendererProps> = ({ 
  data, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect when data changes
  useEffect(() => {
    if (data) {
      // Use multiple approaches to ensure scrolling works
      const scrollToBottom = () => {
        // Find the scrollable parent panel (.ui-panel)
        const uiPanel = containerRef.current?.closest('.ui-panel') as HTMLElement;
        if (uiPanel) {
          uiPanel.scrollTop = uiPanel.scrollHeight;
        }
      };

      // Try immediate scroll
      scrollToBottom();
      
      // Try with requestAnimationFrame
      requestAnimationFrame(scrollToBottom);
      
      // Try with a small delay as fallback
      setTimeout(scrollToBottom, 10);
    }
  }, [data]);

  return (
    <div className={`json-stream-renderer ${className}`} ref={containerRef}>

      <div className="renderer-grid">
        {/* Meta Data Section */}
        {/* <section className="meta-section">
          {data?.metaData ? (
            <MetaDataPanel metaData={data.metaData} />
          ) : (
            <SectionLoadingSpinner message="Loading metadata..." />
          )}
        </section> */}

        {/* Users Section */}
        <section className="users-section">
          <h2>Users ({data?.users?.length || 0})</h2>
          <div className="users-grid">
            {data?.users && data.users.length > 0 ? (
              data.users.map((user: any) => (
                <UserCard key={user.id} user={user} />
              ))
            ) : (
              <SectionLoadingSpinner message="Loading users..." />
            )}
          </div>
        </section>

        {/* Products Section */}
        <section className="products-section">
          <h2>Products ({data?.products?.length || 0})</h2>
          <div className="products-grid">
            {data?.products && data.products.length > 0 ? (
              data.products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <SectionLoadingSpinner message="Loading products..." />
            )}
          </div>
        </section>

        {/* Analytics Section */}
        <section className="analytics-section">
          {data?.analytics ? (
            <AnalyticsDashboard analytics={data.analytics} />
          ) : (
            <SectionLoadingSpinner message="Loading analytics..." />
          )}
        </section>

        {/* Configuration Section */}
        {/* <section className="config-section">
          {data?.config ? (
            <ConfigPanel config={data.config} />
          ) : (
            <SectionLoadingSpinner message="Loading configuration..." />
          )}
        </section> */}
      </div>
    </div>
  );
};
