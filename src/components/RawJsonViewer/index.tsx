import React, { useState, useEffect, useRef } from 'react';
import { JsonStreamData } from '../../types/JsonStreamTypes';
import './styles.css';

interface RawJsonViewerProps {
  data: JsonStreamData | null | undefined;
  className?: string;
}

export const RawJsonViewer: React.FC<RawJsonViewerProps> = ({ 
  data, 
  className = '' 
}) => {
  const [jsonString, setJsonString] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data) {
      try {
        const formatted = JSON.stringify(data, null, 2);
        setJsonString(formatted);
      } catch (error) {
        setJsonString('Error formatting JSON: ' + error);
      }
    } else {
      setJsonString('No data available');
    }
  }, [data]);

  // Separate effect for auto-scroll to ensure it runs after DOM update
  useEffect(() => {
    if (jsonString && jsonString !== 'No data available') {
      // Use multiple approaches to ensure scrolling works
      const scrollToBottom = () => {
        // Try scrolling the container first
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      };

      // Try immediate scroll
      scrollToBottom();
      
      // Try with requestAnimationFrame
      requestAnimationFrame(scrollToBottom);
      
      // Try with a small delay as fallback
      setTimeout(scrollToBottom, 10);
    }
  }, [jsonString]);

  return (
    <div className={`raw-json-viewer ${className}`}>
      <div className="json-viewer-header">
        <h2>Raw JSON Stream</h2>
      </div>
      
      <div className="json-content expanded" ref={containerRef}>
        <pre className="json-text">
          <code>{jsonString}</code>
        </pre>
      </div>
    </div>
  );
};
