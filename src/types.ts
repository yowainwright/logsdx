/**
 * Style codes that can be applied to text
 */
export type StyleCode =
  | "bold"
  | "italic"
  | "underline"
  | "dim"
  | "blink"
  | "reverse"
  | "strikethrough";

/**
 * Options for styling text in logs
 */
export interface StyleOptions {
  /** The color to apply (hex, rgb, or color name) */
  color: string;
  /** Optional style codes to apply */
  styleCodes?: StyleCode[];
  /** Format for HTML output */
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
  colors?: {
    text?: string;
    background?: string;
    primary?: string;
    secondary?: string;
    error?: string;
    warning?: string;
    info?: string;
    success?: string;
    debug?: string;
    muted?: string;
    [key: string]: string | undefined;
  };
}

export type ThemePreset = Theme;

/**
 * Theme pair for automatic light/dark mode switching
 * Allows specifying different themes for light and dark environments
 */
export interface ThemePair {
  /** Theme to use in light mode (theme name or Theme object) */
  light: string | Theme;
  /** Theme to use in dark mode (theme name or Theme object) */
  dark: string | Theme;
}

export interface LogsDXOptions {
  theme?: string | Theme | ThemePair;
  outputFormat?: "ansi" | "html";
  htmlStyleFormat?: "css" | "className";
  escapeHtml?: boolean; // Whether to escape HTML in output (default: true)
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
