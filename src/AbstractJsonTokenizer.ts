export abstract class AbstractJsonTokenizer {
    // Core events (all optional so parser can choose what it emits)
    onopenobject?: (key?: string) => void;
    onkey?: (key: string) => void;
    onvalue?: (value: any) => void;
    oncloseobject?: () => void;
    onopenarray?: () => void;
    onclosearray?: () => void;
    onerror?: (err: Error) => void;
  
    // Feed more text into the parser
    abstract write(chunk: string): void;
}
