import { hex } from "wcag-contrast";
import type { Theme, SchemaConfig, StyleOptions, PatternMatch } from "../types";
import { filterStyleCodes } from "../types";
import {
  getAccessibleTextColors,
  getWCAGLevel,
  getWCAGRecommendations,
} from "./utils";
import { DEFAULT_COLORS } from "./constants";

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
    pattern: string | RegExp;
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
      TRACE: { color: "muted" },
      FATAL: { color: "error", styleCodes: ["bold"] },
      CRITICAL: { color: "error", styleCodes: ["bold"] },
    },
    patterns: [
      {
        name: "log-level-brackets",
        pattern: /\[(ERROR|WARN|WARNING|INFO|DEBUG|SUCCESS|TRACE|FATAL|CRITICAL)\]/gi,
        options: { color: "primary" },
      },
      {
        name: "log-level-error-bracket",
        pattern: /\[ERROR\]/gi,
        options: { color: "error", styleCodes: ["bold"] },
      },
      {
        name: "log-level-warn-bracket",
        pattern: /\[WARN(?:ING)?\]/gi,
        options: { color: "warning", styleCodes: ["bold"] },
      },
      {
        name: "log-level-info-bracket",
        pattern: /\[INFO\]/gi,
        options: { color: "info", styleCodes: ["bold"] },
      },
      {
        name: "log-level-success-bracket",
        pattern: /\[SUCCESS\]/gi,
        options: { color: "success", styleCodes: ["bold"] },
      },
      {
        name: "log-level-debug-bracket",
        pattern: /\[DEBUG\]/gi,
        options: { color: "debug" },
      },
    ],
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
        name: "double-quoted-string",
        pattern: /"([^"]*)"/g,
        options: { color: "secondary" },
      },
      {
        name: "single-quoted-string",
        pattern: /'([^']*)'/g,
        options: { color: "secondary" },
      },
    ],
  },

  numbers: {
    name: "Numbers",
    patterns: [
      {
        name: "decimal-number",
        pattern: /\b\d+\.\d+\b/g,
        options: { color: "accent" },
      },
      {
        name: "integer",
        pattern: /\b\d+\b/g,
        options: { color: "accent" },
      },
    ],
  },

  dates: {
    name: "Dates and Times",
    patterns: [
      {
        name: "bracketed-timestamp",
        pattern: /\[\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[^\]]*\]/g,
        options: { color: "info" },
      },
      {
        name: "iso-date",
        pattern: /\d{4}-\d{2}-\d{2}/g,
        options: { color: "info" },
      },
      {
        name: "time",
        pattern: /\d{2}:\d{2}:\d{2}/g,
        options: { color: "info" },
      },
    ],
  },

  timestamps: {
    name: "Timestamps",
    patterns: [
      {
        name: "iso8601-timestamp",
        pattern: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?/g,
        options: { color: "info" },
      },
    ],
  },

  urls: {
    name: "URLs",
    patterns: [
      {
        name: "http-url",
        pattern: /https?:\/\/[^\s]+/g,
        options: { color: "accent", styleCodes: ["underline"] },
      },
    ],
  },

  paths: {
    name: "File Paths",
    patterns: [
      {
        name: "unix-path",
        pattern: /\/[\w\-\.\/]+/g,
        options: { color: "muted" },
      },
      {
        name: "windows-path",
        pattern: /[A-Z]:\\[\w\-\.\\]+/g,
        options: { color: "muted" },
      },
    ],
  },

  json: {
    name: "JSON Keys",
    patterns: [
      {
        name: "json-key",
        pattern: /"(\w+)":/g,
        options: { color: "accent" },
      },
      {
        name: "json-key-unquoted",
        pattern: /\b(\w+):/g,
        options: { color: "accent" },
      },
    ],
  },

  semantic: {
    name: "Semantic Versions",
    patterns: [
      {
        name: "semantic-version",
        pattern: /\bv?\d+\.\d+\.\d+\b/g,
        options: { color: "primary", styleCodes: ["bold"] },
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
  palette: ColorPalette,
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
      color: resolveColor(
        config.defaultTextColor || config.colors.text || "white",
        config.colors,
      ),
    },
    matchWords: {},
    matchPatterns: [],
    whiteSpace: config.whiteSpace || "preserve",
    newLine: config.newLine || "preserve",
  };

  // Add preset patterns and words
  const presets = config.presets || [
    "logLevels",
    "booleans",
    "brackets",
    "strings",
    "numbers",
    "dates",
  ];

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
          styleCodes: filterStyleCodes(pattern.style),
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
    colors: config.colors,
  };
}

