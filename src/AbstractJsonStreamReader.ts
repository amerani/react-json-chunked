import { AbstractJsonTokenizer } from "./AbstractJsonTokenizer";

export abstract class AbstractJsonStreamReader extends EventTarget {
    url: string|URL;
    tokenizer: AbstractJsonTokenizer;
    fetchOptions: RequestInit;
    constructor(url: string|URL, tokenizer: AbstractJsonTokenizer, fetchOptions: RequestInit) {
      super();
      this.url = url;
      this.tokenizer = tokenizer;
      this.fetchOptions = fetchOptions;
    }
    abstract onpartialjson(callback: (event: Event) => void): void;
    abstract onend(callback: (event: Event) => void): void;
    abstract onerror(callback: (event: Event) => void): void;
    abstract start(): Promise<void>;
}