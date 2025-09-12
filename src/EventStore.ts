import { JSONStreamReader } from "./JsonStreamReader";
import { SimpleJSONParser } from "./tokenizer";

export function EventStore<R>(url: string) {
    let retryCount = 0;
    let currentData: R|undefined;
    const listeners = new Set();

    const reader = new JSONStreamReader(url, new SimpleJSONParser());
    reader.addEventListener("partial", (e: Event) => {
      const custom = e as CustomEvent<any>;
      console.log("Partial object:", custom.detail);
      currentData = custom.detail;
      listeners.forEach((listener: any) => listener());
    });
    
    reader.addEventListener("end", () => {
      console.log("Stream complete.");
      currentData = undefined;
    });

    reader.addEventListener("error", () => {
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