import type { Theme } from "../types";
import { DEFAULT_THEME } from "./constants";
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
import {
  themeRegistry,
  getTheme as loadThemeAsync,
  registerTheme as registerThemeRegistry,
  getThemeNames as getThemeNamesRegistry,
  getAllLoadedThemes,
  preloadTheme,
  preloadAllThemes,
  registerThemeLoader,
} from "./registry";

export async function getTheme(themeName: string): Promise<Theme> {
  return loadThemeAsync(themeName);
}

export async function getThemeAsync(themeName: string): Promise<Theme> {
  return loadThemeAsync(themeName);
}

export function getAllThemes(): Record<string, Theme> {
  return getAllLoadedThemes();
}

export function getThemeNames(): string[] {
  return getThemeNamesRegistry();
}

export function registerTheme(theme: Theme): void {
  registerThemeRegistry(theme);
}

export {
  createTheme,
  createSimpleTheme,
  extendTheme,
  THEME_PRESETS,
  ThemeBuilder,
  checkWCAGCompliance,
  adjustThemeForAccessibility,
  preloadTheme,
  preloadAllThemes,
  registerThemeLoader,
  themeRegistry,
  type ColorPalette,
  type SimpleThemeConfig,
};
