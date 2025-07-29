import type { Theme } from "@/src/types";
import { THEMES, DEFAULT_THEME } from "@/src/themes/constants";
import { 
  createTheme, 
  createSimpleTheme, 
  extendTheme, 
  THEME_PRESETS,
  generateBEMClasses,
  generateTailwindTheme,
  generateUtilityClasses,
  generateThemeVariants,
  generateResponsiveCSS,
  validateTheme,
  detectColorScheme,
  adjustThemeForAccessibility,
  checkWCAGCompliance,
  createThemeMonitor,
  generateThemeReport
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

export {
  createTheme,
  createSimpleTheme,
  extendTheme,
  THEME_PRESETS,
  generateBEMClasses,
  generateTailwindTheme,
  generateUtilityClasses,
  generateThemeVariants,
  generateResponsiveCSS,
  validateTheme,
  detectColorScheme,
  adjustThemeForAccessibility,
  checkWCAGCompliance,
  createThemeMonitor,
  generateThemeReport,
  type ColorPalette,
  type SimpleThemeConfig,
};

/**
 * Register a new theme
 * @param theme Theme to register
 */
export function registerTheme(theme: Theme): void {
  THEMES[theme.name] = theme;
}

/**
 * Generate complete CSS theme package with BEM, utility classes, and responsive design
 * @param theme - The theme to generate CSS for
 * @param options - Generation options
 * @returns Complete CSS theme package
 */
export function generateCompleteCSS(
  theme: Theme, 
  options: { 
    block?: string; 
    prefix?: string; 
    includeBEM?: boolean; 
    includeUtilities?: boolean; 
    includeResponsive?: boolean;
  } = {}
): {
  bem: string;
  utilities: string;
  responsive: string;
  tailwind: Record<string, any>;
  complete: string;
} {
  const { 
    block = 'logsdx', 
    prefix = 'logsdx', 
    includeBEM = true, 
    includeUtilities = true, 
    includeResponsive = true 
  } = options;

  const bem = includeBEM ? generateBEMClasses(theme, block) : '';
  const utilities = includeUtilities ? generateUtilityClasses(theme, prefix) : '';
  const responsive = includeResponsive ? generateResponsiveCSS(theme, block) : '';
  const tailwind = generateTailwindTheme(theme);

  const complete = [bem, utilities, responsive].filter(Boolean).join('\n\n');

  return {
    bem,
    utilities,
    responsive,
    tailwind,
    complete
  };
}
