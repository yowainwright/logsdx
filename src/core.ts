/**
 * LogsDX Core - Pure JavaScript module for minimal JS engines (QuickJS, etc.)
 *
 * This module exports core functionality without:
 * - Dynamic imports
 * - Node.js-specific APIs (process, fs, path)
 * - Browser-specific APIs (window, matchMedia)
 *
 * Themes are bundled statically for QuickJS compatibility.
 */

import { tokenize, applyTheme } from "./tokenizer";
import {
  tokensToString,
  tokensToHtml,
  tokensToClassNames,
  renderAnsi,
  renderHtml,
  renderLine,
  renderLines,
  styleLine,
  resolveColorDepth,
} from "./renderer";
import {
  validateTheme,
  validateThemeSafe,
  isValidationError,
  formatValidationIssues,
  ValidationError,
} from "./schema";
import {
  createTheme,
  createSimpleTheme,
  extendTheme,
  ThemeBuilder,
  THEME_PRESETS,
} from "./themes/builder";

import { ohMyZsh } from "./themes/presets/oh-my-zsh";
import { dracula } from "./themes/presets/dracula";
import { nord } from "./themes/presets/nord";
import { monokai } from "./themes/presets/monokai";
import { githubLight } from "./themes/presets/github-light";
import { githubDark } from "./themes/presets/github-dark";
import { solarizedLight } from "./themes/presets/solarized-light";
import { solarizedDark } from "./themes/presets/solarized-dark";

import type { Theme, ThemePair, StyleOptions, SchemaConfig } from "./types";
import type { Token, TokenList } from "./schema/types";
import type {
  RenderOptions,
  OutputFormat,
  HtmlStyleFormat,
  MatchType,
  TokenWithStyle,
  ColorDepth,
} from "./renderer/types";

export const BUNDLED_THEMES = {
  "oh-my-zsh": ohMyZsh,
  dracula,
  nord,
  monokai,
  "github-light": githubLight,
  "github-dark": githubDark,
  "solarized-light": solarizedLight,
  "solarized-dark": solarizedDark,
} as const;

export type BundledThemeName = keyof typeof BUNDLED_THEMES;

const customThemes = new Map<string, Theme>();

export function getTheme(name: string): Theme {
  const bundled = BUNDLED_THEMES[name as BundledThemeName];
  if (bundled) return bundled;

  const custom = customThemes.get(name);
  if (custom) return custom;

  return BUNDLED_THEMES["oh-my-zsh"];
}

export function registerTheme(theme: Theme): void {
  customThemes.set(theme.name, theme);
}

export function getAllThemes(): Record<string, Theme> {
  const result: Record<string, Theme> = { ...BUNDLED_THEMES };
  customThemes.forEach((theme, name) => {
    result[name] = theme;
  });
  return result;
}

export function getThemeNames(): string[] {
  return [...Object.keys(BUNDLED_THEMES), ...customThemes.keys()];
}

export function processLine(line: string, theme: Theme): string {
  return renderAnsi(line, { theme, forceColors: true });
}

export function processLineHtml(
  line: string,
  theme: Theme,
  useClasses = false,
): string {
  return renderHtml(line, {
    theme,
    htmlStyleFormat: useClasses ? "className" : "css",
  });
}

export function processLines(lines: string[], theme: Theme): string[] {
  return lines.map((line) => processLine(line, theme));
}

export function processLog(content: string, theme: Theme): string {
  const lines = content.split("\n");
  const processed = lines.map((line) => processLine(line, theme));
  return processed.join("\n");
}

export {
  tokenize,
  applyTheme,
  tokensToString,
  tokensToHtml,
  tokensToClassNames,
  renderAnsi,
  renderHtml,
  renderLine,
  renderLines,
  styleLine,
  resolveColorDepth,
  validateTheme,
  validateThemeSafe,
  isValidationError,
  formatValidationIssues,
  ValidationError,
  createTheme,
  createSimpleTheme,
  extendTheme,
  ThemeBuilder,
  THEME_PRESETS,
};

export type {
  Theme,
  ThemePair,
  StyleOptions,
  SchemaConfig,
  Token,
  TokenList,
  RenderOptions,
  OutputFormat,
  HtmlStyleFormat,
  MatchType,
  TokenWithStyle,
  ColorDepth,
};

export default {
  getTheme,
  registerTheme,
  getAllThemes,
  getThemeNames,
  processLine,
  processLineHtml,
  processLines,
  processLog,
  tokenize,
  applyTheme,
  BUNDLED_THEMES,
};
