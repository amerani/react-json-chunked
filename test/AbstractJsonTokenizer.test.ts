import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AbstractJsonTokenizer } from '../src/AbstractJsonTokenizer';

// Mock implementation for testing
class TestJsonTokenizer extends AbstractJsonTokenizer {
  write(chunk: string): void {
    // Mock implementation that can be controlled in tests
    this._mockWrite(chunk);
  }

  // Test helper methods
  private _mockWrite(chunk: string): void {
    // Simulate parsing and triggering events
    if (chunk.includes('{')) {
      this.onopenobject?.();
    }
    if (chunk.includes('}')) {
      this.oncloseobject?.();
    }
    if (chunk.includes('[')) {
      this.onopenarray?.();
    }
    if (chunk.includes(']')) {
      this.onclosearray?.();
    }
    if (chunk.includes('"test"')) {
      this.onkey?.('test');
    }
    if (chunk.includes('"value"')) {
      this.onvalue?.('value');
    }
    if (chunk.includes('error')) {
      this.onerror?.(new Error('Test error'));
    }
  }
}

describe('AbstractJsonTokenizer', () => {
  let tokenizer: TestJsonTokenizer;

  beforeEach(() => {
    tokenizer = new TestJsonTokenizer();
  });

  describe('constructor', () => {
    it('should initialize with undefined event handlers', () => {
      expect(tokenizer.onopenobject).toBeUndefined();
      expect(tokenizer.onkey).toBeUndefined();
      expect(tokenizer.onvalue).toBeUndefined();
      expect(tokenizer.oncloseobject).toBeUndefined();
      expect(tokenizer.onopenarray).toBeUndefined();
      expect(tokenizer.onclosearray).toBeUndefined();
      expect(tokenizer.onerror).toBeUndefined();
    });
  });

  describe('abstract methods', () => {
    it('should have write method', () => {
      expect(typeof tokenizer.write).toBe('function');
    });

    it('should accept string parameter in write method', () => {
      expect(() => tokenizer.write('test')).not.toThrow();
    });
  });

  describe('event handlers', () => {
    it('should call onopenobject when set', () => {
      const callback = vi.fn();
      tokenizer.onopenobject = callback;
      
      tokenizer.write('{');
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call oncloseobject when set', () => {
      const callback = vi.fn();
      tokenizer.oncloseobject = callback;
      
      tokenizer.write('}');
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call onopenarray when set', () => {
      const callback = vi.fn();
      tokenizer.onopenarray = callback;
      
      tokenizer.write('[');
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call onclosearray when set', () => {
      const callback = vi.fn();
      tokenizer.onclosearray = callback;
      
      tokenizer.write(']');
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call onkey when set', () => {
      const callback = vi.fn();
      tokenizer.onkey = callback;
      
      tokenizer.write('"test"');
      
      expect(callback).toHaveBeenCalledWith('test');
    });

    it('should call onvalue when set', () => {
      const callback = vi.fn();
      tokenizer.onvalue = callback;
      
      tokenizer.write('"value"');
      
      expect(callback).toHaveBeenCalledWith('value');
    });

    it('should call onerror when set', () => {
      const callback = vi.fn();
      tokenizer.onerror = callback;
      
      tokenizer.write('error');
      
      expect(callback).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should not throw when event handlers are undefined', () => {
      expect(() => {
        tokenizer.write('{');
        tokenizer.write('}');
        tokenizer.write('[');
        tokenizer.write(']');
        tokenizer.write('"test"');
        tokenizer.write('"value"');
        tokenizer.write('error');
      }).not.toThrow();
    });
  });

  describe('event handler types', () => {
    it('should accept onopenobject with optional key parameter', () => {
      const callbackWithKey = vi.fn();
      const callbackWithoutKey = vi.fn();
      
      tokenizer.onopenobject = callbackWithKey;
      tokenizer.write('{');
      
      expect(callbackWithKey).toHaveBeenCalled();
      
      // Test with key parameter (if implementation supports it)
      tokenizer.onopenobject = callbackWithoutKey;
      tokenizer.write('{');
      
      expect(callbackWithoutKey).toHaveBeenCalled();
    });

    it('should accept onkey with string parameter', () => {
      const callback = vi.fn();
      tokenizer.onkey = callback;
      
      tokenizer.write('"test"');
      
      expect(callback).toHaveBeenCalledWith('test');
    });

    it('should accept onvalue with any type parameter', () => {
      const callback = vi.fn();
      tokenizer.onvalue = callback;
      
      tokenizer.write('"value"');
      
      expect(callback).toHaveBeenCalledWith('value');
    });

    it('should accept onerror with Error parameter', () => {
      const callback = vi.fn();
      tokenizer.onerror = callback;
      
      tokenizer.write('error');
      
      expect(callback).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('inheritance', () => {
    it('should be able to create custom implementations', () => {
      class CustomTokenizer extends AbstractJsonTokenizer {
        write(chunk: string): void {
          // Custom implementation
        }
      }

      const customTokenizer = new CustomTokenizer();
      expect(customTokenizer).toBeInstanceOf(AbstractJsonTokenizer);
      expect(typeof customTokenizer.write).toBe('function');
    });

    it('should allow overriding event handlers in subclasses', () => {
      class CustomTokenizer implements AbstractJsonTokenizer {
        onopenobject?: (key?: string) => void;
        onkey?: (key: string) => void;
        onvalue?: (value: any) => void;
        oncloseobject?: () => void;
        onopenarray?: () => void;
        onclosearray?: () => void;
        onerror?: (err: Error) => void;

        write(chunk: string): void {
          // Custom implementation
        }
      }

      const customTokenizer = new CustomTokenizer();
      expect(customTokenizer.onopenobject).toBeUndefined();
      expect(customTokenizer.onkey).toBeUndefined();
      expect(customTokenizer.onvalue).toBeUndefined();
      expect(customTokenizer.oncloseobject).toBeUndefined();
      expect(customTokenizer.onopenarray).toBeUndefined();
      expect(customTokenizer.onclosearray).toBeUndefined();
      expect(customTokenizer.onerror).toBeUndefined();
    });
  });

  describe('multiple event handling', () => {
    it('should handle multiple events in sequence', () => {
      const openObjectCallback = vi.fn();
      const keyCallback = vi.fn();
      const valueCallback = vi.fn();
      const closeObjectCallback = vi.fn();

      tokenizer.onopenobject = openObjectCallback;
      tokenizer.onkey = keyCallback;
      tokenizer.onvalue = valueCallback;
      tokenizer.oncloseobject = closeObjectCallback;

      tokenizer.write('{"test":"value"}');

      expect(openObjectCallback).toHaveBeenCalledTimes(1);
      expect(keyCallback).toHaveBeenCalledWith('test');
      expect(valueCallback).toHaveBeenCalledWith('value');
      expect(closeObjectCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle array events', () => {
      const openArrayCallback = vi.fn();
      const valueCallback = vi.fn();
      const closeArrayCallback = vi.fn();

      tokenizer.onopenarray = openArrayCallback;
      tokenizer.onvalue = valueCallback;
      tokenizer.onclosearray = closeArrayCallback;

      tokenizer.write('["value"]');

      expect(openArrayCallback).toHaveBeenCalledTimes(1);
      expect(valueCallback).toHaveBeenCalledWith('value');
      expect(closeArrayCallback).toHaveBeenCalledTimes(1);
    });
  });
});
