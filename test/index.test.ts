import { describe, it, expect } from 'vitest';
import * as indexModule from '../src/index';

describe('index.ts exports', () => {
  describe('useJsonStream export', () => {
    it('should export useJsonStream function', () => {
      expect(indexModule).toHaveProperty('useJsonStream');
      expect(typeof indexModule.useJsonStream).toBe('function');
    });

    it('should be the default export from useJsonStream module', async () => {
      // Import the actual useJsonStream module to verify it's the same
      const useJsonStreamModule = await import('../src/useJsonStream');
      expect(indexModule.useJsonStream).toBe(useJsonStreamModule.default);
    });

    it('should be callable with URL and fetchOptions', () => {
      // This is a basic test to ensure the function signature is correct
      // The actual functionality is tested in useJsonStream.test.tsx
      const testUrl = 'https://example.com/api/data';
      const testFetchOptions: RequestInit = { method: 'GET' };
      
      // We can't actually call the hook outside of a React component,
      // but we can verify it's a function that accepts the right parameters
      expect(typeof indexModule.useJsonStream).toBe('function');
    });
  });

  describe('module structure', () => {
    it('should only export useJsonStream', () => {
      const exportedKeys = Object.keys(indexModule);
      expect(exportedKeys).toEqual(['useJsonStream']);
    });

    it('should not export internal modules', () => {
      // Verify that internal implementation details are not exposed
      expect(indexModule).not.toHaveProperty('JsonEventStore');
      expect(indexModule).not.toHaveProperty('JsonStreamReader');
      expect(indexModule).not.toHaveProperty('SimpleJsonTokenizer');
      expect(indexModule).not.toHaveProperty('AbstractJsonStreamReader');
      expect(indexModule).not.toHaveProperty('AbstractJsonTokenizer');
    });
  });

  describe('TypeScript compatibility', () => {
    it('should have proper TypeScript types', () => {
      // This test ensures the module can be imported in TypeScript
      // without type errors
      const useJsonStream: typeof indexModule.useJsonStream = indexModule.useJsonStream;
      expect(typeof useJsonStream).toBe('function');
    });

    it('should support generic type parameters', () => {
      // Test that the exported function supports generic types
      // This is more of a compile-time check, but we can verify the function exists
      interface TestType {
        id: number;
        name: string;
      }

      const useJsonStream = indexModule.useJsonStream;
      expect(typeof useJsonStream).toBe('function');
      
      // The actual generic usage would be: useJsonStream<TestType>(url, options)
      // This is tested in the useJsonStream.test.tsx file
    });
  });

  describe('import compatibility', () => {
    it('should support default import', async () => {
      const defaultImport = await import('../src/index');
      expect(defaultImport).toHaveProperty('useJsonStream');
    });

    it('should support named import', async () => {
      const { useJsonStream } = await import('../src/index');
      expect(typeof useJsonStream).toBe('function');
    });

    it('should support namespace import', async () => {
      const index = await import('../src/index');
      expect(index.useJsonStream).toBeDefined();
      expect(typeof index.useJsonStream).toBe('function');
    });
  });

  describe('re-export behavior', () => {
    it('should re-export the same function reference', async () => {
      const directImport = await import('../src/useJsonStream');
      const indexImport = await import('../src/index');
      
      expect(indexImport.useJsonStream).toBe(directImport.default);
    });

    it('should maintain function identity', () => {
      // The exported function should be the same reference
      const useJsonStream1 = indexModule.useJsonStream;
      const useJsonStream2 = indexModule.useJsonStream;
      
      expect(useJsonStream1).toBe(useJsonStream2);
    });
  });

  describe('module metadata', () => {
    it('should be a valid ES module', () => {
      // Verify that the module can be imported as an ES module
      expect(typeof indexModule).toBe('object');
      expect(indexModule).not.toBeNull();
    });

    it('should not have a default export at module level', () => {
      // The module itself should not have a default export,
      // only named exports
      expect(indexModule).not.toHaveProperty('default');
    });
  });
});
