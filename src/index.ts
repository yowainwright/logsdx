
import { renderLine } from './renderer';
import { getTheme, getAllThemes, getThemeNames } from './themes';
import { validateTheme, validateThemeSafe } from './schema/validator';
import { tokenize, applyTheme } from './tokenizer';
import type { TokenList } from './schema/types';
import type { StyleOptions, Theme, LogsDXOptions } from './types';
import type { RenderOptions } from './renderer/types';
import type { LineParser, ParsedLine } from './types';

/**
 * Main LogsDX class for log processing and styling
 */
export class LogsDX {
  private static instance: LogsDX | null = null;
  private options: Required<LogsDXOptions>;
  private currentTheme: Theme;

  /**
   * Create a new LogsDX instance
   * @param options Configuration options
   */
  private constructor(options = {}) {
    // Set default options
    this.options = {
      theme: 'oh-my-zsh', // Default theme
      outputFormat: 'ansi',
      htmlStyleFormat: 'css',
      debug: false,
      customRules: {},
      ...options
    };

    // Initialize theme
    this.currentTheme = getTheme(this.options.theme);
    
    // Validate theme
    if (this.options.theme !== 'oh-my-zsh') {
      try {
        validateTheme(this.currentTheme);
      } catch (error) {
        if (this.options.debug) {
          console.warn('Invalid custom theme:', error);
        }
        // Fall back to default theme
        this.currentTheme = getTheme(this.options.theme);
      }
    }
  }

  /**
   * Get the LogsDX instance
   * @param options Configuration options (only used when creating a new instance)
   * @returns The LogsDX instance
   */
  public static getInstance(options?: LogsDXOptions): LogsDX {
    if (!LogsDX.instance) {
      LogsDX.instance = new LogsDX(options);
    }
    return LogsDX.instance;
  }

  /**
   * Reset the singleton instance (mainly for testing)
   */
  public static resetInstance(): void {
    LogsDX.instance = null;
  }

  /**
   * Process a log line with the current theme
   * @param line Log line to process
   * @returns The styled log line
   */
  processLine(line: string): string {
    // Create render options
    const renderOptions: RenderOptions = {
      theme: this.currentTheme
    };

    if (this.options.outputFormat === 'html') {
      renderOptions.outputFormat = this.options.outputFormat;
      renderOptions.htmlStyleFormat = this.options.htmlStyleFormat;
    }

    // Tokenize and render
    const tokens = tokenize(line, this.currentTheme);
    const styledTokens = applyTheme(tokens, this.currentTheme);
    
    return renderLine(styledTokens.map(t => t.content).join(''), renderOptions);
  }

  /**
   * Process multiple log lines
   * @param lines Array of log lines
   * @returns Array of styled log lines
   */
  processLines(lines: string[]): string[] {
    return lines.map(line => this.processLine(line));
  }

  /**
   * Process a log string with multiple lines
   * @param logContent Multi-line log content
   * @returns The styled log content
   */
  processLog(logContent: string): string {
    const lines = logContent.split('\n');
    const processedLines = this.processLines(lines);
    return processedLines.join('\n');
  }

  /**
   * Tokenize a log line without applying styling
   * @param line Log line to tokenize
   * @returns Tokenized log line
   */
  tokenizeLine(line: string): TokenList {
    return tokenize(line, this.currentTheme);
  }

  /**
   * Set the current theme
   * @param theme Theme name or custom theme configuration
   * @returns True if theme was valid and applied, false otherwise
   */
  setTheme(theme: string | Theme): boolean {
    try {
      if (typeof theme === 'string') {
        // Set theme by name
        this.options.theme = theme;
        this.currentTheme = getTheme(theme);
        return true;
      } else {
        // Set custom theme
        const validatedTheme = validateTheme(theme);
        this.currentTheme = validatedTheme;
        return true;
      }
    } catch (error) {
      if (this.options.debug) {
        console.warn('Invalid theme:', error);
      }
      return false;
    }
  }

  /**
   * Get the current theme
   * @returns Current theme configuration
   */
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Get all available themes
   * @returns Object containing all available themes
   */
  getAllThemes(): Record<string, Theme> {
    return getAllThemes();
  }

  /**
   * Get names of all available themes
   * @returns Array of theme names
   */
  getThemeNames(): string[] {
    return getThemeNames();
  }

  /**
   * Update output format
   * @param format Output format ('ansi' or 'html')
   */
  setOutputFormat(format: 'ansi' | 'html'): void {
    this.options.outputFormat = format;
  }

  /**
   * Update HTML style format
   * @param format HTML style format ('css' or 'className')
   */
  setHtmlStyleFormat(format: 'css' | 'className'): void {
    this.options.htmlStyleFormat = format;
  }
}

// Create a convenience function to get the LogsDX instance
export function getLogsDX(options?: LogsDXOptions): LogsDX {
  return LogsDX.getInstance(options);
}

// Export types
export type { Theme, StyleOptions, TokenList, LineParser, ParsedLine };

// Export utility functions
export { getTheme, getAllThemes, getThemeNames, validateTheme, validateThemeSafe };

// Export tokenizer functions
export { tokenize, applyTheme };

// Export renderer functions
export { renderLine };

// Default export
export default LogsDX;

