import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useJsonStream from '../src/useJsonStream';
import { JsonEventStore } from '../src/JsonEventStore';

// Mock the JsonEventStore
vi.mock('../src/JsonEventStore');

describe('useJsonStream', () => {
  let mockEventStore: any;
  const testUrl = 'https://example.com/api/data';
  const testFetchOptions: RequestInit = { method: 'GET' };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock JsonEventStore
    mockEventStore = {
      start: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn().mockReturnValue(() => {}),
      getSnapshot: vi.fn().mockReturnValue(undefined)
    };

    (JsonEventStore as any).mockReturnValue(mockEventStore);
  });

  describe('hook initialization', () => {
    it('should create JsonEventStore with correct parameters', () => {
      renderHook(() => useJsonStream(testUrl, testFetchOptions));

      expect(JsonEventStore).toHaveBeenCalledWith(testUrl, testFetchOptions);
    });

    it('should create JsonEventStore with empty object when fetchOptions not provided', () => {
      renderHook(() => useJsonStream(testUrl));

      expect(JsonEventStore).toHaveBeenCalledWith(testUrl, {});
    });

    it('should return the snapshot from event store', () => {
      const testData = { id: 1, name: 'John' };
      mockEventStore.getSnapshot.mockReturnValue(testData);

      const { result } = renderHook(() => useJsonStream(testUrl, testFetchOptions));

      expect(result.current).toBe(testData);
    });

    it('should return undefined when no data is available', () => {
      mockEventStore.getSnapshot.mockReturnValue(undefined);

      const { result } = renderHook(() => useJsonStream(testUrl, testFetchOptions));

      expect(result.current).toBeUndefined();
    });
  });

  describe('event store subscription', () => {
    it('should subscribe to event store changes', () => {
      renderHook(() => useJsonStream(testUrl, testFetchOptions));

      expect(mockEventStore.subscribe).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should unsubscribe when component unmounts', () => {
      const unsubscribe = vi.fn();
      mockEventStore.subscribe.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useJsonStream(testUrl, testFetchOptions));

      unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('should handle subscription updates', () => {
      const testData1 = { id: 1, name: 'John' };
      const testData2 = { id: 2, name: 'Jane' };

      // First render
      mockEventStore.getSnapshot.mockReturnValue(testData1);
      const { result, rerender } = renderHook(() => useJsonStream(testUrl, testFetchOptions));

      expect(result.current).toBe(testData1);

      // Simulate data change
      mockEventStore.getSnapshot.mockReturnValue(testData2);
      rerender();

      expect(result.current).toBe(testData2);
    });
  });

  describe('automatic start', () => {
    it('should call start on event store when component mounts', async () => {
      renderHook(() => useJsonStream(testUrl, testFetchOptions));

      // Wait for useEffect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockEventStore.start).toHaveBeenCalledTimes(1);
    });

    it('should not call start multiple times on re-renders', async () => {
      const { rerender } = renderHook(() => useJsonStream(testUrl, testFetchOptions));

      // Wait for initial useEffect
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Re-render with same dependencies
      rerender();

      // Wait for any additional effects
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockEventStore.start).toHaveBeenCalledTimes(1);
    });

    it('should handle start promise rejection gracefully', async () => {
      const error = new Error('Start failed');
      mockEventStore.start.mockRejectedValue(error);

      // Should not throw
      expect(() => {
        renderHook(() => useJsonStream(testUrl, testFetchOptions));
      }).not.toThrow();

      // Wait for useEffect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockEventStore.start).toHaveBeenCalledTimes(1);
    });
  });

  describe('memoization', () => {
    it('should memoize event store creation with same URL', () => {
      const { rerender } = renderHook(() => useJsonStream(testUrl, testFetchOptions));

      expect(JsonEventStore).toHaveBeenCalledTimes(1);

      // Re-render with same URL
      rerender();

      expect(JsonEventStore).toHaveBeenCalledTimes(1);
    });

    it('should create new event store when URL changes', () => {
      const { rerender } = renderHook(
        ({ url }) => useJsonStream(url, testFetchOptions),
        { initialProps: { url: testUrl } }
      );

      expect(JsonEventStore).toHaveBeenCalledTimes(1);

      // Change URL
      const newUrl = 'https://example.com/api/other';
      rerender({ url: newUrl });

      expect(JsonEventStore).toHaveBeenCalledTimes(2);
      expect(JsonEventStore).toHaveBeenLastCalledWith(newUrl, testFetchOptions);
    });

    it('should handle URL object changes', () => {
      const url1 = new URL('https://example.com/api/data');
      const url2 = new URL('https://example.com/api/other');

      const { rerender } = renderHook(
        ({ url }) => useJsonStream(url, testFetchOptions),
        { initialProps: { url: url1 } }
      );

      expect(JsonEventStore).toHaveBeenCalledTimes(1);

      rerender({ url: url2 });

      expect(JsonEventStore).toHaveBeenCalledTimes(2);
      expect(JsonEventStore).toHaveBeenLastCalledWith(url2, testFetchOptions);
    });

    it('should handle Request object changes', () => {
      const request1 = new Request('https://example.com/api/data');
      const request2 = new Request('https://example.com/api/other');

      const { rerender } = renderHook(
        ({ url }) => useJsonStream(url, testFetchOptions),
        { initialProps: { url: request1 } }
      );

      expect(JsonEventStore).toHaveBeenCalledTimes(1);

      rerender({ url: request2 });

      expect(JsonEventStore).toHaveBeenCalledTimes(2);
      expect(JsonEventStore).toHaveBeenLastCalledWith(request2, testFetchOptions);
    });
  });

  describe('data flow', () => {

    it('should handle null and undefined data', () => {
      // Test with null
      mockEventStore.getSnapshot.mockReturnValue(null);
      const { result: result1 } = renderHook(() => useJsonStream(testUrl, testFetchOptions));
      expect(result1.current).toBeNull();

      // Test with undefined
      mockEventStore.getSnapshot.mockReturnValue(undefined);
      const { result: result2 } = renderHook(() => useJsonStream(testUrl, testFetchOptions));
      expect(result2.current).toBeUndefined();
    });

    it('should handle complex nested data structures', () => {
      const complexData = {
        users: [
          { id: 1, name: 'John', active: true },
          { id: 2, name: 'Jane', active: false }
        ],
        metadata: {
          total: 2,
          page: 1
        }
      };

      mockEventStore.getSnapshot.mockReturnValue(complexData);
      const { result } = renderHook(() => useJsonStream(testUrl, testFetchOptions));

      expect(result.current).toEqual(complexData);
    });
  });

  describe('error handling', () => {
    it('should handle event store creation errors', () => {
      const error = new Error('Event store creation failed');
      (JsonEventStore as any).mockImplementation(() => {
        throw error;
      });

      expect(() => {
        renderHook(() => useJsonStream(testUrl, testFetchOptions));
      }).toThrow(error);
    });

    it('should handle subscription errors', () => {
      const error = new Error('Subscription failed');
      mockEventStore.subscribe.mockImplementation(() => {
        throw error;
      });

      expect(() => {
        renderHook(() => useJsonStream(testUrl, testFetchOptions));
      }).toThrow(error);
    });

    it('should handle getSnapshot errors', () => {
      const error = new Error('Get snapshot failed');
      mockEventStore.getSnapshot.mockImplementation(() => {
        throw error;
      });

      expect(() => {
        renderHook(() => useJsonStream(testUrl, testFetchOptions));
      }).toThrow(error);
    });
  });

  describe('TypeScript integration', () => {
    it('should work with typed data', () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const userData: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockEventStore.getSnapshot.mockReturnValue(userData);
      const { result } = renderHook(() => useJsonStream<User>(testUrl, testFetchOptions));

      expect(result.current).toEqual(userData);
      expect(result.current?.id).toBe(1);
      expect(result.current?.name).toBe('John Doe');
      expect(result.current?.email).toBe('john@example.com');
    });
  });
});
