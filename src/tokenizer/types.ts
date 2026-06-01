import type { SimpleLexer } from "./index";

export type MatcherType =
  | "word"
  | "regex"
  | "prefix"
  | "suffix"
  | "contains"
  | "special"
  | "whitespace"
  | "space"
  | "spaces"
  | "tab"
  | "newline"
  | "carriage-return"
  | "default";

export interface CachedLexer {
  lexer: SimpleLexer;
  themeHash: string;
  lastUsed: number;
}

export interface CacheOptions {
  trim?: string;
}
