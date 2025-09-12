import React, { useState } from 'react'
import * as ReactDOM from 'react-dom/client'
import { JsonStreamRenderer } from './demo/JsonStreamRenderer'
import { RawJsonViewer } from './demo/RawJsonViewer'
import { useJsonStream } from './dist/ReactJSONStream'
import './index.css'

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