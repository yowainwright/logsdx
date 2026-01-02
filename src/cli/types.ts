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
