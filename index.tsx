import React from 'react'
import * as ReactDOM from 'react-dom/client'
import './index.css'
import { useJsonStream } from './dist/ReactJSONStream';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);

function App() {
    const jsonStream = useJsonStream('http://localhost:3001/stream-json') || {};
    return (
        <>
            {<div>{JSON.stringify(jsonStream, null, 2)}</div>}
        </>   
    )
}