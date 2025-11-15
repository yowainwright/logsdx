export interface Theme {
  name: string;
  description?: string;
  mode?: "light" | "dark" | "auto";
  schema: SchemaConfig;
  colors?: Record<string, string | undefined>;
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

export interface StyleOptions {
  color: string;
  styleCodes?: StyleCode[];
  htmlStyleFormat?: "css" | "className";
}

export interface PatternMatch {
  name: string;
  pattern: string | RegExp;
  identifier?: string;
  options: StyleOptions;
}

export type StyleCode =
  | "bold"
  | "italic"
  | "underline"
  | "dim"
  | "blink"
  | "reverse"
  | "strikethrough";

export interface LogsDXOptions {
  theme?: string | Theme | ThemePair;
  outputFormat?: "ansi" | "html";
  htmlStyleFormat?: "css" | "className";
  escapeHtml?: boolean;
  debug?: boolean;
  customRules?: Record<string, unknown>;
  autoAdjustTerminal?: boolean;
}

export interface ThemePair {
  light: string | Theme;
  dark: string | Theme;
}

export interface LogsDXInstance {
  processLine(line: string): string;
  processLines(lines: string[]): string[];
  processLog(logContent: string): string;
  setTheme(theme: string | Theme | ThemePair): Promise<boolean>;
  getCurrentTheme(): Theme;
  getAllThemes(): Record<string, Theme>;
  getThemeNames(): string[];
  setOutputFormat(format: "ansi" | "html"): void;
  setHtmlStyleFormat(format: "css" | "className"): void;
  getCurrentOutputFormat(): "ansi" | "html";
  getCurrentHtmlStyleFormat(): "css" | "className";
}
