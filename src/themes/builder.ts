import type { Theme, SchemaConfig, StyleOptions, PatternMatch } from "../types";

export interface ColorPalette {
  primary?: string;
  secondary?: string;
  accent?: string;
  error?: string;
  warning?: string;
  info?: string;
  success?: string;
  debug?: string;
  text?: string;
  background?: string;
  muted?: string;
  highlight?: string;
  [key: string]: string | undefined;
}

export interface ThemePreset {
  name: string;
  patterns: PatternMatch[];
  words?: Record<string, StyleOptions>;
}

export interface SimpleThemeConfig {
  name: string;
  description?: string;
  colors: ColorPalette;
  mode?: "light" | "dark" | "auto";
  presets?: string[];
  customWords?: Record<string, string | StyleOptions>;
  customPatterns?: Array<{
    name: string;
    pattern: string;
    color: string;
    style?: string[];
  }>;
  defaultTextColor?: string;
  whiteSpace?: "preserve" | "trim";
  newLine?: "preserve" | "trim";
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  logLevels: {
    name: "Log Levels",
    words: {
      ERROR: { color: "error", styleCodes: ["bold"] },
      WARN: { color: "warning", styleCodes: ["bold"] },
      WARNING: { color: "warning", styleCodes: ["bold"] },
      INFO: { color: "info", styleCodes: ["bold"] },
      DEBUG: { color: "debug" },
      SUCCESS: { color: "success", styleCodes: ["bold"] },
    },
    patterns: [],
  },

  booleans: {
    name: "Boolean Values",
    words: {
      true: { color: "success" },
      false: { color: "error" },
      null: { color: "muted", styleCodes: ["italic"] },
      undefined: { color: "muted", styleCodes: ["italic"] },
    },
    patterns: [],
  },

  brackets: {
    name: "Brackets and Punctuation",
    patterns: [
      {
        name: "curly-brace-left",
        pattern: "\\{",
        options: { color: "accent" },
      },
      {
        name: "curly-brace-right",
        pattern: "\\}",
        options: { color: "accent" },
      },
      {
        name: "square-bracket-left",
        pattern: "\\[",
        options: { color: "accent" },
      },
      {
        name: "square-bracket-right",
        pattern: "\\]",
        options: { color: "accent" },
      },
      {
        name: "parenthesis-left",
        pattern: "\\(",
        options: { color: "accent" },
      },
      {
        name: "parenthesis-right",
        pattern: "\\)",
        options: { color: "accent" },
      },
      {
        name: "equal-sign",
        pattern: "=",
        options: { color: "text" },
      },
    ],
  },

  strings: {
    name: "Strings and Quotes",
    patterns: [
      {
        name: "quoted-string",
        pattern: "(['\"])(.*?)\\1",
        options: { color: "success" },
      },
    ],
  },

  numbers: {
    name: "Numbers",
    patterns: [
      {
        name: "number",
        pattern: "\\b\\d+\\b",
        options: { color: "primary" },
      },
    ],
  },

  dates: {
    name: "Dates and Times",
    patterns: [
      {
        name: "semantic-version",
        pattern: "\\d+\\.\\d+\\.\\d+",
        options: { color: "info", styleCodes: ["bold"] },
      },
      {
        name: "date",
        pattern: "\\d{4}-\\d{2}-\\d{2}",
        options: { color: "info" },
      },
      {
        name: "time",
        pattern: "\\d{2}:\\d{2}:\\d{2}",
        options: { color: "info" },
      },
    ],
  },
};

/**
 * Resolve a color reference to an actual color value
 */
function resolveColor(colorRef: string, palette: ColorPalette): string {
  if (palette[colorRef]) {
    return palette[colorRef]!;
  }
  // Otherwise, assume it's a direct color value
  return colorRef;
}

/**
 * Convert a simple style options object to full StyleOptions
 */
function normalizeStyleOptions(
  options: string | StyleOptions,
  palette: ColorPalette
): StyleOptions {
  if (typeof options === "string") {
    return { color: resolveColor(options, palette) };
  }
  
  return {
    ...options,
    color: resolveColor(options.color, palette),
  };
}

