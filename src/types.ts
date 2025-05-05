import type { Theme } from './schema/types';

/**
 * LogsDX configuration options
 */
export interface LogsDXOptions {
  /**
   * Theme name or custom theme configuration
   * @default 'oh-my-zsh'
   */
  theme?: string | Theme;
  
  /**
   * Output format
   * @default 'ansi'
   */
  outputFormat?: 'ansi' | 'html';
  
  /**
   * HTML style format
   * @default 'css'
   */
  htmlStyleFormat?: 'css' | 'className';
  
  /**
   * Enable debug mode
   * @default false
   */
  debug?: boolean;
  
  /**
   * Custom rules for tokenization
   */
  customRules?: Record<string, any>;
}

/**
 * Style options for tokens
 */
export interface StyleOptions {
  /**
   * Text color
   */
  color?: string;
  
  /**
   * Background color
   */
  backgroundColor?: string;
  
  /**
   * Style codes (bold, italic, etc.)
   */
  styleCodes?: string[];
  
  /**
   * Custom CSS styles (for HTML output)
   */
  css?: string;
}

/**
 * Log level types
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Parsed line result
 */
export interface ParsedLine {
  /**
   * Raw log line
   */
  raw?: string;
  
  /**
   * Extracted message
   */
  message?: string;
  
  /**
   * Log level
   */
  level?: LogLevel;
  
  /**
   * Timestamp
   */
  timestamp?: string;
  
  /**
   * Detected language
   */
  language?: string;
  
  /**
   * Service or component name
   */
  service?: string;
  
  /**
   * Additional fields
   */
  [key: string]: unknown;
}

/**
 * Line parser function type
 */
export type LineParser = (line: string) => ParsedLine | undefined;

// Re-export Theme type for convenience
export { Theme };
