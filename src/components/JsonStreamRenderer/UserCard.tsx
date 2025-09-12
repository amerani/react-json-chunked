import React, { useState } from 'react';
import { User } from '../../types/JsonStreamTypes';

interface UserCardProps {
  user: User;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'shipped': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return '🔐';
      case 'purchase': return '🛒';
      case 'view': return '👁️';
      case 'logout': return '🚪';
      default: return '📝';
    }
  };

  return (
    <div className="user-card">
      <div className="user-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="user-avatar">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <div className="user-location">
            📍 {user.profile?.location?.city}, {user.profile?.location?.country}
          </div>
        </div>
        <div className="expand-icon">
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      {isExpanded && (
        <div className="user-details">
          {/* Profile Information */}
          <div className="detail-section">
            <h4>Profile</h4>
            <div className="profile-grid">
              <div className="profile-item">
                <span className="label">Age:</span>
                <span className="value">{user.profile.age}</span>
              </div>
              <div className="profile-item">
                <span className="label">Theme:</span>
                <span className={`theme-badge ${user.profile.preferences.theme}`}>
                  {user.profile.preferences.theme}
                </span>
              </div>
              <div className="profile-item">
                <span className="label">Notifications:</span>
                <span className={`notification-status ${user.profile.preferences.notifications ? 'enabled' : 'disabled'}`}>
                  {user.profile.preferences.notifications ? '🔔' : '🔕'}
                </span>
              </div>
              <div className="profile-item">
                <span className="label">Language:</span>
                <span className="value">{user.profile.preferences.language}</span>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="detail-section">
            <h4>Orders ({user.orders.length})</h4>
            <div className="orders-list">
              {user.orders.map((order: any) => (
                <div key={order.orderId} className="order-item">
                  <div className="order-header">
                    <span className="order-id">{order.orderId}</span>
                    <span 
                      className="order-status"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <div className="order-date">
                      📅 {new Date(order.date).toLocaleDateString()}
                    </div>
                    <div className="order-total">
                      💰 ${order.total.toFixed(2)}
                    </div>
                    <div className="order-items">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="detail-section">
            <h4>Recent Activity</h4>
            <div className="activity-list">
              {user.activity.map((activity: any, index: number) => (
                <div key={index} className="activity-item">
                  <span className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </span>
                  <div className="activity-details">
                    <div className="activity-type">{activity.type}</div>
                    <div className="activity-time">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                    {activity.amount && (
                      <div className="activity-amount">${activity.amount}</div>
                    )}
                    {activity.productId && (
                      <div className="activity-product">Product: {activity.productId}</div>
                    )}
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
