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

    return (
        <div className="app-container">
            <div className={`app-content both`}>
                    <div className="ui-panel">
                        <JsonStreamRenderer data={jsonStream} />
                    </div>
                
                    <div className="json-panel">
                        <RawJsonViewer data={jsonStream} />
                    </div>
            </div>
        </div>
    )
}