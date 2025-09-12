import React, { useState } from 'react';
import { Config } from '../../types/JsonStreamTypes';

interface ConfigPanelProps {
  config: Config;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState<'features' | 'limits' | 'integrations'>('features');

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'userRegistration': return '👤';
      case 'emailNotifications': return '📧';
      case 'socialLogin': return '🔗';
      case 'twoFactorAuth': return '🔐';
      default: return '⚙️';
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'stripe': return '💳';
      case 'sendgrid': return '📬';
      default: return '🔌';
    }
  };

  return (
    <div className="config-panel">
      <h2>⚙️ Configuration Panel</h2>
      
      {/* Tab Navigation */}
      <div className="config-tabs">
        <button 
          className={`tab-button ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          🎛️ Features
        </button>
        <button 
          className={`tab-button ${activeTab === 'limits' ? 'active' : ''}`}
          onClick={() => setActiveTab('limits')}
        >
          📊 Limits
        </button>
        <button 
          className={`tab-button ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          🔌 Integrations
        </button>
      </div>

      {/* Tab Content */}
      <div className="config-content">
        {activeTab === 'features' && (
          <div className="features-section">
            <h3>Feature Flags</h3>
            <div className="features-grid">
              {Object.entries(config?.features || {}).map(([feature, enabled]) => (
                <div key={feature} className="feature-item">
                  <div className="feature-icon">
                    {getFeatureIcon(feature)}
                  </div>
                  <div className="feature-info">
                    <div className="feature-name">
                      {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div className={`feature-status ${enabled ? 'enabled' : 'disabled'}`}>
                      {enabled ? '✅ Enabled' : '❌ Disabled'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'limits' && (
          <div className="limits-section">
            <h3>System Limits</h3>
            <div className="limits-grid">
              <div className="limit-item">
                <div className="limit-icon">📁</div>
                <div className="limit-info">
                  <div className="limit-name">Max File Size</div>
                  <div className="limit-value">{config?.limits?.maxFileSize}</div>
                </div>
              </div>
              
              <div className="limit-item">
                <div className="limit-icon">👥</div>
                <div className="limit-info">
                  <div className="limit-name">Max Users</div>
                  <div className="limit-value">{config?.limits?.maxUsers.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="limit-item">
                <div className="limit-icon">🚦</div>
                <div className="limit-info">
                  <div className="limit-name">Rate Limit</div>
                  <div className="limit-value">
                    {config?.limits?.rateLimit.requests} requests per {config?.limits?.rateLimit.window}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="integrations-section">
            <h3>Third-party Integrations</h3>
            <div className="integrations-list">
              {config?.integrations.map((integration: any, index: number) => (
                <div key={index} className="integration-item">
                  <div className="integration-header">
                    <div className="integration-icon">
                      {getIntegrationIcon(integration.type)}
                    </div>
                    <div className="integration-info">
                      <div className="integration-name">{integration.name}</div>
                      <div className="integration-type">{integration.type}</div>
                    </div>
                    <div className={`integration-status ${integration.enabled ? 'enabled' : 'disabled'}`}>
                      {integration.enabled ? '✅ Active' : '❌ Inactive'}
                    </div>
                  </div>
                  
                  {integration.enabled && (
                    <div className="integration-config">
                      <h4>Configuration</h4>
                      <div className="config-items">
                        {Object.entries(integration?.config || {}).map(([key, value]) => (
                          <div key={key} className="config-item">
                            <span className="config-key">{key}:</span>
                            <span className="config-value">
                              {key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') 
                                ? '••••••••' 
                                : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
