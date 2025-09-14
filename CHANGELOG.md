# react-json-chunked

## 0.3.6

### Patch Changes

- setup change sets/logs

## 0.3.5

- 🎣 **Custom Hook**: Exports a custom `useJsonStream` hook for consuming JSON chunks
- ⚛️ **React Integration**: Built with native `useSyncExternalStore` hook for optimal rendering
- 🎨 **Streaming UI**: Render UI using partial JSON, without waiting for the complete response
- 🧠 **Memory Efficient**: Processes large datasets incrementally to minimize memory usage
- 🎯 **Event-Driven**: Leverages [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) and [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) for propagating JSON chunks
- 📦 **TypeScript Support**: Full TypeScript support with generic type parameters
- 🔄 **Error Handling**: Built-in retry logic and error handling
