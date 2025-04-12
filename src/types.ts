import type { ReactNode, ReactElement } from "react";
import type { ANSI } from "./cli/styles";

// Core types
export type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "success"
  | "trace";

// Plugin types
export interface LogPlugin {
  name: string;
  enhance: (line: string) => string;
}

export interface LogParser {
  name: string;
  parse: (line: string) => Record<string, unknown>;
}

export interface LogClient {
  name: string;
  write: (line: string) => void;
}

export interface LogEnhancerOptions {
  debug?: boolean;
  plugins?: (string | LogPlugin)[];
  parsers?: (string | LogParser)[];
  clients?: (string | LogClient)[];
}

export interface LineParseResult {
  level?: LogLevel;
  timestamp?: string;
  message?: string;
  language?: string;
  [key: string]: unknown;
}

// Alias for backward compatibility
export type ParsedLine = LineParseResult;

// Simple plugin types for direct usage
export type SimplePlugin = {
  name: string;
  enhance: (line: string) => string;
};

export type SimpleParser = {
  name: string;
  parse: (line: string) => Record<string, unknown>;
};

export type SimpleClient = {
  name: string;
  write: (line: string) => void;
};

// Plugin system types
export interface LogEnhancerPlugin<T = string | ReactElement> {
  init?: () => Promise<void>;
  enhanceLine?: (
    line: string,
    lineIndex: number,
    context?: LineParseResult,
  ) => T;
  enhanceWord?: (
    word: string,
    lineIndex: number,
    wordIndex: number,
    context?: LineParseResult,
  ) => T;
  parseLevel?: (line: string) => LogLevel | undefined;
  parseTimestamp?: (line: string) => string | undefined;
  parseMessage?: (line: string) => string | undefined;
}

export interface LogEnhancer extends LogEnhancerPlugin {
  use: (plugin: LogEnhancerPlugin) => void;
  reset: () => void;
  init: () => Promise<void>;
  debugLog?: (message: string, data?: unknown) => void;
}

export interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
  timestamp?: boolean;
  enhancers?: LogEnhancerPlugin[];
}

export interface Config {
  levels: Record<LogLevel, number>;
  defaultRules: Array<{
    match: RegExp;
    extract: () => { level: LogLevel };
  }>;
}

export type LineParser = (line: string) => LineParseResult | undefined;

export type RegexParserRule = {
  match: RegExp;
  extract?: (line: string, match: RegExpMatchArray) => LineParseResult;
};

export type JSONRule = {
  match: string;
  lang?: string;
  level?: LogLevel;
  meta?: Record<string, string>;
};

// Ink client types
export type InkStyle = keyof typeof ANSI | (keyof typeof ANSI)[];

export type HighlightPattern = {
  pattern: RegExp | string;
  style: InkStyle;
};

export interface InkLogViewerProps {
  log: string;
  enhancer: LogEnhancer;
  showLineNumbers?: boolean;
  highlightPatterns?: HighlightPattern[];
  theme?: {
    [key in LogLevel]?: InkStyle;
  };
  maxLines?: number;
  wrap?: boolean;
  padding?: number | [number, number] | [number, number, number, number];
}

// CLI types
export interface CliFlags {
  quiet?: boolean;
  debug?: boolean;
}

export interface CliOptions {
  flags: Set<string>;
  inputFile: string;
  outputFile: string;
  minLevel?: LogLevel;
  isDebug: boolean;
}

export type ThemeStyles = {
  [K in LogLevel]: (keyof typeof ANSI)[];
};
