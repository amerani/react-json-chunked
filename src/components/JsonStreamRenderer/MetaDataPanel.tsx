import React from 'react';
import { MetaData } from '../../types/JsonStreamTypes';

interface MetaDataPanelProps {
  metaData: MetaData;
}

export const MetaDataPanel: React.FC<MetaDataPanelProps> = ({ metaData }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="metadata-panel">
      <h2>📋 Dataset Information</h2>
      
      <div className="metadata-grid">
        <div className="metadata-item">
          <div className="metadata-icon">🏷️</div>
          <div className="metadata-content">
            <div className="metadata-label">Version</div>
            <div className="metadata-value version-badge">
              v{metaData?.version}
            </div>
          </div>
        </div>

        <div className="metadata-item">
          <div className="metadata-icon">📅</div>
          <div className="metadata-content">
            <div className="metadata-label">Generated At</div>
            <div className="metadata-value">
              {formatDate(metaData?.generatedAt)}
            </div>
          </div>
        </div>

        <div className="metadata-item">
          <div className="metadata-icon">📊</div>
          <div className="metadata-content">
            <div className="metadata-label">Total Records</div>
            <div className="metadata-value">
              {metaData?.totalRecords?.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="metadata-item full-width">
          <div className="metadata-icon">📝</div>
          <div className="metadata-content">
            <div className="metadata-label">Description</div>
            <div className="metadata-value description">
              {metaData?.description}
            </div>
          </div>
        </div>
      </div>

      <div className="metadata-footer">
        <div className="status-indicator">
          <div className="status-dot active"></div>
          <span>Dataset Active</span>
        </div>
        <div className="last-updated">
          Last updated: {formatDate(metaData?.generatedAt)}
        </div>
      </div>
    </div>
  );
};
