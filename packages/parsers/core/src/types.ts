// Core parser types

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'trace' | 'success';

export type ParsedLog = {
  timestamp?: string;
  level?: LogLevel;
  message?: string;
  status?: string;
  [key: string]: any;
};

export type LineParser = (line: string) => ParsedLog;

// Schema types for styling
export type StyleOptions = {
  className?: string;
  asciColor?: string;
  bold?: boolean;
  italic?: boolean;
  dim?: boolean;
  underline?: boolean;
};

export type WordMatch = Record<string, StyleOptions>;

export type PatternMatch = {
  pattern: RegExp;
  options: StyleOptions;
};

export type Schema = {
  matchWords?: WordMatch;
  matchPatterns?: PatternMatch[];
  defaultStyle?: StyleOptions;
  lineNumbers?: boolean;
};
