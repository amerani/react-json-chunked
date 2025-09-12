import { JSONEventParser } from "./JsonStreamReader";

export class SimpleJSONParser implements JSONEventParser {
  onopenobject?: (key?: string) => void;
  onkey?: (key: string) => void;
  onvalue?: (value: any) => void;
  oncloseobject?: () => void;
  onopenarray?: () => void;
  onclosearray?: () => void;
  onerror?: (err: Error) => void;

  private buffer = "";
  private stack: ("object" | "array")[] = [];
  private currentKey: string | null = null;

  write(chunk: string): void {
    this.buffer += chunk;
    this._process();
  }

  private _process(): void {
    try {
      // Naive tokenizer — split by JSON structural characters
      let i = 0;
      while (i < this.buffer.length) {
        const c = this.buffer[i];

        if (c === "{") {
          this.stack.push("object");
          this.onopenobject?.();
          i++;
        } else if (c === "}") {
          this.stack.pop();
          this.oncloseobject?.();
          i++;
        } else if (c === "[") {
          this.stack.push("array");
          this.onopenarray?.();
          i++;
        } else if (c === "]") {
          this.stack.pop();
          this.onclosearray?.();
          i++;
        } else if (c === `"`) {
          // Parse a string
          const end = this._findStringEnd(i + 1);
          if (end === -1) break; // Wait for more data
          const str = this.buffer.slice(i + 1, end);
          if (this.stack[this.stack.length - 1] === "object" && this.currentKey === null) {
            this.currentKey = str;
            this.onkey?.(str);
          } else {
            this.onvalue?.(str);
            this.currentKey = null;
          }
          i = end + 1;
        } else if (/[0-9tfn\-]/.test(c)) {
          // Parse number, true, false, null
          const token = this._readLiteral(i);
          if (!token) break; // incomplete
          let value: any;
          if (token === "true") value = true;
          else if (token === "false") value = false;
          else if (token === "null") value = null;
          else value = Number(token);
          this.onvalue?.(value);
          this.currentKey = null;
          i += token.length;
        } else {
          // Skip separators: colon, commas, spaces, newlines
          i++;
        }
      }

      // Trim processed buffer
      this.buffer = this.buffer.slice(i);
    } catch (err) {
      this.onerror?.(err as Error);
    }
  }

  private _findStringEnd(start: number): number {
    let escaped = false;
    for (let i = start; i < this.buffer.length; i++) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (this.buffer[i] === "\\") {
        escaped = true;
        continue;
      }
      if (this.buffer[i] === `"`) {
        return i;
      }
    }
    return -1; // not found yet
  }

  private _readLiteral(start: number): string | null {
    const match = /^[0-9eE+\-\.]+|true|false|null/.exec(this.buffer.slice(start));
    if (match) {
      if (this.buffer.length >= start + match[0].length) {
        return match[0];
      }
    }
    return null;
  }
}