import type { Theme, SchemaConfig, StyleOptions, PatternMatch } from "@/src/types";

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
          styleCodes: pattern.style || [],
        },
      };
      schema.matchPatterns!.push(normalizedPattern);
    }
  }

  return {
    name: config.name,
    description: config.description,
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