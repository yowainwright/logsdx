import { STYLES } from "./constants";

export type StyleName = keyof typeof STYLES;

export type ChainableColorFunction = ((text: unknown) => string) & {
  [K in Exclude<StyleName, "reset">]: ChainableColorFunction;
};

export interface Spinner {
  start(): Spinner;
  succeed(text?: string): Spinner;
  fail(text?: string): Spinner;
  stop(): Spinner;
  text: string;
}

export interface ProgressBar {
  start(total: number, startValue: number): void;
  update(value: number): void;
  stop(): void;
}

export interface BoxenOptions {
  padding?:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number };
  margin?:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number };
  borderStyle?: "single" | "double" | "round" | "bold" | "classic";
  borderColor?: string;
  backgroundColor?: string;
  title?: string;
}

export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

export interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
}

export interface InputPrompt {
  message: string;
  default?: string;
  validate?: (value: string) => boolean | string | Promise<boolean | string>;
  transformer?: (value: string) => string;
}

export interface SelectPrompt {
  message: string;
  choices: Array<
    { name?: string; value: string; description?: string } | string
  >;
  default?: string;
}

export interface CheckboxPrompt {
  message: string;
  choices: Array<{ name: string; value: string; checked?: boolean }>;
}

export interface ConfirmPrompt {
  message: string;
  default?: boolean;
}
