import React, { useState } from 'react'
import * as ReactDOM from 'react-dom/client'
import './index.css'
import { useJsonStream, JsonStreamRenderer } from './dist/ReactJSONStream'
import { RawJsonViewer } from './src/components/RawJsonViewer'
import "./dist/ReactJSONStream.styles.css";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);

function App() {
    const jsonStream = useJsonStream('http://localhost:3001/stream-json') || {};
    const [viewMode, setViewMode] = useState<'ui' | 'json' | 'both'>('both');

    return (
        <div className="app-container">
            <div className="app-header">
                <h1>JSON Stream Viewer</h1>
                <div className="view-controls">
                    <button 
                        className={`view-button ${viewMode === 'ui' ? 'active' : ''}`}
                        onClick={() => setViewMode('ui')}
                    >
                        UI Only
                    </button>
                    <button 
                        className={`view-button ${viewMode === 'both' ? 'active' : ''}`}
                        onClick={() => setViewMode('both')}
                    >
                        Side by Side
                    </button>
                    <button 
                        className={`view-button ${viewMode === 'json' ? 'active' : ''}`}
                        onClick={() => setViewMode('json')}
                    >
                        JSON Only
                    </button>
                </div>
            </div>
            
            <div className={`app-content ${viewMode}`}>
                {viewMode === 'ui' || viewMode === 'both' ? (
                    <div className="ui-panel">
                        <JsonStreamRenderer data={jsonStream} />
                    </div>
                ) : null}
                
                {viewMode === 'json' || viewMode === 'both' ? (
                    <div className="json-panel">
                        <RawJsonViewer data={jsonStream} />
                    </div>
                ) : null}
            </div>
        </div>
    )
}