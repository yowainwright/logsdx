import {
  getRecommendedThemeMode,
  isLightTheme as isLightThemeRenderer,
  renderAnsi,
  renderHtml,
  renderLightBox,
  renderLightBoxLine,
  renderLine,
  resolveColorDepth,
  styleLine,
  tokensToHtml,
  tokensToString,
} from "./renderer";
import {
  THEME_PRESETS,
  ThemeBuilder,
  createSimpleTheme,
  createTheme,
  extendTheme,
  getAllThemes,
  getTheme,
  getThemeAsync,
  getThemeNames,
  preloadAllThemes,
  preloadTheme,
  registerTheme,
  registerThemeLoader,
} from "./themes";
import { validateTheme, validateThemeSafe } from "./schema";
import { applyTheme, tokenize } from "./tokenizer";
import { createLogger, setLogLevel } from "./utils/logger";
import type { TokenList } from "./schema/types";
import type {
  ColorDepth,
  HtmlStyleFormat,
  MatchType,
  OutputFormat,
  RenderOptions,
  TokenWithStyle,
} from "./renderer/types";
import type {
  LineParser,
  LogsDXOptions,
  ParsedLine,
  StyleOptions,
  Theme,
  ThemePair,
} from "./types";

const log = createLogger("logsdx");

const createEmptyTheme = (): Theme => ({
  description: "No styling applied",
  mode: "auto",
  name: "none",
  schema: {
    defaultStyle: { color: "" },
    matchContains: {},
    matchEndsWith: {},
    matchPatterns: [],
    matchStartsWith: {},
    matchWords: {},
  },
});

const isAutoAdjustEnabled = (options: Required<LogsDXOptions>): boolean => {
  const isAnsiOutput = options.outputFormat === "ansi";
  const isAutoAdjustConfigured = options.autoAdjustTerminal;
  const hasProcess = typeof process !== "undefined";
  const canAutoAdjust = isAnsiOutput && isAutoAdjustConfigured;
  return canAutoAdjust && hasProcess;
};

const getAlternateThemeName = (
  themeName: string,
  recommendedMode: "light" | "dark",
): string => {
  if (themeName.includes("-dark")) {
    return themeName.replace("-dark", "-light");
  }

  if (themeName.includes("-light")) {
    return themeName.replace("-light", "-dark");
  }

  const alternateMode = recommendedMode === "dark" ? "dark" : "light";
  return `${themeName}-${alternateMode}`;
};

const resolveThemeReference = async (theme: string | Theme): Promise<Theme> => {
  if (typeof theme === "string") {
    return getTheme(theme);
  }

  return theme;
};

