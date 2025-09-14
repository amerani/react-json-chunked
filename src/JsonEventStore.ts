import { JsonStreamReader } from "./JsonStreamReader";
import { SimpleJsonTokenizer } from "./SimpleJsonTokenizer";

export function JsonEventStore<R>(url: string|URL|Request, fetchOptions: RequestInit) {
    let retryCount = 0;
    let currentData: R|undefined;
    const listeners = new Set();

    const reader = new JsonStreamReader({
      url, 
      fetchOptions,
      tokenizer: new SimpleJsonTokenizer(), 
    });

    reader.onpartialjson((e: Event) => {
      const custom = e as CustomEvent<any>;
      currentData = {...custom.detail};
      listeners.forEach((listener: any) => listener());
    });
    
    reader.onend(() => {
      currentData = undefined;
    });

    reader.onerror(() => {
      retryCount++;
      if (retryCount >= 3) {
        retryCount = 0;
      }
    });

    function subscribe(callback: () => void) {
      listeners.add(callback);

      return () => listeners.delete(callback);
    }

    function getSnapshot() {
      return currentData;
    }

    return {
      start: () => reader.start(),
      subscribe,
      getSnapshot,
    }
}