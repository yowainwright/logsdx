export type StyleCode =
  | "bold"
  | "italic"
  | "underline"
  | "dim"
  | "blink"
  | "reverse"
  | "strikethrough";

export interface StyleOptions {
  color: string;
  styleCodes?: StyleCode[];
  htmlStyleFormat?: "css" | "className";
}

/**
 * Filter and validate style codes
 */
export function filterStyleCodes(codes: string[] | undefined): StyleCode[] {
  if (!codes) return [];
  const validCodes: StyleCode[] = [
    "bold",
    "italic",
    "underline",
    "dim",
    "blink",
    "reverse",
    "strikethrough",
  ];
  return codes.filter((code): code is StyleCode =>
    validCodes.includes(code as StyleCode),
  );
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
  mode?: "light" | "dark" | "auto";
  schema: SchemaConfig;
}

export type ThemePreset = Theme;

export interface ThemePair {
  light: string | Theme;
  dark: string | Theme;
}

export interface LogsDXOptions {
  theme?: string | Theme | ThemePair;
  outputFormat?: "ansi" | "html";
  htmlStyleFormat?: "css" | "className";
  debug?: boolean;
  customRules?: Record<string, unknown>;
  autoAdjustTerminal?: boolean; // Automatically adjust themes for terminal visibility
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