/**
 * Create a theme from a simple configuration
 */
export function createTheme(config: SimpleThemeConfig): Theme {
  const schema: SchemaConfig = {
    defaultStyle: {
      color: resolveColor(config.defaultTextColor || config.colors.text || "white", config.colors),
    },
    matchWords: {},
    matchPatterns: [],
    whiteSpace: config.whiteSpace || "preserve",
    newLine: config.newLine || "preserve",
  };

  // Add preset patterns and words
  const presets = config.presets || ["logLevels", "booleans", "brackets", "strings", "numbers", "dates"];
  
  for (const presetName of presets) {
    const preset = THEME_PRESETS[presetName];
    if (!preset) continue;

    // Add preset words
    if (preset.words) {
      for (const [word, style] of Object.entries(preset.words)) {
        const normalizedStyle = normalizeStyleOptions(style, config.colors);
        schema.matchWords![word] = normalizedStyle;
      }
    }

    // Add preset patterns
    if (preset.patterns) {
      for (const pattern of preset.patterns) {
        const normalizedPattern = {
          ...pattern,
          options: normalizeStyleOptions(pattern.options, config.colors),
        };
        schema.matchPatterns!.push(normalizedPattern);
      }
    }
  }

  // Add custom words
  if (config.customWords) {
    for (const [word, style] of Object.entries(config.customWords)) {
      const normalizedStyle = normalizeStyleOptions(style, config.colors);
      schema.matchWords![word] = normalizedStyle;
    }
  }

  // Add custom patterns
  if (config.customPatterns) {
    for (const pattern of config.customPatterns) {
      const normalizedPattern: PatternMatch = {
        name: pattern.name,
        pattern: pattern.pattern,
        options: {
          color: resolveColor(pattern.color, config.colors),
          styleCodes: (pattern.style || []) as ("bold" | "italic" | "underline" | "dim" | "blink" | "reverse" | "strikethrough")[],
        },
      };
      schema.matchPatterns!.push(normalizedPattern);
    }
  }

  return {
    name: config.name,
    description: config.description,
    mode: config.mode,
    schema,
  };
}

/**
 * Create a theme with sensible defaults and a simple color palette
 */
export function createSimpleTheme(
  name: string,
  colors: ColorPalette,
  options: Partial<SimpleThemeConfig> = {}
): Theme {
  return createTheme({
    name,
    colors,
    ...options,
  });
}

/**
 * Fluent theme builder for more complex theme creation
 */
export class ThemeBuilder {
  private config: Partial<SimpleThemeConfig> = {};

  constructor(name: string) {
    this.config.name = name;
  }

  description(desc: string): ThemeBuilder {
    this.config.description = desc;
    return this;
  }

  mode(mode: "light" | "dark" | "auto"): ThemeBuilder {
    this.config.mode = mode;
    return this;
  }

  colors(palette: ColorPalette): ThemeBuilder {
    this.config.colors = palette;
    return this;
  }

  presets(presets: string[]): ThemeBuilder {
    this.config.presets = presets;
    return this;
  }

  customWords(words: Record<string, string | StyleOptions>): ThemeBuilder {
    this.config.customWords = { ...this.config.customWords, ...words };
    return this;
  }

  build(): Theme {
    if (!this.config.name || !this.config.colors) {
      throw new Error("Theme name and colors are required");
    }
    return createTheme(this.config as SimpleThemeConfig);
  }

