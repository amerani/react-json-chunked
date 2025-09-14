import { describe, it, expect, beforeEach } from 'vitest';
import { SimpleJsonTokenizer } from '../src/SimpleJsonTokenizer';

describe('SimpleJsonTokenizer', () => {
  let parser: SimpleJsonTokenizer;
  let events: {
    onopenobject: any[];
    onkey: any[];
    onvalue: any[];
    oncloseobject: any[];
    onopenarray: any[];
    onclosearray: any[];
    onerror: any[];
  };

  beforeEach(() => {
    parser = new SimpleJsonTokenizer();
    events = {
      onopenobject: [],
      onkey: [],
      onvalue: [],
      oncloseobject: [],
      onopenarray: [],
      onclosearray: [],
      onerror: []
    };

    // Set up event handlers to capture all events
    parser.onopenobject = (key?: string) => events.onopenobject.push(key);
    parser.onkey = (key: string) => events.onkey.push(key);
    parser.onvalue = (value: any) => events.onvalue.push(value);
    parser.oncloseobject = () => events.oncloseobject.push(true);
    parser.onopenarray = () => events.onopenarray.push(true);
    parser.onclosearray = () => events.onclosearray.push(true);
    parser.onerror = (err: Error) => events.onerror.push(err);
  });

  describe('Object parsing', () => {
    it('should parse empty object', () => {
      parser.write('{}');
      
      expect(events.onopenobject).toHaveLength(1);
      expect(events.onopenobject[0]).toBeUndefined();
      expect(events.oncloseobject).toHaveLength(1);
      expect(events.onkey).toHaveLength(0);
      expect(events.onvalue).toHaveLength(0);
    });

    it('should parse object with string key-value pair', () => {
      parser.write('{"name":"John"}');
      
      expect(events.onopenobject).toHaveLength(1);
      expect(events.onkey).toHaveLength(1);
      expect(events.onkey[0]).toBe('name');
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe('John');
      expect(events.oncloseobject).toHaveLength(1);
    });

    it('should parse object with multiple key-value pairs', () => {
      parser.write('{"name":"John","age":30}');
      
      expect(events.onopenobject).toHaveLength(1);
      expect(events.onkey).toHaveLength(2);
      expect(events.onkey[0]).toBe('name');
      expect(events.onkey[1]).toBe('age');
      expect(events.onvalue).toHaveLength(2);
      expect(events.onvalue[0]).toBe('John');
      expect(events.onvalue[1]).toBe(30);
      expect(events.oncloseobject).toHaveLength(1);
    });


    it('should parse object with different value types', () => {
        parser.write('{"string":"hello","number":42,"boolean":true,"null":null}');
        
        expect(events.onkey).toHaveLength(4);
        expect(events.onkey[0]).toBe('string');
        expect(events.onkey[1]).toBe('number');
        expect(events.onkey[2]).toBe('boolean');
        expect(events.onkey[3]).toBe('null');
        
        expect(events.onvalue).toHaveLength(4);
        expect(events.onvalue[0]).toBe('hello');
        expect(events.onvalue[1]).toBe(42);
        expect(events.onvalue[2]).toBe(true);
        expect(events.onvalue[3]).toBe(null);
    });

    it('should parse object with different value types', () => {
      parser.write('{"user":{"name":"John","age":30}, "string":"hello","number":42,"boolean":true,"null":null}');
      
      expect(events.onkey[0]).toBe('user');
      expect(events.onkey[1]).toBe('name');
    });
  });

  describe('Array parsing', () => {
    it('should parse empty array', () => {
      parser.write('[]');
      
      expect(events.onopenarray).toHaveLength(1);
      expect(events.onclosearray).toHaveLength(1);
      expect(events.onvalue).toHaveLength(0);
    });

    it('should parse array with string values', () => {
      parser.write('["apple","banana","cherry"]');
      
      expect(events.onopenarray).toHaveLength(1);
      expect(events.onvalue).toHaveLength(3);
      expect(events.onvalue[0]).toBe('apple');
      expect(events.onvalue[1]).toBe('banana');
      expect(events.onvalue[2]).toBe('cherry');
      expect(events.onclosearray).toHaveLength(1);
    });

    it('should parse array with mixed value types', () => {
      parser.write('[1,"two",true,null]');
      
      expect(events.onopenarray).toHaveLength(1);
      expect(events.onvalue).toHaveLength(4);
      expect(events.onvalue[0]).toBe(1);
      expect(events.onvalue[1]).toBe('two');
      expect(events.onvalue[2]).toBe(true);
      expect(events.onvalue[3]).toBe(null);
      expect(events.onclosearray).toHaveLength(1);
    });
  });

  describe('String parsing', () => {
    it('should parse simple strings', () => {
      parser.write('"hello world"');
      
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe('hello world');
    });

    it('should parse empty string', () => {
      parser.write('""');
      
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe('');
    });

    it('should handle escaped backslashes in strings', () => {
      parser.write('"C:\\\\path\\\\to\\\\file"');
      
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe('C:\\\\path\\\\to\\\\file');
    });

    it('should handle other escape sequences', () => {
      parser.write('"Line 1\\nLine 2\\tTabbed"');
      
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe('Line 1\\nLine 2\\tTabbed');
    });
  });

  describe('Number parsing', () => {
    it('should parse positive integers', () => {
      parser.write('42');
      
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe(42);
    });

    it('should parse negative integers', () => {
      parser.write('-42');
      
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe(-42);
    });

    it('should parse positive floats', () => {
      parser.write('3.14');
      
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe(3.14);
    });

    it('should parse negative floats', () => {
      parser.write('-3.14');
      
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe(-3.14);
    });

    it('should parse scientific notation', () => {
      parser.write('1.23e4');
      
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe(12300);
    });

    it('should parse negative scientific notation', () => {
      parser.write('1.23e-4');
      
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe(0.000123);
    });
  });

  describe('Boolean and null parsing', () => {
    it('should parse true', () => {
      parser.write('true');
      
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe(true);
    });

    it('should parse false', () => {
      parser.write('false');
      
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe(false);
    });

    it('should parse null', () => {
      parser.write('null');
      
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe(null);
    });
  });

  describe('Nested structures', () => {
    it('should parse nested objects', () => {
      parser.write('{"user":{"name":"John","age":30}}');
      
      expect(events.onopenobject).toHaveLength(2);
      expect(events.onkey).toHaveLength(3);
      expect(events.onkey[0]).toBe('user');
      expect(events.onkey[1]).toBe('name');
      expect(events.onvalue).toHaveLength(2);
      expect(events.onvalue[0]).toBe('John');
      expect(events.onvalue[1]).toBe(30);
      expect(events.oncloseobject).toHaveLength(2);
    });

    it('should parse nested arrays', () => {
      parser.write('[[1,2],[3,4]]');
      
      expect(events.onopenarray).toHaveLength(3);
      expect(events.onvalue).toHaveLength(4);
      expect(events.onvalue[0]).toBe(1);
      expect(events.onvalue[1]).toBe(2);
      expect(events.onvalue[2]).toBe(3);
      expect(events.onvalue[3]).toBe(4);
      expect(events.onclosearray).toHaveLength(3);
    });

    it('should parse objects containing arrays', () => {
      parser.write('{"items":[1,2,3]}');
      
      expect(events.onopenobject).toHaveLength(1);
      expect(events.onopenarray).toHaveLength(1);
      expect(events.onkey).toHaveLength(1);
      expect(events.onkey[0]).toBe('items');
      expect(events.onvalue).toHaveLength(3);
      expect(events.onvalue[0]).toBe(1);
      expect(events.onvalue[1]).toBe(2);
      expect(events.onvalue[2]).toBe(3);
      expect(events.onclosearray).toHaveLength(1);
      expect(events.oncloseobject).toHaveLength(1);
    });

    it('should parse arrays containing objects', () => {
      parser.write('[{"id":1},{"id":2}]');
      
      expect(events.onopenarray).toHaveLength(1);
      expect(events.onopenobject).toHaveLength(2);
      expect(events.onkey).toHaveLength(2);
      expect(events.onkey[0]).toBe('id');
      expect(events.onkey[1]).toBe('id');
      expect(events.onvalue).toHaveLength(2);
      expect(events.onvalue[0]).toBe(1);
      expect(events.onvalue[1]).toBe(2);
      expect(events.oncloseobject).toHaveLength(2);
      expect(events.onclosearray).toHaveLength(1);
    });
  });

  describe('Streaming/chunked input', () => {
    it('should handle incomplete strings across chunks', () => {
      parser.write('{"name":"Jo');
      expect(events.onopenobject).toHaveLength(1);
      expect(events.onkey).toHaveLength(1);
      expect(events.onkey[0]).toBe('name');
      expect(events.onvalue).toHaveLength(0); // String not complete yet
      
      parser.write('hn"}');
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe('John');
      expect(events.oncloseobject).toHaveLength(1);
    });

    it('should handle incomplete numbers across chunks', () => {
      parser.write('{"age":3');
      expect(events.onopenobject).toHaveLength(1);
      expect(events.onkey).toHaveLength(1);
      expect(events.onkey[0]).toBe('age');
      expect(events.onvalue).toHaveLength(1); // Number is complete as "3"
      expect(events.onvalue[0]).toBe(3);
      
      parser.write('0}');
      expect(events.onvalue).toHaveLength(2);
      expect(events.onvalue[1]).toBe(0);
      expect(events.oncloseobject).toHaveLength(1);
    });

    it('should handle incomplete literals across chunks', () => {
      parser.write('{"flag":tru');
      expect(events.onvalue).toHaveLength(0); // Literal not complete yet
      
      parser.write('e}');
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe(true);
      expect(events.oncloseobject).toHaveLength(1);
    });

    it('should handle multiple complete objects in chunks', () => {
      parser.write('{"a":1}');
      expect(events.onopenobject).toHaveLength(1);
      expect(events.onkey).toHaveLength(1);
      expect(events.onvalue).toHaveLength(1);
      expect(events.oncloseobject).toHaveLength(1);
      
      // Reset events for second object
      events.onopenobject = [];
      events.onkey = [];
      events.onvalue = [];
      events.oncloseobject = [];
      
      parser.write('{"b":2}');
      expect(events.onopenobject).toHaveLength(1);
      expect(events.onkey).toHaveLength(1);
      expect(events.onvalue).toHaveLength(1);
      expect(events.oncloseobject).toHaveLength(1);
    });
  });

  describe('Whitespace handling', () => {
    it('should ignore whitespace between tokens', () => {
      parser.write('{ "name" : "John" , "age" : 30 }');
      
      expect(events.onopenobject).toHaveLength(1);
      expect(events.onkey).toHaveLength(2);
      expect(events.onkey[0]).toBe('name');
      expect(events.onkey[1]).toBe('age');
      expect(events.onvalue).toHaveLength(2);
      expect(events.onvalue[0]).toBe('John');
      expect(events.onvalue[1]).toBe(30);
      expect(events.oncloseobject).toHaveLength(1);
    });

    it('should handle newlines and tabs', () => {
      parser.write('{\n\t"name":\t"John"\n}');
      
      expect(events.onopenobject).toHaveLength(1);
      expect(events.onkey).toHaveLength(1);
      expect(events.onkey[0]).toBe('name');
      expect(events.onvalue).toHaveLength(1);
      expect(events.onvalue[0]).toBe('John');
      expect(events.oncloseobject).toHaveLength(1);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty input', () => {
      parser.write('');
      
      expect(events.onopenobject).toHaveLength(0);
      expect(events.onkey).toHaveLength(0);
      expect(events.onvalue).toHaveLength(0);
      expect(events.oncloseobject).toHaveLength(0);
      expect(events.onerror).toHaveLength(0);
    });

    it('should handle whitespace-only input', () => {
      parser.write('   \n\t  ');
      
      expect(events.onopenobject).toHaveLength(0);
      expect(events.onkey).toHaveLength(0);
      expect(events.onvalue).toHaveLength(0);
      expect(events.oncloseobject).toHaveLength(0);
      expect(events.onerror).toHaveLength(0);
    });

    it('should handle malformed JSON gracefully', () => {
      // This should not throw an error, but may not parse correctly
      parser.write('{"incomplete":');
      
      expect(events.onopenobject).toHaveLength(1);
      expect(events.onkey).toHaveLength(1);
      expect(events.onkey[0]).toBe('incomplete');
      expect(events.onvalue).toHaveLength(0); // No value yet
    });

    it('should handle unclosed strings', () => {
      parser.write('{"unclosed":"string');
      
      expect(events.onopenobject).toHaveLength(1);
      expect(events.onkey).toHaveLength(1);
      expect(events.onkey[0]).toBe('unclosed');
      expect(events.onvalue).toHaveLength(0); // String not closed yet
    });

    it('should handle escaped characters at end of buffer', () => {
      parser.write('{"escaped":"test\\');
      
      expect(events.onopenobject).toHaveLength(1);
      expect(events.onkey).toHaveLength(1);
      expect(events.onkey[0]).toBe('escaped');
      expect(events.onvalue).toHaveLength(0); // String not complete due to trailing backslash
      
      parser.write('"');
      expect(events.onvalue).toHaveLength(0);
    });
  });

  describe('Complex real-world examples', () => {
    it('should parse a complex nested structure', () => {
      const json = '{"users":[{"id":1,"name":"John","active":true},{"id":2,"name":"Jane","active":false}],"count":2}';
      parser.write(json);
      
      expect(events.onopenobject).toHaveLength(3); // Root + 2 user objects
      expect(events.onopenarray).toHaveLength(1); // Users array
      expect(events.onkey).toHaveLength(8); // users, id, name, active, id, name, active, count
      expect(events.onvalue).toHaveLength(7); // 1, "John", true, 2, "Jane", false, 2
      expect(events.oncloseobject).toHaveLength(3);
      expect(events.onclosearray).toHaveLength(1);
    });

    it('should parse JSON with various data types', () => {
      const json = '{"string":"hello","number":42.5,"integer":100,"boolean":true,"nullValue":null,"array":[1,2,3],"object":{"nested":"value"}}';
      parser.write(json);
      
      expect(events.onopenobject).toHaveLength(2); // Root + nested object
      expect(events.onopenarray).toHaveLength(1); // Array
      expect(events.onkey).toHaveLength(8); // All keys including nested
      expect(events.onvalue).toHaveLength(9); // All values including array elements and nested
      expect(events.oncloseobject).toHaveLength(2);
      expect(events.onclosearray).toHaveLength(1);
    });
  });

  describe('Event handler behavior', () => {
    it('should work without any event handlers', () => {
      const parserWithoutHandlers = new SimpleJsonTokenizer();
      
      // Should not throw any errors
      expect(() => {
        parserWithoutHandlers.write('{"test":"value"}');
      }).not.toThrow();
    });

    it('should work with only some event handlers', () => {
      const parserPartial = new SimpleJsonTokenizer();
      const values: any[] = [];
      parserPartial.onvalue = (value) => values.push(value);
      
      parserPartial.write('{"a":1,"b":2}');
      
      expect(values).toHaveLength(2);
      expect(values[0]).toBe(1);
      expect(values[1]).toBe(2);
    });
  });
});
