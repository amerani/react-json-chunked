import React from 'react'
import * as ReactDOM from 'react-dom/client'
import { JsonStreamRenderer, RawJsonViewer, JsonStreamData } from './demo/client/index.js'
import { useJsonStream } from './dist/index.js'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);

function App() {
    const jsonStream = useJsonStream<JsonStreamData>('http://localhost:3001/stream-json');

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