import type { Theme } from '@/src/schema/types';

export interface LogsDXOptions {
  theme?: string | Theme;
  outputFormat?: 'ansi' | 'html';
  htmlStyleFormat?: 'css' | 'className';
  debug?: boolean;
  customRules?: Record<string, any>;
}

export interface StyleOptions {
  color?: string;
  backgroundColor?: string;
  styleCodes?: string[];
  css?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

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

export { Theme };
