export interface StyleOptions {
  color: string;
  styleCodes?: string[];
  htmlStyleFormat?: "css" | "className";
}

export interface PatternMatch {
  name: string;
  pattern: string;
  options: StyleOptions;
}

export interface SchemaConfig {
  defaultStyle?: StyleOptions;
  matchWords?: Record<string, StyleOptions>;
  matchStartsWith?: Record<string, StyleOptions>;
  matchEndsWith?: Record<string, StyleOptions>;
  matchContains?: Record<string, StyleOptions>;
  matchPatterns?: PatternMatch[];
  whiteSpace?: "preserve" | "trim";
  newLine?: "preserve" | "trim";
}

export interface Theme {
  name: string;
  description?: string;
  schema: SchemaConfig;
}

export type ThemePreset = Theme;

export interface LogsDXOptions {
  theme?: string | Theme;
  outputFormat?: "ansi" | "html";
  htmlStyleFormat?: "css" | "className";
  debug?: boolean;
  customRules?: Record<string, unknown>;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface ParsedLine {
  raw?: string;
  message?: string;
  level?: LogLevel;
  timestamp?: string;
  language?: string;
  service?: string;
  [key: string]: unknown;
}

export type LineParser = (line: string) => ParsedLine | undefined;