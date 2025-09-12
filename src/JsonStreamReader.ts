export interface JSONEventParser {
    // Core events (all optional so parser can choose what it emits)
    onopenobject?: (key?: string) => void;
    onkey?: (key: string) => void;
    onvalue?: (value: any) => void;
    oncloseobject?: () => void;
    onopenarray?: () => void;
    onclosearray?: () => void;
    onerror?: (err: Error) => void;
  
    // Feed more text into the parser
    write(chunk: string): void;
}

export class JSONStreamReader extends EventTarget {
    private url: string;
    private decoder: TextDecoder;
    private parser: JSONEventParser;
    private stack: any[];
    private currentKey: string | null;
    private root: any;
  
    constructor(url: string, eventParser: JSONEventParser) {
      super();
      this.url = url;
      this.decoder = new TextDecoder();
  
      this.stack = [];
      this.currentKey = null;
      this.root = null;
  
      this.parser = eventParser;
      this._wireParser();
    }
  
    private _wireParser() {
      this.parser.onopenobject = (key?: string) => {
        const obj: Record<string, any> = {};
        if (this.stack.length === 0) {
          this.root = obj;
        } else {
          this._insertValue(obj);
        }
        this.stack.push(obj);
        this.currentKey = key ?? null;
        if (key !== undefined) {
          obj[key] = undefined;
        }
      };
  
      this.parser.onkey = (key: string) => {
        this.currentKey = key;
      };
  
      this.parser.onvalue = (value: any) => {
        this._insertValue(value);
        this._emitPartial();
      };
  
      this.parser.oncloseobject = () => {
        this.stack.pop();
        this.currentKey = null;
        this._emitPartial();
      };
  
      this.parser.onopenarray = () => {
        const arr: any[] = [];
        if (this.stack.length === 0) {
          this.root = arr;
        } else {
          this._insertValue(arr);
        }
        this.stack.push(arr);
      };
  
      this.parser.onclosearray = () => {
        this.stack.pop();
        this._emitPartial();
      };
  
      this.parser.onerror = (err: Error) => {
        this.dispatchEvent(new CustomEvent("error", { detail: err }));
      };
    }
  
    private _insertValue(value: any) {
      const container = this.stack[this.stack.length - 1];
      if (Array.isArray(container)) {
        container.push(value);
      } else if (this.currentKey !== null) {
        container[this.currentKey] = value;
        this.currentKey = null;
      }
    }
  
    private _emitPartial() {
      this.dispatchEvent(
        new CustomEvent("partial", { detail: this.root })
      );
    }
  
    async start(): Promise<void> {
      const response = await fetch(this.url);
      const reader = response.body!.getReader();
  
      const pump = ({ done, value }: ReadableStreamReadResult<Uint8Array>): void => {
        if (done) {
          this.dispatchEvent(new Event("end"));
          return;
        }
        this.parser.write(this.decoder.decode(value, { stream: true }));
        reader.read().then(pump);
      };
  
      reader.read().then(pump);
    }
  }