  preview(): string {
    if (!this.config.colors) {
      return "No colors configured for preview";
    }
    
    const sampleLog = `ERROR: Database connection failed
WARN: Rate limit exceeded  
INFO: User authenticated
DEBUG: Processing request`;
    
    try {
      const theme = this.build();
      // Simple preview without full LogsDX instance
      return sampleLog.split('\n').map(line => {
        // Basic preview - just show the line with color indicators
        const level = line.split(':')[0];
        const color = this.config.colors![level.toLowerCase()] || this.config.colors!.text || 'default';
        return `${line} [${color}]`;
      }).join('\n');
    } catch (error) {
      return `Preview error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  static create(name: string): ThemeBuilder {
    return new ThemeBuilder(name);
  }
}

/**
 * Extend an existing theme with modifications
 */
export function extendTheme(
  baseTheme: Theme,
  modifications: Partial<SimpleThemeConfig>
): Theme {
  const config: SimpleThemeConfig = {
    name: modifications.name || `${baseTheme.name}-extended`,
    description: modifications.description || `Extended version of ${baseTheme.name}`,
    colors: modifications.colors || {},
    presets: modifications.presets,
    customWords: modifications.customWords,
    customPatterns: modifications.customPatterns,
    defaultTextColor: modifications.defaultTextColor,
    whiteSpace: modifications.whiteSpace || baseTheme.schema.whiteSpace,
    newLine: modifications.newLine || baseTheme.schema.newLine,
  };

  // Merge base theme's existing words and patterns if not overridden
  if (!modifications.presets) {
    // Extract existing configuration from base theme
    const baseWords = baseTheme.schema.matchWords || {};
    const basePatterns = baseTheme.schema.matchPatterns || [];
    
    config.customWords = { ...baseWords, ...config.customWords };
    config.customPatterns = [
      ...basePatterns.map(p => ({
        name: p.name,
        pattern: p.pattern,
        color: p.options.color,
        style: p.options.styleCodes || [],
      })),
      ...(config.customPatterns || []),
    ];
    config.presets = []; // Don't apply presets if extending
  }

  return createTheme(config);
}

/**
 * Generate BEM-style CSS classes from a theme
 */
export function generateBEMClasses(theme: Theme, block: string = 'logsdx'): string {
  const css: string[] = [];
  
  // Base block styles
  css.push(`.${block} {`);
  css.push('  font-family: ui-monospace, SFMono-Regular, Monaco, Consolas, monospace;');
  css.push('  white-space: pre-wrap;');
  css.push('  line-height: 1.4;');
  if (theme.schema.defaultStyle?.color) {
    css.push(`  color: ${theme.schema.defaultStyle.color};`);
  }
  css.push('}');
  css.push('');

  // Style modifiers
  const styleModifiers = ['bold', 'italic', 'underline', 'dim'];
  styleModifiers.forEach(modifier => {
    css.push(`.${block}--${modifier} {`);
    switch (modifier) {
      case 'bold':
        css.push('  font-weight: bold;');
        break;
      case 'italic':
        css.push('  font-style: italic;');
        break;
      case 'underline':
        css.push('  text-decoration: underline;');
        break;
      case 'dim':
        css.push('  opacity: 0.7;');
        break;
    }
    css.push('}');
    css.push('');
  });

  // Color elements from patterns and words
  const colorElements = new Set<string>();
  
  // Extract colors from word matches
  if (theme.schema.matchWords) {
    Object.entries(theme.schema.matchWords).forEach(([word, style]) => {
      if (style.color) {
        colorElements.add(style.color);
      }
    });
  }

  // Extract colors from pattern matches
  if (theme.schema.matchPatterns) {
    theme.schema.matchPatterns.forEach(pattern => {
      if (pattern.options.color) {
        colorElements.add(pattern.options.color);
      }
    });
  }

  // Generate color element classes
  colorElements.forEach(color => {
    const elementName = color.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
    css.push(`.${block}__${elementName} {`);
    css.push(`  color: ${color};`);
    css.push('}');
    css.push('');
  });

  return css.join('\n');
}

/**
 * Generate Tailwind-compatible theme configuration
 */
export function generateTailwindTheme(theme: Theme): Record<string, any> {
  const tailwindConfig: Record<string, any> = {
    extend: {
      colors: {},
      fontFamily: {
        'logsdx': ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'monospace']
      }
    }
  };

  // Extract unique colors
  const colors = new Set<string>();
  
  if (theme.schema.defaultStyle?.color) {
    colors.add(theme.schema.defaultStyle.color);
  }

  if (theme.schema.matchWords) {
    Object.values(theme.schema.matchWords).forEach(style => {
      if (style.color) colors.add(style.color);
    });
  }

  if (theme.schema.matchPatterns) {
    theme.schema.matchPatterns.forEach(pattern => {
      if (pattern.options.color) colors.add(pattern.options.color);
    });
  }

  // Convert to tailwind color palette
  const colorPalette: Record<string, string> = {};
  colors.forEach(color => {
    const colorName = color.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    colorPalette[colorName] = color;
  });

  tailwindConfig.extend.colors.logsdx = colorPalette;

  return tailwindConfig;
}

/**
 * Generate utility CSS classes for inline usage
 */
export function generateUtilityClasses(theme: Theme, prefix: string = 'logsdx'): string {
  const css: string[] = [];
  
  // Base utility class
  css.push(`.${prefix} {`);
  css.push('  font-family: ui-monospace, SFMono-Regular, Monaco, Consolas, monospace;');
  css.push('  white-space: pre-wrap;');
  css.push('  line-height: 1.4;');
  if (theme.schema.defaultStyle?.color) {
    css.push(`  color: ${theme.schema.defaultStyle.color};`);
  }
  css.push('}');
  css.push('');

  // Style utilities
  css.push(`.${prefix}-bold { font-weight: bold; }`);
  css.push(`.${prefix}-italic { font-style: italic; }`);
  css.push(`.${prefix}-underline { text-decoration: underline; }`);
  css.push(`.${prefix}-dim { opacity: 0.7; }`);
  css.push('');

  // Color utilities
  const colors = new Set<string>();
  
  if (theme.schema.matchWords) {
    Object.values(theme.schema.matchWords).forEach(style => {
      if (style.color) colors.add(style.color);
    });
  }

  if (theme.schema.matchPatterns) {
    theme.schema.matchPatterns.forEach(pattern => {
      if (pattern.options.color) colors.add(pattern.options.color);
    });
  }

  colors.forEach(color => {
    const className = color.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
    css.push(`.${prefix}-${className} { color: ${color}; }`);
  });

  return css.join('\n');
}

/**
 * Generate light/dark mode variants of a theme
 */
export function generateThemeVariants(config: SimpleThemeConfig): { light: Theme; dark: Theme } {
  const lightConfig = { ...config, mode: 'light' as const };
  const darkConfig = { ...config, mode: 'dark' as const };

  // Adjust colors for light mode
  if (!lightConfig.colors.background) {
    lightConfig.colors.background = '#ffffff';
  }
  if (!lightConfig.colors.text) {
    lightConfig.colors.text = '#000000';
  }

  // Adjust colors for dark mode  
  if (!darkConfig.colors.background) {
    darkConfig.colors.background = '#1a1a1a';
  }
  if (!darkConfig.colors.text) {
    darkConfig.colors.text = '#ffffff';
  }

  return {
    light: createTheme({ ...lightConfig, name: `${config.name}-light` }),
    dark: createTheme({ ...darkConfig, name: `${config.name}-dark` })
  };
}

/**
 * Generate CSS with light/dark mode support
 */
export function generateResponsiveCSS(theme: Theme, block: string = 'logsdx'): string {
  const css: string[] = [];
  
  // Base styles
  css.push(generateBEMClasses(theme, block));
  
  // Dark mode overrides
  css.push('@media (prefers-color-scheme: dark) {');
  css.push(`  .${block} {`);
  css.push('    background-color: #1a1a1a;');
  css.push('    color: #ffffff;');
  css.push('  }');
  css.push('}');
  css.push('');
  
  // Light mode overrides  
  css.push('@media (prefers-color-scheme: light) {');
  css.push(`  .${block} {`);
  css.push('    background-color: #ffffff;');
  css.push('    color: #000000;');
  css.push('  }');
  css.push('}');

  return css.join('\n');
}

// Import existing color libraries 
const tinycolor = require('tinycolor2');

/**
 * Color utilities for validation and detection using industry-standard libraries
 */
interface ColorAnalysis {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  luminance: number;
  isDark: boolean;
  isLight: boolean;
  isValid: boolean;
  contrastRatio?: number;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors using tinycolor2
 */
function getContrastRatio(color1: string, color2: string): number {
  const tc1 = tinycolor(color1);
  const tc2 = tinycolor(color2);
  
  if (!tc1.isValid() || !tc2.isValid()) return 1;
  
  return tinycolor.readability(tc1, tc2);
}

/**
 * Analyze a color for various properties using tinycolor2 (industry standard)
 */
function analyzeColor(color: string): ColorAnalysis | null {
  const tc = tinycolor(color);
  
  if (!tc.isValid()) {
    return null;
  }
  
  const rgb = tc.toRgb();
  const hsl = tc.toHsl();
  const luminance = tc.getLuminance();
  
  return {
    hex: tc.toHexString(),
    rgb: { r: rgb.r, g: rgb.g, b: rgb.b },
    hsl: { h: hsl.h || 0, s: hsl.s * 100, l: hsl.l * 100 },
    luminance,
    isDark: tc.isDark(),
    isLight: tc.isLight(),
    isValid: true
  };
}

/**
 * Validate theme for accessibility and mode consistency
 */
export function validateTheme(theme: Theme): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
  contrastIssues: Array<{
    foreground: string;
    background: string;
    ratio: number;
    severity: 'error' | 'warning';
  }>;
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  const suggestions: string[] = [];
  const contrastIssues: Array<{
    foreground: string;
    background: string;
    ratio: number;
    severity: 'error' | 'warning';
  }> = [];

  // Get background color
  const bgColor = theme.schema.defaultStyle?.color || '#ffffff';
  const bgAnalysis = analyzeColor(bgColor);
  
  if (!bgAnalysis) {
    errors.push(`Invalid background color: ${bgColor}`);
    return { isValid: false, warnings, errors, suggestions, contrastIssues };
  }

  // Check all text colors against background
  const textColors = new Set<string>();
  
  if (theme.schema.defaultStyle?.color) {
    textColors.add(theme.schema.defaultStyle.color);
  }

  if (theme.schema.matchWords) {
    Object.values(theme.schema.matchWords).forEach(style => {
      if (style.color) textColors.add(style.color);
    });
  }

  if (theme.schema.matchPatterns) {
    theme.schema.matchPatterns.forEach(pattern => {
      if (pattern.options.color) textColors.add(pattern.options.color);
    });
  }

  // Validate contrast ratios
  textColors.forEach(color => {
    const ratio = getContrastRatio(color, bgColor);
    
    if (ratio < 3) {
      contrastIssues.push({
        foreground: color,
        background: bgColor,
        ratio,
        severity: 'error'
      });
      errors.push(`Poor contrast ratio (${ratio.toFixed(2)}) between ${color} and ${bgColor}`);
    } else if (ratio < 4.5) {
      contrastIssues.push({
        foreground: color,
        background: bgColor,
        ratio,
        severity: 'warning'
      });
      warnings.push(`Low contrast ratio (${ratio.toFixed(2)}) between ${color} and ${bgColor}`);
    }
  });

  return {
    isValid: errors.length === 0,
    warnings,
    errors, 
    suggestions,
    contrastIssues
  };
}

/**
 * Detect system color scheme preference (browser/terminal)
 */
export function detectColorScheme(): 'light' | 'dark' | 'auto' {
  // Browser detection
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  }
  
  // Terminal detection (Node.js environment)
  if (typeof process !== 'undefined') {
    // Check environment variables
    const colorTerm = process.env.COLORTERM;
    const term = process.env.TERM;
    
    // Some terminals set specific env vars
    if (process.env.TERM_PROGRAM === 'iTerm.app' || 
        process.env.TERM_PROGRAM === 'Apple_Terminal') {
      // Could check for dark mode via other methods
    }
    
    // Default to dark for most terminals
    if (colorTerm || (term && term.includes('color'))) {
      return 'dark';
    }
  }
  
  return 'auto';
}

/**
 * Auto-adjust colors for better accessibility
 */
export function adjustThemeForAccessibility(theme: Theme, targetContrast: number = 4.5): Theme {
  const adjustedTheme = JSON.parse(JSON.stringify(theme)); // Deep clone
  
  const bgColor = theme.schema.defaultStyle?.color || '#ffffff';
  const bgAnalysis = analyzeColor(bgColor);
  
  if (!bgAnalysis) return theme;

  // Adjust word colors
  if (adjustedTheme.schema.matchWords) {
    Object.entries(adjustedTheme.schema.matchWords).forEach(([word, style]) => {
      if (style && typeof style === 'object' && 'color' in style && typeof style.color === 'string') {
        const ratio = getContrastRatio(style.color, bgColor);
        if (ratio < targetContrast) {
          const analysis = analyzeColor(style.color);
          if (analysis) {
            const adjustment = bgAnalysis.isDark ? 20 : -20;
            const newL = Math.max(0, Math.min(100, analysis.hsl.l + adjustment));
            const newColor = hslToHex(analysis.hsl.h, analysis.hsl.s, newL);
            style.color = newColor;
          }
        }
      }
    });
  }

  return adjustedTheme;
}

/**
 * Advanced accessibility checker with WCAG compliance
 */
export function checkWCAGCompliance(theme: Theme): {
  level: 'AAA' | 'AA' | 'A' | 'FAIL';
  details: {
    normalText: { ratio: number; passes: string[] };
    largeText: { ratio: number; passes: string[] }; 
    graphicalObjects: { ratio: number; passes: string[] };
  };
  recommendations: string[];
} {
  const bgColor = theme.schema.defaultStyle?.color || '#ffffff';
  const textColors = new Set<string>();
  
  // Collect all text colors
  if (theme.schema.matchWords) {
    Object.values(theme.schema.matchWords).forEach(style => {
      if (style.color) textColors.add(style.color);
    });
  }

  const results: {
    level: 'AAA' | 'AA' | 'A' | 'FAIL';
    details: {
      normalText: { ratio: number; passes: string[] };
      largeText: { ratio: number; passes: string[] }; 
      graphicalObjects: { ratio: number; passes: string[] };
    };
    recommendations: string[];
  } = {
    level: 'FAIL',
    details: {
      normalText: { ratio: 0, passes: [] as string[] },
      largeText: { ratio: 0, passes: [] as string[] },
      graphicalObjects: { ratio: 0, passes: [] as string[] }
    },
    recommendations: [] as string[]
  };

  let minRatio = Infinity;
  
  textColors.forEach(color => {
    const ratio = getContrastRatio(color, bgColor);
    minRatio = Math.min(minRatio, ratio);
  });

  results.details.normalText.ratio = minRatio;
  results.details.largeText.ratio = minRatio;
  results.details.graphicalObjects.ratio = minRatio;

  // WCAG standards
  if (minRatio >= 7) { // AAA for normal text
    results.level = 'AAA';
    results.details.normalText.passes = ['AAA', 'AA', 'A'];
    results.details.largeText.passes = ['AAA', 'AA', 'A'];
    results.details.graphicalObjects.passes = ['AAA', 'AA'];
  } else if (minRatio >= 4.5) { // AA for normal text
    results.level = 'AA';
    results.details.normalText.passes = ['AA', 'A'];
    results.details.largeText.passes = ['AAA', 'AA', 'A'];
    results.details.graphicalObjects.passes = ['AA'];
  } else if (minRatio >= 3) { // AA for large text, A for normal
    results.level = 'A';
    results.details.normalText.passes = ['A'];
    results.details.largeText.passes = ['AA', 'A'];
    results.details.graphicalObjects.passes = [];
  }

  // Add recommendations
  if (results.level === 'FAIL') {
    results.recommendations.push('Increase contrast ratios to at least 3:1 for basic accessibility');
  }
  if (results.level !== 'AAA') {
    results.recommendations.push('Consider increasing contrast to 7:1 for AAA compliance');
  }

  return results;
}

/**
 * Real-time theme monitoring for style conflicts
 */
export function createThemeMonitor(theme: Theme) {
  return {
    /**
     * Check if theme works well in current environment
     */
    validateEnvironment(): {
      terminalSupport: boolean;
      browserSupport: boolean;
      issues: string[];
      suggestions: string[];
    } {
      const issues: string[] = [];
      const suggestions: string[] = [];
      
      // Terminal checks
      const hasColorTerm = typeof process !== 'undefined' && 
        Boolean(process.env.COLORTERM || process.env.TERM?.includes('color'));
      
      if (!hasColorTerm) {
        issues.push('Terminal may not support colors properly');
        suggestions.push('Set COLORTERM environment variable or use a color-capable terminal');
      }

      // Browser checks  
      const hasCSSSupport = typeof window !== 'undefined' && 
        Boolean(window.CSS && window.CSS.supports);
      
      if (typeof window !== 'undefined' && !hasCSSSupport) {
        issues.push('Browser may not support modern CSS features');
      }

      return {
        terminalSupport: hasColorTerm,
        browserSupport: hasCSSSupport || typeof window === 'undefined',
        issues,
        suggestions
      };
    },

    /**
     * Monitor for color conflicts during runtime
     */
    detectConflicts(): string[] {
      const conflicts: string[] = [];
      const colors = new Map<string, string[]>();
      
      // Track color usage
      if (theme.schema.matchWords) {
        Object.entries(theme.schema.matchWords).forEach(([word, style]) => {
          if (style.color) {
            if (!colors.has(style.color)) colors.set(style.color, []);
            colors.get(style.color)!.push(word);
          }
        });
      }

      // Find conflicts
      colors.forEach((words, color) => {
        if (words.length > 3) {
          conflicts.push(`Color ${color} is overused (${words.length} elements): ${words.join(', ')}`);
        }
      });

      return conflicts;
    }
  };
}

/**
 * Generate theme report with comprehensive analysis
 */
export function generateThemeReport(theme: Theme): {
  summary: {
    name: string;
    mode: 'light' | 'dark' | 'unknown';
    colorCount: number;
    accessibility: string;
  };
  validation: ReturnType<typeof validateTheme>;
  wcag: ReturnType<typeof checkWCAGCompliance>;
  environmental: ReturnType<ReturnType<typeof createThemeMonitor>['validateEnvironment']>;
  recommendations: string[];
  cssGeneration: {
    bem: string;
    utilities: string;
    tailwind: Record<string, any>;
  };
} {
  const validation = validateTheme(theme);
  const wcag = checkWCAGCompliance(theme);
  const monitor = createThemeMonitor(theme);
  const environmental = monitor.validateEnvironment();
  
  // Determine mode from colors
  const bgAnalysis = analyzeColor(theme.schema.defaultStyle?.color || '#ffffff');
  const mode = bgAnalysis?.isDark ? 'dark' : bgAnalysis?.isLight ? 'light' : 'unknown';
  
  // Count unique colors
  const colors = new Set<string>();
  if (theme.schema.matchWords) {
    Object.values(theme.schema.matchWords).forEach(style => {
      if (style.color) colors.add(style.color);
    });
  }
  
  const recommendations = [
    ...validation.suggestions,
    ...wcag.recommendations,
    ...environmental.suggestions
  ];

  return {
    summary: {
      name: theme.name,
      mode,
      colorCount: colors.size,
      accessibility: wcag.level
    },
    validation,
    wcag,
    environmental,
    recommendations,
    cssGeneration: {
      bem: generateBEMClasses(theme),
      utilities: generateUtilityClasses(theme),
      tailwind: generateTailwindTheme(theme)
    }
  };
}

/**
 * Convert HSL to hex color using tinycolor2
 */
function hslToHex(h: number, s: number, l: number): string {
  return tinycolor({ h, s: s / 100, l: l / 100 }).toHexString();
}
