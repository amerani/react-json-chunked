import React, { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import { JsonStreamRenderer, RawJsonViewer, JsonStreamData } from './demo/client/index.js';
import { useJsonStream } from './dist/index.js';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);

const MAX_RUN_TIME = 10000;

function App() {
    const [abortController] = useState(new AbortController());

    useEffect(() => {
        setTimeout(() => {
            abortController.abort();
        }, MAX_RUN_TIME);
    }, []);

    const jsonStream = useJsonStream<JsonStreamData>('http://localhost:3001/stream-json', {
        signal: abortController.signal
    });

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