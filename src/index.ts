import { renderLine } from "./renderer";
import {
  getTheme,
  getAllThemes,
  getThemeNames,
  ThemeBuilder,
  createTheme,
  createSimpleTheme,
  extendTheme,
  registerTheme,
  THEME_PRESETS,
} from "./themes";
import { validateTheme, validateThemeSafe } from "./schema/validator";
import { tokenize, applyTheme } from "./tokenizer";
import type { TokenList } from "./schema/types";
import type { RenderOptions } from "./renderer/types";
import type {
  LineParser,
  ParsedLine,
  StyleOptions,
  Theme,
  ThemePair,
  LogsDXOptions,
} from "./types";
import {
  tokensToString,
  tokensToHtml,
  tokensToClassNames,
  renderLightBox,
  renderLightBoxLine,
  isLightTheme as isLightThemeRenderer,
  isDarkBackground,
  getRecommendedThemeMode,
} from "./renderer";

/**
 * LogsDX - A powerful log processing and styling tool
 *
 * This class provides a singleton instance for processing and styling log files
 * with customizable themes and output formats.
 *
 * @example
 * ```typescript
 * const logsdx = LogsDX.getInstance({ theme: 'dracula' });
 * const styledLog = logsdx.processLine('[INFO] Application started');
 * console.log(styledLog);
 * ```
 */
export class LogsDX {
  private static instance: LogsDX | null = null;
  private options: Required<LogsDXOptions>;
  private currentTheme: Theme = {
    name: "none",
    description: "No styling applied",
    mode: "auto",
    schema: {
      defaultStyle: { color: "" },
      matchWords: {},
      matchStartsWith: {},
      matchEndsWith: {},
      matchContains: {},
      matchPatterns: [],
    },
  };

  private constructor(options = {}) {
    this.options = {
      theme: "none",
      outputFormat: "ansi",
      htmlStyleFormat: "css",
      escapeHtml: true,
      debug: false,
      customRules: {},
      autoAdjustTerminal: true,
      ...options,
    };

    this.currentTheme = this.resolveTheme(this.options.theme);
  }

  private resolveTheme(theme: string | Theme | ThemePair | undefined): Theme {
    if (!theme || theme === "none") {
      return {
        name: "none",
        description: "No styling applied",
        mode: "auto",
        schema: {
          defaultStyle: { color: "" },
          matchWords: {},
          matchStartsWith: {},
          matchEndsWith: {},
          matchContains: {},
          matchPatterns: [],
        },
      };
    }

    if (typeof theme === "string") {
      const baseTheme = getTheme(theme);

      if (
        this.options.outputFormat === "ansi" &&
        this.options.autoAdjustTerminal !== false &&
        typeof process !== "undefined"
      ) {
        const recommendedMode = getRecommendedThemeMode();
        const currentThemeMode = baseTheme.mode || "dark";

        if (currentThemeMode !== recommendedMode) {
          let alternateThemeName: string;

          if (theme.includes("-dark")) {
            alternateThemeName = theme.replace("-dark", "-light");
          } else if (theme.includes("-light")) {
            alternateThemeName = theme.replace("-light", "-dark");
          } else {
            alternateThemeName =
              recommendedMode === "dark" ? `${theme}-dark` : `${theme}-light`;
          }

          const alternateTheme = getAllThemes()[alternateThemeName];
          if (alternateTheme) {
            return alternateTheme;
          }
        }
      }
      return baseTheme;
    } else if ("light" in theme && "dark" in theme) {
      const themePair = theme as ThemePair;

      if (
        this.options.outputFormat === "ansi" &&
        this.options.autoAdjustTerminal !== false &&
        typeof process !== "undefined"
      ) {
        const recommendedMode = getRecommendedThemeMode();
        const selectedTheme =
          recommendedMode === "light" ? themePair.light : themePair.dark;

        if (typeof selectedTheme === "string") {
          return getTheme(selectedTheme);
        } else {
          return selectedTheme;
        }
      } else {
        const selectedTheme = themePair.dark;
        if (typeof selectedTheme === "string") {
          return getTheme(selectedTheme);
        } else {
          return selectedTheme;
        }
      }
    } else {
      try {
        return validateTheme(theme as Theme);
      } catch (error) {
        if (this.options.debug) {
          console.warn("Invalid custom theme:", error);
        }

        return {
          name: "none",
          description: "No styling applied",
          mode: "auto",
          schema: {
            defaultStyle: { color: "" },
            matchWords: {},
            matchStartsWith: {},
            matchEndsWith: {},
            matchContains: {},
            matchPatterns: [],
          },
        };
      }
    }
  }

