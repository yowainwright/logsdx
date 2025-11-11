import { z } from "zod";
import type { ThemePreset, StyleOptions, PatternMatch } from "../types";
import { filterStyleCodes } from "../types";

export const colorPaletteSchema = z.object({
  name: z.string(),
  description: z.string(),
  colors: z.object({
    primary: z.string().describe("Main accent color"),
    secondary: z.string().describe("Secondary accent color"),
    success: z.string().describe("Success/OK color"),
    warning: z.string().describe("Warning/attention color"),
    error: z.string().describe("Error/danger color"),
    info: z.string().describe("Information color"),
    muted: z.string().describe("Muted/subtle color"),
    background: z.string().describe("Background color"),
    text: z.string().describe("Primary text color"),
    accent: z.string().optional().describe("Additional accent color"),
  }),
  accessibility: z.object({
    contrastRatio: z.number().min(1).max(21).describe("WCAG contrast ratio"),
    colorBlindSafe: z.boolean().describe("Safe for color blind users"),
    darkMode: z.boolean().describe("Optimized for dark backgrounds"),
  }),
});

export type ColorPalette = z.infer<typeof colorPaletteSchema>;

export const patternPresetSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.enum([
    "api",
    "system",
    "application",
    "security",
    "database",
    "generic",
  ]),
  patterns: z.array(
    z.object({
      name: z.string(),
      pattern: z.string(),
      description: z.string(),
      colorRole: z.enum([
        "primary",
        "secondary",
        "success",
        "warning",
        "error",
        "info",
        "muted",
        "accent",
      ]),
      styleCodes: z.array(z.string()).optional(),
    }),
  ),
  matchWords: z.record(
    z.string(),
    z.object({
      colorRole: z.enum([
        "primary",
        "secondary",
        "success",
        "warning",
        "error",
        "info",
        "muted",
        "accent",
      ]),
      styleCodes: z.array(z.string()).optional(),
    }),
  ),
});

export type PatternPreset = z.infer<typeof patternPresetSchema>;

