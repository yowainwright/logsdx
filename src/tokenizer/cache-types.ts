import type { SimpleLexer } from "./index";

export interface CachedLexer {
  lexer: SimpleLexer;
  themeHash: string;
  lastUsed: number;
}

export interface CacheOptions {
  trim?: string;
}
