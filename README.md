# React JSON Chunked

A React library for streaming and processing JSON data using chunked Transfer-Encoding. This library provides a React hook that allows you to consume JSON data as it streams from a server, enabling real-time updates and efficient handling of large datasets.

## Features

- 🎣 **Custom Hook**: Exports a custom `useJsonStream` hook for consuming JSON chunks
- ⚛️ **React Integration**: Built with native `useSyncExternalStore` hook for optimal rendering
- 🎨 **Streaming UI**: Render UI using partial JSON, without waiting for the complete response
- 🧠 **Memory Efficient**: Processes large datasets incrementally to minimize memory usage
- 🎯 **Event-Driven**: Leverages [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) and [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) for propagating JSON chunks
- 📦 **TypeScript Support**: Full TypeScript support with generic type parameters
- 🔄 **Error Handling**: Built-in retry logic and error handling

## Installation

```bash
npm install react-json-chunked
```

## Quick Start

```tsx
import React from 'react';
import { useJsonStream } from 'react-json-chunked';

interface MyData {
  users: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  metadata: {
    total: number;
    page: number;
  };
}

function App() {
  const jsonStream = useJsonStream<MyData>('http://localhost:3001/stream-json');

  if (!jsonStream) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Users ({jsonStream.metadata?.total || 0})</h1>
      {jsonStream.users?.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### `useJsonStream<T>(url: string)`

A React hook that streams JSON data from the specified URL.

**Parameters:**
- `url` (string): The URL to fetch JSON data from

**Returns:**
- `T | undefined`: The current state of the JSON data, or `undefined` while loading

**Generic Type:**
- `T`: The expected shape of your JSON data

## How It Works

The library consists of several key components:

### Core Architecture

1. **JsonStreamReader**: Handles the low-level streaming and parsing of JSON data
2. **SimpleJsonTokenizer**: Tokenizes incoming JSON chunks into parseable events
3. **JsonEventStore**: Manages the state and provides React integration
4. **useJsonStream**: The React hook that ties everything together

### Data Flow

1. The `useJsonStream` hook creates a `JsonEventStore` instance
2. The store initializes a `JsonStreamReader` with a `SimpleJsonTokenizer`
3. The reader fetches data from the URL and processes it incrementally
4. As JSON tokens are parsed, partial data is emitted and stored
5. React components re-render automatically when new data arrives

### Error Handling

The library includes automatic retry logic:
- Up to 3 retry attempts on connection errors
- Automatic retry count reset after successful connections
- Error events are properly handled and can be monitored

## Server Requirements

Your server should support chunked Transfer-Encoding. Here's a simple Node.js example:

```javascript
app.get('/stream-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  
  // Stream your JSON data
  const data = { users: [...], metadata: {...} };
  res.write(JSON.stringify(data));
  res.end();
});
```

## TypeScript Support

The library is written in TypeScript and provides full type safety:

```tsx
interface ApiResponse {
  data: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  pagination: {
    page: number;
    totalPages: number;
  };
}

const streamData = useJsonStream<ApiResponse>('/api/stream');
// streamData is typed as ApiResponse | undefined
```

## Performance Considerations

- The library processes JSON incrementally, making it suitable for large datasets
- Memory usage is optimized by processing data as it arrives
- React's `useSyncExternalStore` ensures efficient re-rendering
- The tokenizer handles partial JSON gracefully

## License

MIT

## Author

Alek Merani

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.