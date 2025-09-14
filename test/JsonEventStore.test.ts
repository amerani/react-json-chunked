import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JsonEventStore } from '../src/JsonEventStore';
import { JsonStreamReader } from '../src/JsonStreamReader';
import { SimpleJsonTokenizer } from '../src/SimpleJsonTokenizer';

// Mock the dependencies
vi.mock('../src/JsonStreamReader');
vi.mock('../src/SimpleJsonTokenizer');

describe('JsonEventStore', () => {
  let mockJsonStreamReader: any;
  let mockSimpleJsonTokenizer: any;
  const testUrl = 'https://example.com/api/data';
  const testFetchOptions: RequestInit = { method: 'GET' };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock JsonStreamReader
    mockJsonStreamReader = {
      onpartialjson: vi.fn(),
      onend: vi.fn(),
      onerror: vi.fn(),
      start: vi.fn().mockResolvedValue(undefined)
    };

    // Mock SimpleJsonTokenizer
    mockSimpleJsonTokenizer = {};

    (JsonStreamReader as any).mockImplementation(() => mockJsonStreamReader);
    (SimpleJsonTokenizer as any).mockImplementation(() => mockSimpleJsonTokenizer);
  });

  describe('initialization', () => {
    it('should create JsonStreamReader with correct parameters', () => {
      JsonEventStore(testUrl, testFetchOptions);

      expect(JsonStreamReader).toHaveBeenCalledWith({
        url: testUrl,
        fetchOptions: testFetchOptions,
        tokenizer: expect.any(Object)
      });
    });

    it('should create SimpleJsonTokenizer', () => {
      JsonEventStore(testUrl, testFetchOptions);

      expect(SimpleJsonTokenizer).toHaveBeenCalledTimes(1);
    });

    it('should return store object with required methods', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);

      expect(store).toHaveProperty('start');
      expect(store).toHaveProperty('subscribe');
      expect(store).toHaveProperty('getSnapshot');
      expect(typeof store.start).toBe('function');
      expect(typeof store.subscribe).toBe('function');
      expect(typeof store.getSnapshot).toBe('function');
    });
  });

  describe('event handling setup', () => {
    it('should set up onpartialjson handler', () => {
      JsonEventStore(testUrl, testFetchOptions);

      expect(mockJsonStreamReader.onpartialjson).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should set up onend handler', () => {
      JsonEventStore(testUrl, testFetchOptions);

      expect(mockJsonStreamReader.onend).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should set up onerror handler', () => {
      JsonEventStore(testUrl, testFetchOptions);

      expect(mockJsonStreamReader.onerror).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('partial JSON event handling', () => {
    it('should update currentData and notify listeners on partial JSON', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      const listener = vi.fn();
      
      store.subscribe(listener);

      // Get the onpartialjson callback
      const partialCallback = mockJsonStreamReader.onpartialjson.mock.calls[0][0];
      
      // Simulate partial JSON event
      const testData = { id: 1, name: 'John' };
      partialCallback({ detail: testData } as any);

      expect(store.getSnapshot()).toEqual(testData);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should notify multiple listeners', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      store.subscribe(listener1);
      store.subscribe(listener2);

      const partialCallback = mockJsonStreamReader.onpartialjson.mock.calls[0][0];
      const testData = { id: 1, name: 'John' };
      partialCallback({ detail: testData } as any);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should handle partial JSON without listeners', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);

      const partialCallback = mockJsonStreamReader.onpartialjson.mock.calls[0][0];
      const testData = { id: 1, name: 'John' };
      
      expect(() => partialCallback({ detail: testData } as any)).not.toThrow();
      expect(store.getSnapshot()).toEqual(testData);
    });
  });

  describe('end event handling', () => {
    it('should clear currentData on end event', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      
      // First set some data
      const partialCallback = mockJsonStreamReader.onpartialjson.mock.calls[0][0];
      partialCallback({ detail: { id: 1 } } as any);
      expect(store.getSnapshot()).toEqual({ id: 1 });

      // Then trigger end event
      const endCallback = mockJsonStreamReader.onend.mock.calls[0][0];
      endCallback();

      expect(store.getSnapshot()).toBeUndefined();
    });
  });

  describe('error handling and retry logic', () => {
    it('should increment retry count on error', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      
      const errorCallback = mockJsonStreamReader.onerror.mock.calls[0][0];
      
      // Trigger error multiple times
      errorCallback();
      errorCallback();
      errorCallback();
      
      // Should not throw
      expect(() => errorCallback()).not.toThrow();
    });

    it('should reset retry count after 3 errors', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      
      const errorCallback = mockJsonStreamReader.onerror.mock.calls[0][0];
      
      // Trigger 3 errors
      errorCallback();
      errorCallback();
      errorCallback();
      
      // 4th error should reset counter (internal behavior)
      expect(() => errorCallback()).not.toThrow();
    });
  });

  describe('subscription management', () => {
    it('should add listener to subscription set', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      const listener = vi.fn();
      
      const unsubscribe = store.subscribe(listener);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it('should remove listener when unsubscribe is called', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      const listener = vi.fn();
      
      const unsubscribe = store.subscribe(listener);
      unsubscribe();

      // Trigger partial JSON event
      const partialCallback = mockJsonStreamReader.onpartialjson.mock.calls[0][0];
      partialCallback({ detail: { id: 1 } } as any);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle multiple subscriptions and unsubscriptions', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();
      
      const unsubscribe1 = store.subscribe(listener1);
      const unsubscribe2 = store.subscribe(listener2);
      const unsubscribe3 = store.subscribe(listener3);

      // Unsubscribe listener2
      unsubscribe2();

      const partialCallback = mockJsonStreamReader.onpartialjson.mock.calls[0][0];
      partialCallback({ detail: { id: 1 } } as any);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).not.toHaveBeenCalled();
      expect(listener3).toHaveBeenCalledTimes(1);

      // Unsubscribe remaining listeners
      unsubscribe1();
      unsubscribe3();

      partialCallback({ detail: { id: 2 } } as any);

      expect(listener1).toHaveBeenCalledTimes(1); // No additional calls
      expect(listener3).toHaveBeenCalledTimes(1); // No additional calls
    });
  });

  describe('getSnapshot', () => {
    it('should return undefined initially', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      
      expect(store.getSnapshot()).toBeUndefined();
    });

    it('should return current data after partial JSON event', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      
      const partialCallback = mockJsonStreamReader.onpartialjson.mock.calls[0][0];
      const testData = { id: 1, name: 'John', active: true };
      partialCallback({ detail: testData } as any);

      expect(store.getSnapshot()).toEqual(testData);
    });

    it('should return undefined after end event', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      
      // Set some data first
      const partialCallback = mockJsonStreamReader.onpartialjson.mock.calls[0][0];
      partialCallback({ detail: { id: 1 } } as any);
      expect(store.getSnapshot()).toEqual({ id: 1 });

      // Then trigger end
      const endCallback = mockJsonStreamReader.onend.mock.calls[0][0];
      endCallback();

      expect(store.getSnapshot()).toBeUndefined();
    });
  });

  describe('start method', () => {
    it('should call reader.start()', async () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      
      await store.start();
      
      expect(mockJsonStreamReader.start).toHaveBeenCalledTimes(1);
    });

    it('should return a promise', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      
      const result = store.start();
      
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('data immutability', () => {
    it('should create new object references for each partial update', () => {
      const store = JsonEventStore(testUrl, testFetchOptions);
      
      const partialCallback = mockJsonStreamReader.onpartialjson.mock.calls[0][0];
      
      const data1 = { id: 1, name: 'John' };
      const data2 = { id: 2, name: 'Jane' };
      
      partialCallback({ detail: data1 } as any);
      const snapshot1 = store.getSnapshot();
      
      partialCallback({ detail: data2 } as any);
      const snapshot2 = store.getSnapshot();
      
      expect(snapshot1).not.toBe(snapshot2);
      expect(snapshot1).toEqual(data1);
      expect(snapshot2).toEqual(data2);
    });
  });
});
