import React from 'react';
import { JsonStreamData } from '../../types/JsonStreamTypes';
import { UserCard } from './UserCard'
import { ProductCard } from './ProductCard';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ConfigPanel } from './ConfigPanel';
import { MetaDataPanel } from './MetaDataPanel';
import './styles.css';

interface JsonStreamRendererProps {
  data: JsonStreamData;
  className?: string;
}

export const JsonStreamRenderer: React.FC<JsonStreamRendererProps> = ({ 
  data, 
  className = '' 
}) => {
  return (
    <div className={`json-stream-renderer ${className}`}>
      <div className="renderer-header">
        <h1>JSON Stream Dashboard</h1>
      </div>

      <div className="renderer-grid">
        {/* Meta Data Section */}
        <section className="meta-section">
          <MetaDataPanel metaData={data.metaData} />
        </section>

        {/* Analytics Section */}
        <section className="analytics-section">
          <AnalyticsDashboard analytics={data.analytics} />
        </section>

        {/* Users Section */}
        <section className="users-section">
          <h2>Users ({data.users?.length})</h2>
          <div className="users-grid">
            {data.users?.map((user: any) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </section>

        {/* Products Section */}
        <section className="products-section">
          <h2>Products ({data.products?.length})</h2>
          <div className="products-grid">
            {data.products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Configuration Section */}
        <section className="config-section">
          <ConfigPanel config={data.config} />
        </section>
      </div>
    </div>
  );
};
