import { renderLine } from "./renderer";
import { getTheme, getAllThemes, getThemeNames, ThemeBuilder } from "./themes";
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

export class LogsDX {
  private static instance: LogsDX | null = null;
  private options: Required<LogsDXOptions>;
  private currentTheme!: Theme;

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
      autoAdjustTerminal: true,
      ...options,
    };

    if (typeof this.options.theme === "string") {
      this.currentTheme = getTheme(this.options.theme);

      if (
        this.options.outputFormat === "ansi" &&
        this.options.autoAdjustTerminal !== false &&
        typeof process !== "undefined"
      ) {
        const recommendedMode = getRecommendedThemeMode();
        const currentThemeMode = this.currentTheme.mode || "dark";

        if (currentThemeMode !== recommendedMode) {
          const themeName = this.options.theme;
          let alternateThemeName: string;

          if (themeName.includes("-dark")) {
            alternateThemeName = themeName.replace("-dark", "-light");
          } else if (themeName.includes("-light")) {
            alternateThemeName = themeName.replace("-light", "-dark");
          } else {
            alternateThemeName =
              recommendedMode === "dark"
                ? `${themeName}-dark`
                : `${themeName}-light`;
          }

          const alternateTheme = getAllThemes()[alternateThemeName];
          if (alternateTheme) {
            this.currentTheme = alternateTheme;
          }
        }
      }
    } else if (this.options.theme && "light" in this.options.theme && "dark" in this.options.theme) {
      const themePair = this.options.theme as ThemePair;
      
      if (
        this.options.outputFormat === "ansi" &&
        this.options.autoAdjustTerminal !== false &&
        typeof process !== "undefined"
      ) {
        const recommendedMode = getRecommendedThemeMode();
        const selectedTheme = recommendedMode === "light" ? themePair.light : themePair.dark;
        
        if (typeof selectedTheme === "string") {
          this.currentTheme = getTheme(selectedTheme);
        } else {
          this.currentTheme = selectedTheme;
        }
      } else {
        const selectedTheme = themePair.dark;
        if (typeof selectedTheme === "string") {
          this.currentTheme = getTheme(selectedTheme);
        } else {
          this.currentTheme = selectedTheme;
        }
      }
    } else if (this.options.theme) {
      this.currentTheme = this.options.theme as Theme;
    }

    if (
      typeof this.options.theme !== "string" ||
      this.options.theme !== "oh-my-zsh"
    ) {
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
        LogsDX.instance.setTheme(options.theme);
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
   * @param theme Theme name, custom theme configuration, or theme pair
   * @returns True if theme was valid and applied, false otherwise
   */
  setTheme(theme: string | Theme | ThemePair): boolean {
    try {
      if (typeof theme === "string") {
        this.options.theme = theme;
        this.currentTheme = getTheme(theme);
        return true;
      } else if ("light" in theme && "dark" in theme) {
        // Handle ThemePair
        this.options.theme = theme;
        const recommendedMode = getRecommendedThemeMode();
        const selectedTheme = recommendedMode === "light" ? theme.light : theme.dark;
        if (typeof selectedTheme === "string") {
          this.currentTheme = getTheme(selectedTheme);
        } else {
          this.currentTheme = selectedTheme;
        }
        return true;
      } else {
        const validatedTheme = validateTheme(theme as Theme);
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

export type { Theme, ThemePair, StyleOptions, TokenList, LineParser, ParsedLine };

export {
  getTheme,
  getAllThemes,
  getThemeNames,
  validateTheme,
  validateThemeSafe,
  ThemeBuilder,
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