const resolveAdjustedTheme = (themeName: string, baseTheme: Theme): Theme => {
  const recommendedMode = getRecommendedThemeMode();
  const currentThemeMode = baseTheme.mode ?? "dark";

  if (currentThemeMode === recommendedMode) {
    return baseTheme;
  }

  const alternateThemeName = getAlternateThemeName(themeName, recommendedMode);
  return getAllThemes()[alternateThemeName] ?? baseTheme;
};

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
  private static instancePromise: Promise<LogsDX> | null = null;
  private options: Required<LogsDXOptions>;
  private currentTheme: Theme = createEmptyTheme();

  private constructor(theme: Theme, options: LogsDXOptions = {}) {
    this.options = {
      autoAdjustTerminal: true,
      colorDepth: "auto",
      customRules: {},
      debug: false,
      escapeHtml: true,
      htmlStyleFormat: "css",
      outputFormat: "ansi",
      theme: "none",
      ...options,
    };

    if (this.options.debug) {
      setLogLevel("debug");
    }

    this.currentTheme = theme;
  }

  private async resolveThemeName(themeName: string): Promise<Theme> {
    const baseTheme = await getTheme(themeName);
    const shouldAdjustTheme = isAutoAdjustEnabled(this.options);

    if (!shouldAdjustTheme) {
      return baseTheme;
    }

    return resolveAdjustedTheme(themeName, baseTheme);
  }

  private async resolveThemePair(themePair: ThemePair): Promise<Theme> {
    const selectedMode = isAutoAdjustEnabled(this.options)
      ? getRecommendedThemeMode()
      : "dark";
    return resolveThemeReference(themePair[selectedMode]);
  }

  private resolveCustomTheme(theme: Theme): Theme {
    try {
      return validateTheme(theme);
    } catch (error) {
      log.debug(`Invalid custom theme: ${error}`);
      return createEmptyTheme();
    }
  }

  private async resolveTheme(
    theme: string | Theme | ThemePair | undefined,
  ): Promise<Theme> {
    const isEmptyTheme = !theme || theme === "none";
    if (isEmptyTheme) {
      return createEmptyTheme();
    }

    if (typeof theme === "string") {
      return this.resolveThemeName(theme);
    }

    const isThemePair = "light" in theme && "dark" in theme;
    if (isThemePair) {
      return this.resolveThemePair(theme);
    }

    return this.resolveCustomTheme(theme);
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
   * const logsdx = await LogsDX.getInstance({ theme: 'nord', outputFormat: 'ansi' });
   * ```
   */
  static async getInstance(options: LogsDXOptions = {}): Promise<LogsDX> {
    if (LogsDX.instancePromise) {
      const instance = await LogsDX.instancePromise;
      if (Object.keys(options).length > 0) {
        instance.options = {
          ...instance.options,
          ...options,
        };

        if (options.debug) {
          setLogLevel("debug");
        }

        if (options.theme) {
          instance.currentTheme = await instance.resolveTheme(options.theme);
        }
      }
      return instance;
    }

    LogsDX.instancePromise = (async () => {
      const theme = await new LogsDX(createEmptyTheme(), options).resolveTheme(
        options.theme || "oh-my-zsh",
      );
      const instance = new LogsDX(theme, options);
      LogsDX.instance = instance;
      return instance;
    })();

    return LogsDX.instancePromise;
  }

  /**
   * Reset the LogsDX singleton instance
   *
   * Useful for testing or when you need to reconfigure LogsDX from scratch
   */
  public static resetInstance(): void {
    LogsDX.instance = null;
    LogsDX.instancePromise = null;
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
      colorDepth: this.options.colorDepth,
      escapeHtml: this.options.escapeHtml,
      htmlStyleFormat: this.options.htmlStyleFormat,
      outputFormat: this.options.outputFormat,
      theme: this.currentTheme,
    };

    return renderLine(line, this.currentTheme, renderOptions);
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

  async setTheme(theme: string | Theme | ThemePair): Promise<boolean> {
    try {
      this.options.theme = theme;
      this.currentTheme = await this.resolveTheme(theme);
      return true;
    } catch (error) {
      log.debug(`Invalid theme: ${error}`);
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

  setColorDepth(depth: ColorDepth): void {
    this.options.colorDepth = depth;
  }

  getColorDepth(): ColorDepth {
    return this.options.colorDepth;
  }
}

export async function getLogsDX(options?: LogsDXOptions): Promise<LogsDX> {
  return LogsDX.getInstance(options);
}

export type {
  Theme,
  ThemePair,
  StyleOptions,
  TokenList,
  LineParser,
  ParsedLine,
  LogsDXOptions,
};

export type {
  OutputFormat,
  HtmlStyleFormat,
  MatchType,
  TokenWithStyle,
  RenderOptions,
  ColorDepth,
};

export {
  getTheme,
  getThemeAsync,
  getAllThemes,
  getThemeNames,
  preloadTheme,
  preloadAllThemes,
  registerTheme,
  registerThemeLoader,
  validateTheme,
  validateThemeSafe,
  ThemeBuilder,
  createTheme,
  createSimpleTheme,
  extendTheme,
  THEME_PRESETS,
};

export {
  isValidationError,
  formatValidationIssues,
  ValidationError,
} from "./schema";

export { tokenize, applyTheme };

export {
  renderAnsi,
  renderHtml,
  renderLine,
  styleLine,
  tokensToString,
  tokensToHtml,
  resolveColorDepth,
  renderLightBox,
  renderLightBoxLine,
  isLightThemeRenderer as isLightThemeStyle,
  isLightThemeRenderer as isLightTheme,
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