  /**
   * Get or create the singleton LogsDX instance
   *
   * @param options - Configuration options for LogsDX
   * @param options.theme - Theme name, Theme object, or ThemePair to use
   * @param options.outputFormat - Output format: 'ansi' (default) or 'html'
   * @param options.htmlStyleFormat - HTML style format: 'css' (inline styles) or 'className'
   * @param options.escapeHtml - Whether to escape HTML in output (default: true)
   * @param options.debug - Enable debug logging (default: false)
   * @param options.autoAdjustTerminal - Auto-adjust theme based on terminal background (default: true)
   * @returns The LogsDX singleton instance
   *
   * @example
   * ```typescript
   * const logsdx = LogsDX.getInstance({ theme: 'nord', outputFormat: 'ansi' });
   * ```
   */
  static getInstance(options: LogsDXOptions = {}): LogsDX {
    if (!LogsDX.instance) {
      LogsDX.instance = new LogsDX(options);
    } else if (Object.keys(options).length > 0) {
      LogsDX.instance.options = {
        ...LogsDX.instance.options,
        ...options,
      };

      if (options.theme) {
        LogsDX.instance.currentTheme = LogsDX.instance.resolveTheme(
          options.theme,
        );
      }
    }
    return LogsDX.instance;
  }

  /**
   * Reset the LogsDX singleton instance
   *
   * Useful for testing or when you need to reconfigure LogsDX from scratch
   */
  public static resetInstance(): void {
    LogsDX.instance = null;
  }

  /**
   * Process a single log line with the current theme and styling
   *
   * @param line - The log line to process
   * @returns The styled log line as a string
   *
   * @example
   * ```typescript
   * const logsdx = LogsDX.getInstance({ theme: 'dracula' });
   * const styled = logsdx.processLine('[ERROR] Connection timeout');
   * console.log(styled); // Output with Dracula theme styling
   * ```
   */
  processLine(line: string): string {
    const renderOptions: RenderOptions = {
      theme: this.currentTheme,
      outputFormat: this.options.outputFormat,
      htmlStyleFormat: this.options.htmlStyleFormat,
      escapeHtml: this.options.escapeHtml,
    };

    const tokens = tokenize(line, this.currentTheme);

    const styledTokens = applyTheme(tokens, this.currentTheme);

    if (renderOptions.outputFormat === "html") {
      if (renderOptions.htmlStyleFormat === "className") {
        return tokensToClassNames(styledTokens);
      } else {
        return tokensToHtml(styledTokens);
      }
    } else {
      return tokensToString(styledTokens);
    }
  }

  processLines(lines: string[]): string[] {
    return lines.map((line) => this.processLine(line));
  }

  processLog(logContent: string): string {
    const lines = logContent.split("\n");
    const processedLines = this.processLines(lines);
    return processedLines.join("\n");
  }

  tokenizeLine(line: string): TokenList {
    return tokenize(line, this.currentTheme);
  }

  setTheme(theme: string | Theme | ThemePair): boolean {
    try {
      this.options.theme = theme;
      this.currentTheme = this.resolveTheme(theme);
      return true;
    } catch (error) {
      if (this.options.debug) {
        console.warn("Invalid theme:", error);
      }
      return false;
    }
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  getAllThemes(): Record<string, Theme> {
    return getAllThemes();
  }

  getThemeNames(): string[] {
    return getThemeNames();
  }

  setOutputFormat(format: "ansi" | "html"): void {
    this.options.outputFormat = format;
  }

  setHtmlStyleFormat(format: "css" | "className"): void {
    this.options.htmlStyleFormat = format;
  }

  getCurrentOutputFormat(): "ansi" | "html" {
    return this.options.outputFormat;
  }

  getCurrentHtmlStyleFormat(): "css" | "className" {
    return this.options.htmlStyleFormat;
  }
}

export function getLogsDX(options?: LogsDXOptions): LogsDX {
  return LogsDX.getInstance(options);
}

export type {
  Theme,
  ThemePair,
  StyleOptions,
  TokenList,
  LineParser,
  ParsedLine,
};

export {
  getTheme,
  getAllThemes,
  getThemeNames,
  validateTheme,
  validateThemeSafe,
  ThemeBuilder,
  createTheme,
  createSimpleTheme,
  extendTheme,
  registerTheme,
  THEME_PRESETS,
};

export { tokenize, applyTheme };

export {
  renderLine,
  renderLightBox,
  renderLightBoxLine,
  isLightThemeRenderer as isLightThemeStyle,
};

export {
  detectBackground,
  detectTerminalBackground,
  detectBrowserBackground,
  detectSystemBackground,
  isDarkBackground,
  isLightBackground,
  getRecommendedThemeMode,
  watchBackgroundChanges,
  type BackgroundInfo,
  type ColorScheme,
} from "./renderer";

export default LogsDX;