/**
 * Create a theme with sensible defaults and a simple color palette
 */
export function createSimpleTheme(
  name: string,
  colors: ColorPalette,
  options: Partial<SimpleThemeConfig> = {},
): Theme {
  return createTheme({
    name,
    colors,
    ...options,
  });
}

/**
 * Extend an existing theme with modifications
 */
export function extendTheme(
  baseTheme: Theme,
  modifications: Partial<SimpleThemeConfig>,
): Theme {
  const config: SimpleThemeConfig = {
    name: modifications.name || `${baseTheme.name}-extended`,
    description:
      modifications.description || `Extended version of ${baseTheme.name}`,
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
      ...basePatterns.map((p) => ({
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

 * Check WCAG compliance for a theme
 */
export function checkWCAGCompliance(theme: Theme): {
  level: "AAA" | "AA" | "A" | "FAIL";
  recommendations: string[];
  details: {
    normalText: { ratio: number };
  };
} {
  const bgColor = theme.colors?.background || DEFAULT_COLORS.DARK_BACKGROUND;
  const textColor = theme.colors?.text || DEFAULT_COLORS.LIGHT_TEXT;

  const ratio = hex(textColor, bgColor);

  const level = getWCAGLevel(ratio, false);
  const recommendations = getWCAGRecommendations(ratio);

  return {
    level,
    recommendations,
    details: {
      normalText: { ratio },
    },
  };
}

/**
 * Adjust theme for accessibility by improving contrast ratios
 */
export function adjustThemeForAccessibility(
  theme: Theme,
  targetContrast: number = 4.5,
): Theme {
  const bgColor = theme.colors?.background || DEFAULT_COLORS.DARK_BACKGROUND;
  const textColor = theme.colors?.text || DEFAULT_COLORS.LIGHT_TEXT;

  const currentRatio = hex(textColor, bgColor);

  if (currentRatio >= targetContrast) {
    return theme;
  }

  const adjustedTheme = JSON.parse(JSON.stringify(theme)) as Theme;

  if (!adjustedTheme.colors) {
    adjustedTheme.colors = {};
  }

  const targetLevel = targetContrast >= 7 ? "AAA" : "AA";
  const accessibleColors = getAccessibleTextColors(bgColor, targetLevel);

  adjustedTheme.colors = {
    ...adjustedTheme.colors,
    ...accessibleColors,
  };

  return adjustedTheme;
} /**
 * 
Fluent theme builder class (stub implementation)
 */
export class ThemeBuilder {
  private config: Partial<SimpleThemeConfig> = {};

  constructor(name: string) {
    this.config.name = name;
  }

  colors(palette: ColorPalette): ThemeBuilder {
    this.config.colors = palette;
    return this;
  }

  mode(mode: "light" | "dark" | "auto"): ThemeBuilder {
    this.config.mode = mode;
    return this;
  }

  build(): Theme {
    if (!this.config.name || !this.config.colors) {
      const missing = [];
      if (!this.config.name) missing.push("name");
      if (!this.config.colors) missing.push("colors");
      throw new Error(
        `Theme validation failed: Missing required fields: ${missing.join(", ")}. ` +
          `Please provide a theme name and color configuration.`,
      );
    }
    return createTheme(this.config as SimpleThemeConfig);
  }

  static create(name: string): ThemeBuilder {
    return new ThemeBuilder(name);
  }
}
