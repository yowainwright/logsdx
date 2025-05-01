export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type ParsedLine = {
  level?: LogLevel;
  message?: string;
  timestamp?: string;
  [key: string]: unknown;
};

export type CliOptions = {
  quiet?: boolean;
  debug?: boolean;
  level?: string;
  parser?: string;
  rules?: string;
  output?: string;
  listParsers?: boolean;
  theme?: string;
  listThemes?: boolean;
};

export type Parser = (line: string) => ParsedLine;

export type ParserFactory = () => Promise<Parser>;

export type ParserRegistry = {
  [key: string]: ParserFactory;
};

export type StyleManager = {
  styleLine: (line: string, parsed: ParsedLine, parserName: string) => string;
};

export type Logger = {
  info: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
  withConfig: (config: LoggerConfig) => Logger;
};

export type LoggerConfig = {
  level?: string;
  prefix?: string;
};

export type Config = {
  theme?: string;
  customThemes?: Record<string, ThemeConfig>;
};

export type ThemeConfig = {
  name: string;
  colors?: Record<string, string>;
  styles?: Record<string, string>;
};

export type OutputStreamType = NodeJS.WriteStream | NodeJS.WritableStream;

// Additional types for functions used in index.ts
export type LoadConfig = () => Config;
export type ShouldRender = (level: LogLevel, minLevel?: string) => boolean;
export type SetTheme = (theme: string) => void;
export type GetParser = (name: string) => Promise<ParserFactory>;
export type GetRegisteredParsers = () => string[];
