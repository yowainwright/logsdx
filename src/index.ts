import { renderLine } from "@/src/renderer";
import { getTheme, getAllThemes, getThemeNames } from "@/src/themes";
import { validateTheme, validateThemeSafe } from "@/src/schema/validator";
import { tokenize, applyTheme } from "@/src/tokenizer";
import type { TokenList } from "@/src/schema/types";
import type { RenderOptions } from "@/src/renderer/types";
import type {
  LineParser,
  ParsedLine,
  StyleOptions,
  Theme,
  LogsDXOptions,
} from "@/src/types";
import {
  tokensToString,
  tokensToHtml,
  tokensToClassNames,
} from "@/src/renderer";

export class LogsDX {
  private static instance: LogsDX | null = null;
  private options: Required<LogsDXOptions>;
  private currentTheme: Theme;

  /**
   * Create a new LogsDX instance
   * @param options Configuration options
   */
  private constructor(options = {}) {
    this.options = {
      theme: "oh-my-zsh",
      outputFormat: "ansi",
      htmlStyleFormat: "css",
      debug: false,
      customRules: {},
      ...options,
    };

    if (typeof this.options.theme === "string") {
      this.currentTheme = getTheme(this.options.theme);
    } else {
      this.currentTheme = this.options.theme;
    }

    if (typeof this.options.theme !== "string" || this.options.theme !== "oh-my-zsh") {
      try {
        validateTheme(this.currentTheme);
      } catch (error) {
        if (this.options.debug) {
          console.warn("Invalid custom theme:", error);
        }
        this.currentTheme = getTheme("oh-my-zsh");
      }
    }
  }

  /**
   * Get a singleton instance of LogsDX
   * @param options Configuration options
   * @returns LogsDX instance
   */
  static getInstance(options: LogsDXOptions = {}): LogsDX {
    if (!LogsDX.instance) {
      LogsDX.instance = new LogsDX(options);
    } else if (Object.keys(options).length > 0) {
      // Update existing instance with new options
      LogsDX.instance.options = {
        ...LogsDX.instance.options,
        ...options,
      };

      // If theme changed, update the current theme
      if (options.theme) {
        if (typeof options.theme === "string") {
          LogsDX.instance.currentTheme = getTheme(options.theme);
        } else {
          LogsDX.instance.currentTheme = options.theme;
        }
      }
    }
    return LogsDX.instance;
  }

  public static resetInstance(): void {
    LogsDX.instance = null;
  }

  /**
   * Process a log line with the current theme
   * @param line Log line to process
   * @returns The styled log line
   */
  processLine(line: string): string {
    const renderOptions: RenderOptions = {
      theme: this.currentTheme,
      outputFormat: this.options.outputFormat,
      htmlStyleFormat: this.options.htmlStyleFormat,
    };

    // First tokenize the line
    const tokens = tokenize(line, this.currentTheme);

    // Then apply the theme to get styled tokens
    const styledTokens = applyTheme(tokens, this.currentTheme);

    // Now render the styled tokens based on output format
    if (renderOptions.outputFormat === "html") {
      if (renderOptions.htmlStyleFormat === "className") {
        return tokensToClassNames(styledTokens);
      } else {
        return tokensToHtml(styledTokens);
      }
    } else {
      // Default to ANSI output
      return tokensToString(styledTokens);
    }
  }

  /**
   * Process multiple log lines
   * @param lines Array of log lines
   * @returns Array of styled log lines
   */
  processLines(lines: string[]): string[] {
    return lines.map((line) => this.processLine(line));
  }

  /**
   * Process a log string with multiple lines
   * @param logContent Multi-line log content
   * @returns The styled log content
   */
  processLog(logContent: string): string {
    const lines = logContent.split("\n");
    const processedLines = this.processLines(lines);
    return processedLines.join("\n");
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
      if (typeof theme === "string") {
        this.options.theme = theme;
        this.currentTheme = getTheme(theme);
        return true;
      } else {
        const validatedTheme = validateTheme(theme);
        this.currentTheme = validatedTheme;
        return true;
      }
    } catch (error) {
      if (this.options.debug) {
        console.warn("Invalid theme:", error);
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
   * Set the output format
   * @param format The output format to use ('ansi' or 'html')
   */
  setOutputFormat(format: "ansi" | "html"): void {
    this.options.outputFormat = format;
  }

  /**
   * Set the HTML style format
   * @param format The HTML style format to use ('css' or 'className')
   */
  setHtmlStyleFormat(format: "css" | "className"): void {
    this.options.htmlStyleFormat = format;
  }

  /**
   * Get the current output format
   * @returns The current output format
   */
  getCurrentOutputFormat(): "ansi" | "html" {
    return this.options.outputFormat;
  }

  /**
   * Get the current HTML style format
   * @returns The current HTML style format
   */
  getCurrentHtmlStyleFormat(): "css" | "className" {
    return this.options.htmlStyleFormat;
  }
}

export function getLogsDX(options?: LogsDXOptions): LogsDX {
  return LogsDX.getInstance(options);
}

export type { Theme, StyleOptions, TokenList, LineParser, ParsedLine };

export {
  getTheme,
  getAllThemes,
  getThemeNames,
  validateTheme,
  validateThemeSafe,
};

export { tokenize, applyTheme };

export { renderLine };

export default LogsDX;
