import type { Theme } from '@/src/types';
import { THEMES, DEFAULT_THEME } from '@/src/themes/constants';

/**
 * Get a theme by name
 * @param themeName Name of the theme to get
 * @returns The requested theme or default theme if not found
 */
export function getTheme(themeName: string): Theme {
  return THEMES[themeName] || THEMES[DEFAULT_THEME] as Theme;
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
 * Apply a theme by name
 * @param themeName Name of the theme to apply
 */
export function applyTheme(themeName: string): void {
  console.log(`Applied theme: ${themeName}`);
}

/**
 * Reset to the default theme
 */
export function resetToDefaultTheme(): void {
  applyTheme(DEFAULT_THEME);
}