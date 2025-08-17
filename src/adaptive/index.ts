/**
 * Adaptive theming utilities for LogsDX
 * Automatically adapt themes based on system preferences and environment
 */

import { LogsDXOptions } from "../types";
import { getLogsDX } from "../index";
import { getAllThemes } from "../themes";

/**
 * Detects the preferred color scheme
 */
export function detectColorScheme(): "light" | "dark" | "no-preference" {
  // Browser environment
  if (typeof window !== "undefined" && window.matchMedia) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "no-preference";
  }

  // Node.js environment
  if (typeof process !== "undefined") {
    // Check common environment variables
    if (process.env.THEME_MODE) {
      return process.env.THEME_MODE as "light" | "dark";
    }

    // Check terminal indicators
    if (process.env.COLORFGBG) {
      // Format: "foreground;background"
      const [_fg, bg] = process.env.COLORFGBG.split(";").map(Number);
      // Dark background typically has low values (0-7)
      return bg <= 7 ? "dark" : "light";
    }

    // Check specific terminal programs
    const darkTerminals = ["iTerm.app", "Hyper", "Windows Terminal"];
    if (darkTerminals.includes(process.env.TERM_PROGRAM || "")) {
      return "dark";
    }
  }

  return "no-preference";
}

/**
 * Detects high contrast preference
 */
export function detectHighContrast(): boolean {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-contrast: high)").matches;
  }

  if (typeof process !== "undefined") {
    return process.env.HIGH_CONTRAST === "true";
  }

  return false;
}

/**
 * Detects reduced motion preference
 */
export function detectReducedMotion(): boolean {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  return false;
}

/**
 * Maps theme names to their variants
 */
export const THEME_VARIANTS = {
  github: { light: "github-light", dark: "github-dark" },
  solarized: { light: "solarized-light", dark: "solarized-dark" },
  default: { light: "oh-my-zsh", dark: "dracula" },
} as const;

/**
 * Gets the appropriate theme based on system preferences
 */
export function getAdaptiveTheme(
  baseTheme: string = "github",
  options?: {
    respectHighContrast?: boolean;
    fallback?: "light" | "dark";
  },
): string {
  const colorScheme = detectColorScheme();
  const highContrast = options?.respectHighContrast
    ? detectHighContrast()
    : false;

  // Handle high contrast variants if available
  if (highContrast) {
    const hcTheme = `${baseTheme}-high-contrast-${colorScheme}`;
    const themes = getAllThemes();
    if (themes[hcTheme]) {
      return hcTheme;
    }
  }

  // Get theme variant based on color scheme
  const variants = THEME_VARIANTS[baseTheme as keyof typeof THEME_VARIANTS];
  if (variants) {
    if (colorScheme === "dark") return variants.dark;
    if (colorScheme === "light") return variants.light;
  }

  // Fallback logic
  const fallback = options?.fallback || "dark";
  if (colorScheme === "no-preference") {
    return fallback === "dark" ? "dracula" : "oh-my-zsh";
  }

  return baseTheme;
}

/**
 * Creates an adaptive logger that responds to system changes
 */
export class AdaptiveLogger {
  private baseTheme: string;
  private options: LogsDXOptions;
  private logger: ReturnType<typeof getLogsDX>;
  private listeners: Set<(theme: string) => void> = new Set();
  private mediaQuery?: MediaQueryList;

  constructor(baseTheme: string = "github", options?: LogsDXOptions) {
    this.baseTheme = baseTheme;
    this.options = options || {};

    // Initialize with current theme
    const currentTheme = getAdaptiveTheme(baseTheme);
    this.logger = getLogsDX({ ...this.options, theme: currentTheme });

    // Watch for changes in browser
    if (typeof window !== "undefined" && window.matchMedia) {
      this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      this.mediaQuery.addEventListener("change", this.handleChange);
    }
  }

  private handleChange = () => {
    const newTheme = getAdaptiveTheme(this.baseTheme);
    this.logger = getLogsDX({ ...this.options, theme: newTheme });

    // Notify listeners
    this.listeners.forEach((listener) => listener(newTheme));
  };

  /**
   * Process a log line with the current adaptive theme
   */
  processLine(line: string): string {
    return this.logger.processLine(line);
  }

  /**
   * Process multiple log lines
   */
  processLines(lines: string[]): string[] {
    return this.logger.processLines(lines);
  }

  /**
   * Listen for theme changes
   */
  onThemeChange(listener: (theme: string) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get the current theme name
   */
  getCurrentTheme(): string {
    return getAdaptiveTheme(this.baseTheme);
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener("change", this.handleChange);
    }
    this.listeners.clear();
  }
}

/**
 * React hook for adaptive theming
 */
export function useAdaptiveLogger(
  baseTheme: string = "github",
  options?: LogsDXOptions,
) {
  if (typeof window === "undefined") {
    throw new Error(
      "useAdaptiveLogger can only be used in browser environments",
    );
  }

  const [logger, setLogger] = (window as any).React.useState(
    () => new AdaptiveLogger(baseTheme, options),
  )
  (window as any).React.useEffect(() => {
    const adaptive = new AdaptiveLogger(baseTheme, options);
    setLogger(adaptive);

    return () => adaptive.destroy();
  }, [baseTheme, JSON.stringify(options)]);

  return logger;
}

/**
 * Generates CSS custom properties from theme
 */
export function generateThemeProperties(theme: any): string {
  const props: string[] = [];

  // Check if theme has the expected structure
  const colors =
    theme.colorPalette || theme.colors || theme.schema?.colorPalette;

  if (colors) {
    Object.entries(colors).forEach(([key, value]) => {
      props.push(`--logsdx-${key}: ${value};`);
    });
  }

  // Add semantic properties with fallbacks
  const bgColor = colors?.background || "#ffffff";
  const fgColor = colors?.text || "#000000";

  props.push(`--logsdx-bg: var(--logsdx-background, ${bgColor});`);
  props.push(`--logsdx-fg: var(--logsdx-text, ${fgColor});`);

  return props.join("\n  ");
}

/**
 * Injects adaptive theme CSS into document
 */
export function injectAdaptiveCSS(themes: string[] = ["github", "solarized"]) {
  if (typeof document === "undefined") return;

  const allThemes = getAllThemes();
  const css: string[] = [];

  // Generate CSS for each theme variant
  themes.forEach((baseTheme) => {
    const variants = THEME_VARIANTS[baseTheme as keyof typeof THEME_VARIANTS];
    if (!variants) return;

    // Light variant
    const lightTheme = allThemes[variants.light];
    if (lightTheme) {
      css.push(`
[data-theme="${variants.light}"] {
  ${generateThemeProperties(lightTheme)}
}`);
    }

    // Dark variant
    const darkTheme = allThemes[variants.dark];
    if (darkTheme) {
      css.push(`
[data-theme="${variants.dark}"] {
  ${generateThemeProperties(darkTheme)}
}`);
    }
  });

  // Add media queries
  css.push(`
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    ${generateThemeProperties(allThemes["github-light"] || allThemes["oh-my-zsh"])}
  }
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    ${generateThemeProperties(allThemes["github-dark"] || allThemes["dracula"])}
  }
}`);

  // Inject styles
  const style = document.createElement("style");
  style.id = "logsdx-adaptive-themes";
  style.textContent = css.join("\n");
  document.head.appendChild(style);
}
