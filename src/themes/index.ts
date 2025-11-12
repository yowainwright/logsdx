import type { Theme } from "../types";
import { THEMES, DEFAULT_THEME } from "./constants";
import {
  createTheme,
  createSimpleTheme,
  extendTheme,
  THEME_PRESETS,
  ThemeBuilder,
  checkWCAGCompliance,
  adjustThemeForAccessibility,
} from "./builder";
import type { ColorPalette, SimpleThemeConfig } from "./builder";

export function getTheme(themeName: string): Theme {
  return THEMES[themeName] || (THEMES[DEFAULT_THEME] as Theme);
}

export function getAllThemes(): Record<string, Theme> {
  return THEMES;
}

export function getThemeNames(): string[] {
  return Object.keys(THEMES);
}

export function registerTheme(theme: Theme): void {
  THEMES[theme.name] = theme;
}

export {
  createTheme,
  createSimpleTheme,
  extendTheme,
  THEME_PRESETS,
  ThemeBuilder,
  checkWCAGCompliance,
  adjustThemeForAccessibility,
  type ColorPalette,
  type SimpleThemeConfig,
};
