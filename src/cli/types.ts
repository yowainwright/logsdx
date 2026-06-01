export type FormatValue = "ansi" | "html";

export type FormatChoice = {
  name: string;
  value: FormatValue;
  description: string;
};

export type InteractiveConfig = {
  theme: string;
  outputFormat: FormatValue;
  preview: boolean;
};

export type ThemeChoice = {
  name: string;
  value: string;
  description: string;
};

export type CliOptions = {
  input?: string;
  output?: string;
  theme?: string;
  config?: string;
  debug?: boolean;
  quiet?: boolean;
  listThemes?: boolean;
  interactive?: boolean;
  preview?: boolean;
  noSpinner?: boolean;
  format?: "ansi" | "html";
  generateTheme?: boolean;
  listPalettes?: boolean;
  listPatterns?: boolean;
  exportTheme?: string;
  importTheme?: string;
  listThemeFiles?: boolean;
};

export type CommanderOptions = CliOptions;

export interface SpinnerLike {
  start(): this;
  succeed(message?: string): this;
  fail(message?: string): this;
  stop(): this;
  text?: string;
}

export interface ProgressBarLike {
  start(total: number, startValue: number): void;
  update(current: number): void;
  stop(): void;
}

export type ColorRole =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "muted"
  | "accent"
  | {};

export interface ThemeAnswers {
  themeName?: string;
  name?: string;
  description?: string;
  palette?: string;
  colorPalette?: string;
  patterns?: string[];
  patternPresets?: string[];
  features?: string[];
  customPatterns?: Array<{
    name: string;
    pattern: string;
    color: string;
    colorRole?: ColorRole;
    styleCodes?: string[];
  }>;
  customWords?:
    | Record<
        string,
        {
          colorRole?: ColorRole;
          styleCodes?: string[];
        }
      >
    | string[];
  mode?: "light" | "dark" | "auto" | {};
}
