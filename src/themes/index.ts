import type { Theme } from "@/src/types";
import { THEMES, DEFAULT_THEME } from "@/src/themes/constants";
import {
  createTheme,
  createSimpleTheme,
  extendTheme,
  THEME_PRESETS,
  ThemeBuilder,
  checkWCAGCompliance,
  adjustThemeForAccessibility,
} from "@/src/themes/builder";
import type { ColorPalette, SimpleThemeConfig } from "@/src/themes/builder";

/**
 * Get a theme by name
 * @param themeName Name of the theme to get
 * @returns The requested theme or default theme if not found
 */
export function getTheme(themeName: string): Theme {
  return THEMES[themeName] || (THEMES[DEFAULT_THEME] as Theme);
}

/**
 * Get all available themes
 * @returns Object containing all available themes
 */
export function getAllThemes(): Record<string, Theme> {
  return THEMES;
}

/**
 * Get names of all available themes
 * @returns Array of theme names
 */
export function getThemeNames(): string[] {
  return Object.keys(THEMES);
}

/**
 * Register a custom theme to make it available for use
 * @param theme The theme to register
 */
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
