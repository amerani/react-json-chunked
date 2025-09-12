import React from 'react'
import * as ReactDOM from 'react-dom/client'
import './index.css'
import { useJsonStream } from './dist/ReactJSONStream';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);

function App() {
    const jsonStream = useJsonStream('https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json') || [];
    return (
        <>
            {jsonStream.length > 0 && jsonStream.map((item) => (
                <span key={item.id}>{item.name}</span>
            ))}
        </>   
    )
}