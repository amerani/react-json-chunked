import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AbstractJsonStreamReader } from '../src/AbstractJsonStreamReader';
import { AbstractJsonTokenizer } from '../src/AbstractJsonTokenizer';

// Mock implementation for testing
class MockJsonTokenizer extends AbstractJsonTokenizer {
  write(chunk: string): void {
    // Mock implementation
  }
}

class TestJsonStreamReader extends AbstractJsonStreamReader {
  private partialCallback?: (event: Event) => void;
  private endCallback?: (event: Event) => void;
  private errorCallback?: (event: Event) => void;

  constructor(url: string | URL | Request, tokenizer: AbstractJsonTokenizer, fetchOptions: RequestInit) {
    super(url, tokenizer, fetchOptions);
  }

  onpartialjson(callback: (event: Event) => void): void {
    this.partialCallback = callback;
  }

  onend(callback: (event: Event) => void): void {
    this.endCallback = callback;
  }

  onerror(callback: (event: Event) => void): void {
    this.errorCallback = callback;
  }

  async start(): Promise<void> {
    // Mock implementation
  }

  // Test helper methods
  triggerPartialEvent(data: any) {
    if (this.partialCallback) {
      this.partialCallback(new CustomEvent('partial', { detail: data }));
    }
  }

  triggerEndEvent() {
    if (this.endCallback) {
      this.endCallback(new Event('end'));
    }
  }

  triggerErrorEvent(error: Error) {
    if (this.errorCallback) {
      this.errorCallback(new CustomEvent('error', { detail: error }));
    }
  }
}

describe('AbstractJsonStreamReader', () => {
  let reader: TestJsonStreamReader;
  let tokenizer: MockJsonTokenizer;
  const testUrl = 'https://example.com/api/data';
  const testFetchOptions: RequestInit = { method: 'GET' };

  beforeEach(() => {
    tokenizer = new MockJsonTokenizer();
    reader = new TestJsonStreamReader(testUrl, tokenizer, testFetchOptions);
  });

  describe('constructor', () => {
    it('should initialize with provided parameters', () => {
      expect(reader.url).toBe(testUrl);
      expect(reader.tokenizer).toBe(tokenizer);
      expect(reader.fetchOptions).toBe(testFetchOptions);
    });

    it('should extend EventTarget', () => {
      expect(reader).toBeInstanceOf(EventTarget);
    });

    it('should accept URL object as url parameter', () => {
      const urlObj = new URL('https://example.com/api');
      const readerWithUrl = new TestJsonStreamReader(urlObj, tokenizer, testFetchOptions);
      expect(readerWithUrl.url).toBe(urlObj);
    });

    it('should accept Request object as url parameter', () => {
      const request = new Request('https://example.com/api');
      const readerWithRequest = new TestJsonStreamReader(request, tokenizer, testFetchOptions);
      expect(readerWithRequest.url).toBe(request);
    });
  });

  describe('abstract methods', () => {
    it('should have onpartialjson method', () => {
      expect(typeof reader.onpartialjson).toBe('function');
    });

    it('should have onend method', () => {
      expect(typeof reader.onend).toBe('function');
    });

    it('should have onerror method', () => {
      expect(typeof reader.onerror).toBe('function');
    });

    it('should have start method', () => {
      expect(typeof reader.start).toBe('function');
    });
  });

  describe('event handling', () => {
    it('should register partial event callback', () => {
      const callback = vi.fn();
      reader.onpartialjson(callback);
      
      const testData = { test: 'data' };
      reader.triggerPartialEvent(testData);
      
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        type: 'partial',
        detail: testData
      }));
    });

    it('should register end event callback', () => {
      const callback = vi.fn();
      reader.onend(callback);
      
      reader.triggerEndEvent();
      
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        type: 'end'
      }));
    });

    it('should register error event callback', () => {
      const callback = vi.fn();
      reader.onerror(callback);
      
      const testError = new Error('Test error');
      reader.triggerErrorEvent(testError);
      
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        type: 'error',
        detail: testError
      }));
    });

    it('should handle multiple event callbacks', () => {
      const partialCallback1 = vi.fn();
      const partialCallback2 = vi.fn();
      
      reader.onpartialjson(partialCallback1);
      reader.onpartialjson(partialCallback2);
      
      const testData = { test: 'data' };
      reader.triggerPartialEvent(testData);
      
      // Only the last callback should be called (overwrites previous)
      expect(partialCallback1).not.toHaveBeenCalled();
      expect(partialCallback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('inheritance', () => {
    it('should be able to create custom implementations', () => {
      class CustomReader extends AbstractJsonStreamReader {
        onpartialjson(callback: (event: Event) => void): void {}
        onend(callback: (event: Event) => void): void {}
        onerror(callback: (event: Event) => void): void {}
        async start(): Promise<void> {}
      }

      const customReader = new CustomReader(testUrl, tokenizer, testFetchOptions);
      expect(customReader).toBeInstanceOf(AbstractJsonStreamReader);
      expect(customReader).toBeInstanceOf(EventTarget);
    });
  });
});
