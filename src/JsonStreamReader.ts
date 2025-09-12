import { AbstractJsonTokenizer } from "./AbstractJsonTokenizer";
import { AbstractJsonStreamReader } from "./AbstractJsonStreamReader";


export class JsonStreamReader extends AbstractJsonStreamReader {
    private decoder: TextDecoder;
    private stack: any[];
    private currentKey: string | null;
    private root: any;
  
    constructor(url: string|URL, tokenizer: AbstractJsonTokenizer) {
      super(url, tokenizer);
      this.decoder = new TextDecoder();
  
      this.stack = [];
      this.currentKey = null;
      this.root = null;
  
      this._wireParser();
    }
  
    private _wireParser() {
      this.tokenizer.onopenobject = (key?: string) => {
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
  
      this.tokenizer.onkey = (key: string) => {
        this.currentKey = key;
      };
  
      this.tokenizer.onvalue = (value: any) => {
        this._insertValue(value);
        this._emitPartial();
      };
  
      this.tokenizer.oncloseobject = () => {
        this.stack.pop();
        this.currentKey = null;
        this._emitPartial();
      };
  
      this.tokenizer.onopenarray = () => {
        const arr: any[] = [];
        if (this.stack.length === 0) {
          this.root = arr;
        } else {
          this._insertValue(arr);
        }
        this.stack.push(arr);
      };
  
      this.tokenizer.onclosearray = () => {
        this.stack.pop();
        this._emitPartial();
      };
  
      this.tokenizer.onerror = (err: Error) => {
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

    onpartialjson(callback: (event: Event) => void) {
      this.addEventListener("partial", callback);
    }

    onend(callback: (event: Event) => void) {
      this.addEventListener("end", callback);
    }

    onerror(callback: (event: Event) => void) {
      this.addEventListener("error", callback);
    }
  
    async start(): Promise<void> {
      const response = await fetch(this.url);
      const reader = response.body!.getReader();
  
      const pump = ({ done, value }: ReadableStreamReadResult<Uint8Array>): void => {
        if (done) {
          this.dispatchEvent(new Event("end"));
          return;
        }
        this.tokenizer.write(this.decoder.decode(value, { stream: true }));
        reader.read().then(pump);
      };
  
      reader.read().then(pump);
    }
  }