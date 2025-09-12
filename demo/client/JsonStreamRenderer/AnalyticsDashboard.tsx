import React from 'react';
import { Analytics } from '../types/JsonStreamTypes';

interface AnalyticsDashboardProps {
  analytics: Analytics;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="analytics-dashboard">
      <h2>📊 Analytics Dashboard</h2>
      
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-value">{formatNumber(analytics?.totalUsers)}</div>
            <div className="metric-label">Total Users</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <div className="metric-value">{formatNumber(analytics?.totalOrders)}</div>
            <div className="metric-label">Total Orders</div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="analytics-section">
        <h3>🏆 Top Categories</h3>
        <div className="categories-list">
          {analytics?.topCategories?.map((category: any, index: number) => (
            <div key={category.name} className="category-item">
              <div className="category-rank">#{index + 1}</div>
              <div className="category-info">
                <div className="category-name">{category.name}</div>
                <div className="category-stats">
                  <span className="category-count">{formatNumber(category.count)} orders</span>
                  <span className="category-revenue">{formatCurrency(category.revenue)}</span>
                </div>
              </div>
              <div className="category-bar">
                <div 
                  className="category-fill"
                  style={{ 
                    width: `${(category.revenue / analytics?.topCategories[0].revenue) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Stats */}
      {/* <div className="analytics-section">
        <h3>📅 Monthly Statistics</h3>
        <div className="monthly-stats">
          {analytics?.monthlyStats?.map((month: any) => (
            <div key={month.month} className="month-card">
              <div className="month-header">
                <h4>{month.month}</h4>
              </div>
              <div className="month-metrics">
                <div className="month-metric">
                  <span className="month-metric-label">Users:</span>
                  <span className="month-metric-value">{formatNumber(month.users)}</span>
                </div>
                <div className="month-metric">
                  <span className="month-metric-label">Orders:</span>
                  <span className="month-metric-value">{formatNumber(month.orders)}</span>
                </div>
                <div className="month-metric">
                  <span className="month-metric-label">Revenue:</span>
                  <span className="month-metric-value">{formatCurrency(month.revenue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};
