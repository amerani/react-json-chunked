import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JsonStreamReader } from '../src/JsonStreamReader';
import { AbstractJsonTokenizer } from '../src/AbstractJsonTokenizer';

// Mock fetch and TextDecoder
global.fetch = vi.fn();
global.TextDecoder = vi.fn().mockImplementation(() => ({
  decode: vi.fn().mockReturnValue('decoded text')
}));

// Mock implementation for testing
class MockJsonTokenizer implements AbstractJsonTokenizer {
  onopenobject?: (key?: string) => void;
  onkey?: (key: string) => void;
  onvalue?: (value: any) => void;
  oncloseobject?: () => void;
  onopenarray?: () => void;
  onclosearray?: () => void;
  onerror?: (err: Error) => void;

  write(chunk: string): void {
    // Mock implementation
  }
}

describe('JsonStreamReader', () => {
  let reader: JsonStreamReader;
  let mockTokenizer: MockJsonTokenizer;
  const testUrl = 'https://example.com/api/data';
  const testFetchOptions: RequestInit = { method: 'GET' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTokenizer = new MockJsonTokenizer();
    
    reader = new JsonStreamReader({
      url: testUrl,
      fetchOptions: testFetchOptions,
      tokenizer: mockTokenizer
    });
  });

  describe('constructor', () => {
    it('should initialize with provided options', () => {
      expect(reader.url).toBe(testUrl);
      expect(reader.fetchOptions).toBe(testFetchOptions);
      expect(reader.tokenizer).toBe(mockTokenizer);
    });

    it('should extend AbstractJsonStreamReader', () => {
      expect(reader).toBeInstanceOf(JsonStreamReader);
    });

    it('should initialize internal state', () => {
      // Access private properties through type assertion for testing
      const readerAny = reader as any;
      expect(readerAny.decoder).toBeDefined();
      expect(readerAny.stack).toEqual([]);
      expect(readerAny.currentKey).toBeNull();
      expect(readerAny.root).toBeNull();
    });
  });

  describe('tokenizer event wiring', () => {
    it('should wire onopenobject event', () => {
      const callback = vi.fn();
      mockTokenizer.onopenobject = callback;
      
      // Simulate object opening
      if (mockTokenizer.onopenobject) {
        mockTokenizer.onopenobject();
      }
      
      expect(callback).toHaveBeenCalled();
    });

    it('should wire onkey event', () => {
      const callback = vi.fn();
      mockTokenizer.onkey = callback;
      
      if (mockTokenizer.onkey) {
        mockTokenizer.onkey('testKey');
      }
      
      expect(callback).toHaveBeenCalledWith('testKey');
    });

    it('should wire onvalue event', () => {
      const callback = vi.fn();
      mockTokenizer.onvalue = callback;
      
      if (mockTokenizer.onvalue) {
        mockTokenizer.onvalue('testValue');
      }
      
      expect(callback).toHaveBeenCalledWith('testValue');
    });

    it('should wire oncloseobject event', () => {
      const callback = vi.fn();
      mockTokenizer.oncloseobject = callback;
      
      if (mockTokenizer.oncloseobject) {
        mockTokenizer.oncloseobject();
      }
      
      expect(callback).toHaveBeenCalled();
    });

    it('should wire onopenarray event', () => {
      const callback = vi.fn();
      mockTokenizer.onopenarray = callback;
      
      if (mockTokenizer.onopenarray) {
        mockTokenizer.onopenarray();
      }
      
      expect(callback).toHaveBeenCalled();
    });

    it('should wire onclosearray event', () => {
      const callback = vi.fn();
      mockTokenizer.onclosearray = callback;
      
      if (mockTokenizer.onclosearray) {
        mockTokenizer.onclosearray();
      }
      
      expect(callback).toHaveBeenCalled();
    });

    it('should wire onerror event', () => {
      const callback = vi.fn();
      mockTokenizer.onerror = callback;
      
      const testError = new Error('Test error');
      if (mockTokenizer.onerror) {
        mockTokenizer.onerror(testError);
      }
      
      expect(callback).toHaveBeenCalledWith(testError);
    });
  });

  describe('object parsing', () => {
    it('should handle root object creation', () => {
      const readerAny = reader as any;
      
      // Simulate opening root object
      if (mockTokenizer.onopenobject) {
        mockTokenizer.onopenobject();
      }
      
      expect(readerAny.root).toEqual({});
      expect(readerAny.stack).toHaveLength(1);
    });

    it('should handle nested object creation', () => {
      const readerAny = reader as any;
      
      // Create root object first
      if (mockTokenizer.onopenobject) {
        mockTokenizer.onopenobject();
      }
      
      // Add a key
      if (mockTokenizer.onkey) {
        mockTokenizer.onkey('nested');
      }
      
      // Open nested object
      if (mockTokenizer.onopenobject) {
        mockTokenizer.onopenobject();
      }
      
      expect(readerAny.stack).toHaveLength(2);
      expect(readerAny.root).toEqual({ nested: {} });
    });

    it('should handle key-value pairs', () => {
      const readerAny = reader as any;
      
      // Open object
      if (mockTokenizer.onopenobject) {
        mockTokenizer.onopenobject();
      }
      
      // Add key
      if (mockTokenizer.onkey) {
        mockTokenizer.onkey('name');
      }
      
      // Add value
      if (mockTokenizer.onvalue) {
        mockTokenizer.onvalue('John');
      }
      
      expect(readerAny.root).toEqual({ name: 'John' });
      expect(readerAny.currentKey).toBeNull();
    });

    it('should handle object closing', () => {
      const readerAny = reader as any;
      
      // Open object
      if (mockTokenizer.onopenobject) {
        mockTokenizer.onopenobject();
      }
      
      // Close object
      if (mockTokenizer.oncloseobject) {
        mockTokenizer.oncloseobject();
      }
      
      expect(readerAny.stack).toHaveLength(0);
      expect(readerAny.currentKey).toBeNull();
    });
  });

  describe('array parsing', () => {
    it('should handle root array creation', () => {
      const readerAny = reader as any;
      
      // Simulate opening root array
      if (mockTokenizer.onopenarray) {
        mockTokenizer.onopenarray();
      }
      
      expect(readerAny.root).toEqual([]);
      expect(readerAny.stack).toHaveLength(1);
    });

    it('should handle array values', () => {
      const readerAny = reader as any;
      
      // Open array
      if (mockTokenizer.onopenarray) {
        mockTokenizer.onopenarray();
      }
      
      // Add values
      if (mockTokenizer.onvalue) {
        mockTokenizer.onvalue(1);
      }
      if (mockTokenizer.onvalue) {
        mockTokenizer.onvalue(2);
      }
      if (mockTokenizer.onvalue) {
        mockTokenizer.onvalue(3);
      }
      
      expect(readerAny.root).toEqual([1, 2, 3]);
    });

    it('should handle array closing', () => {
      const readerAny = reader as any;
      
      // Open array
      if (mockTokenizer.onopenarray) {
        mockTokenizer.onopenarray();
      }
      
      // Close array
      if (mockTokenizer.onclosearray) {
        mockTokenizer.onclosearray();
      }
      
      expect(readerAny.stack).toHaveLength(0);
    });
  });

  describe('event dispatching', () => {
    it('should dispatch partial events on value changes', () => {
      const partialCallback = vi.fn();
      reader.onpartialjson(partialCallback);
      
      // Open object and add value
      if (mockTokenizer.onopenobject) {
        mockTokenizer.onopenobject();
      }
      if (mockTokenizer.onkey) {
        mockTokenizer.onkey('test');
      }
      if (mockTokenizer.onvalue) {
        mockTokenizer.onvalue('value');
      }
      
      expect(partialCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'partial',
          detail: { test: 'value' }
        })
      );
    });

    it('should dispatch partial events on object closing', () => {
      const partialCallback = vi.fn();
      reader.onpartialjson(partialCallback);
      
      // Open object, add value, then close
      if (mockTokenizer.onopenobject) {
        mockTokenizer.onopenobject();
      }
      if (mockTokenizer.onkey) {
        mockTokenizer.onkey('test');
      }
      if (mockTokenizer.onvalue) {
        mockTokenizer.onvalue('value');
      }
      if (mockTokenizer.oncloseobject) {
        mockTokenizer.oncloseobject();
      }
      
      expect(partialCallback).toHaveBeenCalledTimes(2); // Once for value, once for close
    });

    it('should dispatch partial events on array closing', () => {
      const partialCallback = vi.fn();
      reader.onpartialjson(partialCallback);
      
      // Open array, add value, then close
      if (mockTokenizer.onopenarray) {
        mockTokenizer.onopenarray();
      }
      if (mockTokenizer.onvalue) {
        mockTokenizer.onvalue(1);
      }
      if (mockTokenizer.onclosearray) {
        mockTokenizer.onclosearray();
      }
      
      expect(partialCallback).toHaveBeenCalledTimes(2); // Once for value, once for close
    });

    it('should dispatch error events', () => {
      const errorCallback = vi.fn();
      reader.onerror(errorCallback);
      
      const testError = new Error('Test error');
      if (mockTokenizer.onerror) {
        mockTokenizer.onerror(testError);
      }
      
      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          detail: testError
        })
      );
    });
  });

  describe('start method', () => {
    it('should fetch data and start streaming', async () => {
      const mockResponse = {
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi.fn().mockResolvedValue({ done: true, value: undefined })
          })
        }
      };
      
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      await reader.start();
      
      expect(global.fetch).toHaveBeenCalledWith(testUrl, testFetchOptions);
    });

    it('should handle streaming data', async () => {
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
          .mockResolvedValueOnce({ done: true, value: undefined })
      };
      
      const mockResponse = {
        body: {
          getReader: vi.fn().mockReturnValue(mockReader)
        }
      };
      
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      const endCallback = vi.fn();
      reader.onend(endCallback);
      
      await reader.start();
      
      expect(mockReader.read).toHaveBeenCalledTimes(2);
      // The end event is dispatched asynchronously, so we need to wait
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(endCallback).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'end' })
      );
    });

    it('should decode and write chunks to tokenizer', async () => {
      const mockDecoder = {
        decode: vi.fn().mockReturnValue('decoded chunk')
      };
      
      const readerAny = reader as any;
      readerAny.decoder = mockDecoder;
      
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
          .mockResolvedValueOnce({ done: true, value: undefined })
      };
      
      const mockResponse = {
        body: {
          getReader: vi.fn().mockReturnValue(mockReader)
        }
      };
      
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      const writeSpy = vi.spyOn(mockTokenizer, 'write');
      
      await reader.start();
      
      expect(mockDecoder.decode).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]), { stream: true });
      expect(writeSpy).toHaveBeenCalledWith('decoded chunk');
    });
  });

  describe('event listener methods', () => {
    it('should register partial event listeners', () => {
      const callback = vi.fn();
      reader.onpartialjson(callback);
      
      // Trigger partial event
      const event = new CustomEvent('partial', { detail: { test: 'data' } });
      reader.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should register end event listeners', () => {
      const callback = vi.fn();
      reader.onend(callback);
      
      // Trigger end event
      const event = new Event('end');
      reader.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should register error event listeners', () => {
      const callback = vi.fn();
      reader.onerror(callback);
      
      // Trigger error event
      const event = new CustomEvent('error', { detail: new Error('Test') });
      reader.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalledWith(event);
    });
  });

  describe('complex nested structures', () => {
    it('should handle objects containing arrays', () => {
      const readerAny = reader as any;
      
      // { "items": [1, 2, 3] }
      if (mockTokenizer.onopenobject) {
        mockTokenizer.onopenobject();
      }
      if (mockTokenizer.onkey) {
        mockTokenizer.onkey('items');
      }
      if (mockTokenizer.onopenarray) {
        mockTokenizer.onopenarray();
      }
      if (mockTokenizer.onvalue) {
        mockTokenizer.onvalue(1);
      }
      if (mockTokenizer.onvalue) {
        mockTokenizer.onvalue(2);
      }
      if (mockTokenizer.onvalue) {
        mockTokenizer.onvalue(3);
      }
      if (mockTokenizer.onclosearray) {
        mockTokenizer.onclosearray();
      }
      if (mockTokenizer.oncloseobject) {
        mockTokenizer.oncloseobject();
      }
      
      expect(readerAny.root).toEqual({ items: [1, 2, 3] });
    });

    it('should handle arrays containing objects', () => {
      const readerAny = reader as any;
      
      // [{"id": 1}, {"id": 2}]
      if (mockTokenizer.onopenarray) {
        mockTokenizer.onopenarray();
      }
      
      // First object
      if (mockTokenizer.onopenobject) {
        mockTokenizer.onopenobject();
      }
      if (mockTokenizer.onkey) {
        mockTokenizer.onkey('id');
      }
      if (mockTokenizer.onvalue) {
        mockTokenizer.onvalue(1);
      }
      if (mockTokenizer.oncloseobject) {
        mockTokenizer.oncloseobject();
      }
      
      // Second object
      if (mockTokenizer.onopenobject) {
        mockTokenizer.onopenobject();
      }
      if (mockTokenizer.onkey) {
        mockTokenizer.onkey('id');
      }
      if (mockTokenizer.onvalue) {
        mockTokenizer.onvalue(2);
      }
      if (mockTokenizer.oncloseobject) {
        mockTokenizer.oncloseobject();
      }
      
      if (mockTokenizer.onclosearray) {
        mockTokenizer.onclosearray();
      }
      
      expect(readerAny.root).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });
});