export const themeGeneratorConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  colorPalette: z.string().describe("Color palette name to use"),
  patternPresets: z
    .array(z.string())
    .describe("Pattern preset names to combine"),
  customPatterns: z
    .array(
      z.object({
        name: z.string(),
        pattern: z.string(),
        colorRole: z.enum([
          "primary",
          "secondary",
          "success",
          "warning",
          "error",
          "info",
          "muted",
          "accent",
        ]),
        styleCodes: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  customWords: z
    .record(
      z.string(),
      z.object({
        colorRole: z.enum([
          "primary",
          "secondary",
          "success",
          "warning",
          "error",
          "info",
          "muted",
          "accent",
        ]),
        styleCodes: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  options: z
    .object({
      whiteSpace: z.enum(["preserve", "trim"]).optional(),
      newLine: z.enum(["preserve", "trim"]).optional(),
    })
    .optional(),
});

export type ThemeGeneratorConfig = z.infer<typeof themeGeneratorConfigSchema>;


export const COLOR_PALETTES: ColorPalette[] = [
  {
    name: "github-light",
    description: "Clean, professional light theme based on GitHub's design",
    colors: {
      primary: "#0969da",
      secondary: "#1f883d",
      success: "#1a7f37",
      warning: "#bf8700",
      error: "#d1242f",
      info: "#0969da",
      muted: "#656d76",
      background: "#ffffff",
      text: "#24292f",
    },
    accessibility: {
      contrastRatio: 7.2,
      colorBlindSafe: true,
      darkMode: false,
    },
  },
  {
    name: "github-dark",
    description: "Professional dark theme based on GitHub's dark mode",
    colors: {
      primary: "#58a6ff",
      secondary: "#56d364",
      success: "#3fb950",
      warning: "#d29922",
      error: "#f85149",
      info: "#79c0ff",
      muted: "#8b949e",
      background: "#0d1117",
      text: "#f0f6fc",
    },
    accessibility: {
      contrastRatio: 8.1,
      colorBlindSafe: true,
      darkMode: true,
    },
  },
  {
    name: "dracula",
    description: "Popular dark theme with purple accents",
    colors: {
      primary: "#bd93f9",
      secondary: "#50fa7b",
      success: "#50fa7b",
      warning: "#f1fa8c",
      error: "#ff5555",
      info: "#8be9fd",
      muted: "#6272a4",
      background: "#282a36",
      text: "#f8f8f2",
      accent: "#ff79c6",
    },
    accessibility: {
      contrastRatio: 6.8,
      colorBlindSafe: false,
      darkMode: true,
    },
  },
  {
    name: "solarized-dark",
    description: "Scientifically designed color scheme for reduced eye strain",
    colors: {
      primary: "#268bd2",
      secondary: "#2aa198",
      success: "#859900",
      warning: "#b58900",
      error: "#dc322f",
      info: "#268bd2",
      muted: "#657b83",
      background: "#002b36",
      text: "#839496",
    },
    accessibility: {
      contrastRatio: 9.2,
      colorBlindSafe: true,
      darkMode: true,
    },
  },
  {
    name: "monokai",
    description: "Vibrant dark theme popular among developers",
    colors: {
      primary: "#66d9ef",
      secondary: "#a6e22e",
      success: "#a6e22e",
      warning: "#fd971f",
      error: "#f92672",
      info: "#66d9ef",
      muted: "#75715e",
      background: "#272822",
      text: "#f8f8f2",
    },
    accessibility: {
      contrastRatio: 5.9,
      colorBlindSafe: false,
      darkMode: true,
    },
  },
  {
    name: "high-contrast",
    description: "Maximum contrast for accessibility",
    colors: {
      primary: "#0000ff",
      secondary: "#008000",
      success: "#00ff00",
      warning: "#ffff00",
      error: "#ff0000",
      info: "#00ffff",
      muted: "#808080",
      background: "#000000",
      text: "#ffffff",
    },
    accessibility: {
      contrastRatio: 21.0,
      colorBlindSafe: true,
      darkMode: true,
    },
  },
];


export const PATTERN_PRESETS: PatternPreset[] = [
  {
    name: "http-api",
    description: "HTTP API request/response patterns",
    category: "api",
    patterns: [
      {
        name: "http-status-success",
        pattern: "\\b(200|201|202|204)\\b",
        description: "HTTP success status codes",
        colorRole: "success",
        styleCodes: ["bold"],
      },
      {
        name: "http-status-redirect",
        pattern: "\\b(301|302|304|307|308)\\b",
        description: "HTTP redirect status codes",
        colorRole: "info",
        styleCodes: ["bold"],
      },
      {
        name: "http-status-client-error",
        pattern: "\\b(400|401|403|404|409|422|429)\\b",
        description: "HTTP client error status codes",
        colorRole: "warning",
        styleCodes: ["bold"],
      },
      {
        name: "http-status-server-error",
        pattern: "\\b(500|502|503|504)\\b",
        description: "HTTP server error status codes",
        colorRole: "error",
        styleCodes: ["bold"],
      },
      {
        name: "url-path",
        pattern: "/[a-zA-Z0-9/_.-]*",
        description: "URL paths",
        colorRole: "primary",
        styleCodes: ["italic"],
      },
      {
        name: "ip-address",
        pattern: "\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b",
        description: "IPv4 addresses",
        colorRole: "secondary",
      },
      {
        name: "response-time",
        pattern: "\\b\\d+ms\\b",
        description: "Response time in milliseconds",
        colorRole: "muted",
      },
      {
        name: "user-agent",
        pattern: '"[^"]*Mozilla[^"]*"',
        description: "User agent strings",
        colorRole: "muted",
        styleCodes: ["dim"],
      },
    ],
    matchWords: {
      GET: { colorRole: "primary" },
      POST: { colorRole: "secondary" },
      PUT: { colorRole: "warning" },
      DELETE: { colorRole: "error", styleCodes: ["bold"] },
      PATCH: { colorRole: "info" },
      HEAD: { colorRole: "muted" },
      OPTIONS: { colorRole: "muted" },
    },
  },
  {
    name: "log-levels",
    description: "Standard log level patterns",
    category: "generic",
    patterns: [
      {
        name: "timestamp-iso",
        pattern:
          "\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?(?:Z|[+-]\\d{2}:\\d{2})?",
        description: "ISO timestamp format",
        colorRole: "muted",
        styleCodes: ["dim"],
      },
      {
        name: "thread-id",
        pattern: "\\[\\w+(-\\d+)?\\]",
        description: "Thread or process IDs in brackets",
        colorRole: "muted",
        styleCodes: ["dim"],
      },
      {
        name: "class-name",
        pattern: "\\b[A-Z][a-zA-Z0-9]*(?:\\.[A-Z][a-zA-Z0-9]*)+",
        description: "Java/C# class names",
        colorRole: "info",
      },
    ],
    matchWords: {
      TRACE: { colorRole: "muted", styleCodes: ["dim"] },
      DEBUG: { colorRole: "muted" },
      INFO: { colorRole: "primary" },
      WARN: { colorRole: "warning", styleCodes: ["bold"] },
      WARNING: { colorRole: "warning", styleCodes: ["bold"] },
      ERROR: { colorRole: "error", styleCodes: ["bold"] },
      FATAL: { colorRole: "error", styleCodes: ["bold", "underline"] },
      CRITICAL: { colorRole: "error", styleCodes: ["bold", "underline"] },
    },
  },
  {
    name: "system-logs",
    description: "System and infrastructure log patterns",
    category: "system",
    patterns: [
      {
        name: "memory-usage",
        pattern: "\\b\\d+(?:\\.\\d+)?\\s*(?:B|KB|MB|GB|TB)\\b",
        description: "Memory/disk usage",
        colorRole: "info",
      },
      {
        name: "percentage",
        pattern: "\\b\\d+(?:\\.\\d+)?%",
        description: "Percentage values",
        colorRole: "info",
      },
      {
        name: "duration",
        pattern: "\\b\\d+(?:\\.\\d+)?(?:ns|μs|ms|s|m|h)\\b",
        description: "Duration measurements",
        colorRole: "muted",
      },
      {
        name: "process-id",
        pattern: "\\bpid[:\\s]*(\\d+)",
        description: "Process IDs",
        colorRole: "secondary",
      },
    ],
    matchWords: {
      STARTED: { colorRole: "success" },
      STOPPED: { colorRole: "warning" },
      FAILED: { colorRole: "error", styleCodes: ["bold"] },
      CRASHED: { colorRole: "error", styleCodes: ["bold", "underline"] },
      TIMEOUT: { colorRole: "warning", styleCodes: ["bold"] },
      CONNECTED: { colorRole: "success" },
      DISCONNECTED: { colorRole: "warning" },
    },
  },
  {
    name: "security-logs",
    description: "Security and authentication patterns",
    category: "security",
    patterns: [
      {
        name: "user-id",
        pattern: "user[:\\s]*[a-zA-Z0-9._-]+",
        description: "User identifiers",
        colorRole: "primary",
        styleCodes: ["bold"],
      },
      {
        name: "session-id",
        pattern: "session[:\\s]*[a-fA-F0-9-]{20,}",
        description: "Session tokens",
        colorRole: "muted",
        styleCodes: ["dim"],
      },
      {
        name: "token",
        pattern: "\\b[A-Za-z0-9_-]{20,}\\b",
        description: "Authentication tokens",
        colorRole: "muted",
        styleCodes: ["dim"],
      },
    ],
    matchWords: {
      LOGIN: { colorRole: "primary" },
      LOGOUT: { colorRole: "info" },
      AUTHENTICATED: { colorRole: "success", styleCodes: ["bold"] },
      UNAUTHORIZED: { colorRole: "error", styleCodes: ["bold"] },
      FORBIDDEN: { colorRole: "error", styleCodes: ["bold"] },
      BLOCKED: { colorRole: "error", styleCodes: ["bold"] },
      GRANTED: { colorRole: "success" },
      DENIED: { colorRole: "warning", styleCodes: ["bold"] },
    },
  },
  {
    name: "database-logs",
    description: "Database operation patterns",
    category: "database",
    patterns: [
      {
        name: "query-time",
        pattern: "\\b\\d+(?:\\.\\d+)?\\s*ms\\b",
        description: "Query execution time",
        colorRole: "muted",
      },
      {
        name: "table-name",
        pattern:
          "\\b(?:SELECT|INSERT|UPDATE|DELETE)\\s+(?:FROM|INTO)?\\s*([a-zA-Z_][a-zA-Z0-9_]*)",
        description: "Database table names",
        colorRole: "primary",
        styleCodes: ["italic"],
      },
      {
        name: "transaction-id",
        pattern: "\\btxn[:\\s]*[a-fA-F0-9]+",
        description: "Transaction IDs",
        colorRole: "info",
      },
    ],
    matchWords: {
      SELECT: { colorRole: "primary" },
      INSERT: { colorRole: "success" },
      UPDATE: { colorRole: "warning" },
      DELETE: { colorRole: "error", styleCodes: ["bold"] },
      COMMIT: { colorRole: "success" },
      ROLLBACK: { colorRole: "error" },
      DEADLOCK: { colorRole: "error", styleCodes: ["bold"] },
      TIMEOUT: { colorRole: "warning", styleCodes: ["bold"] },
    },
  },
];

export function getColorPalette(name: string): ColorPalette | undefined {
  return COLOR_PALETTES.find((palette) => palette.name === name);
}

export function getPatternPreset(name: string): PatternPreset | undefined {
  return PATTERN_PRESETS.find((preset) => preset.name === name);
}

export function listColorPalettes(): ColorPalette[] {
  return [...COLOR_PALETTES];
}

export function listPatternPresets(
  category?: PatternPreset["category"],
): PatternPreset[] {
  if (category) {
    return PATTERN_PRESETS.filter((preset) => preset.category === category);
  }
  return [...PATTERN_PRESETS];
}

export function generateTemplate(config: ThemeGeneratorConfig): ThemePreset {
  const palette = getColorPalette(config.colorPalette);
  if (!palette) {
    throw new Error(`Color palette '${config.colorPalette}' not found`);
  }

  const patternPresets = config.patternPresets.map((name) => {
    const preset = getPatternPreset(name);
    if (!preset) {
      throw new Error(`Pattern preset '${name}' not found`);
    }
    return preset;
  });

  const matchWords: Record<string, StyleOptions> = {};
  const matchPatterns: PatternMatch[] = [];

  for (const preset of patternPresets) {
    for (const [word, config] of Object.entries(preset.matchWords)) {
      matchWords[word] = {
        color: palette.colors[config.colorRole] || palette.colors.text,
        styleCodes: filterStyleCodes(config.styleCodes),
      };
    }

    for (const pattern of preset.patterns) {
      matchPatterns.push({
        name: pattern.name,
        pattern: pattern.pattern,
        options: {
          color: palette.colors[pattern.colorRole] || palette.colors.text,
          styleCodes: filterStyleCodes(pattern.styleCodes),
        },
      });
    }
  }

  if (config.customWords) {
    for (const [word, wordConfig] of Object.entries(config.customWords)) {
      matchWords[word] = {
        color: palette.colors[wordConfig.colorRole] || palette.colors.text,
        styleCodes: filterStyleCodes(wordConfig.styleCodes),
      };
    }
  }

  if (config.customPatterns) {
    for (const pattern of config.customPatterns) {
      matchPatterns.push({
        name: pattern.name,
        pattern: pattern.pattern,
        options: {
          color: palette.colors[pattern.colorRole] || palette.colors.text,
          styleCodes: filterStyleCodes(pattern.styleCodes),
        },
      });
    }
  }

  return {
    name: config.name,
    description: config.description,
    schema: {
      defaultStyle: {
        color: palette.colors.text,
      },
      matchWords,
      matchPatterns,
      whiteSpace: config.options?.whiteSpace || "preserve",
      newLine: config.options?.newLine || "preserve",
    },
  };
}
