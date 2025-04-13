import chalk, { type ChalkInstance } from "chalk";
import JSON5 from "json5";
import type { LogLevel } from "@/src/types";
import { loadConfig } from "./loader";

// Force chalk to use colors (level 3) for consistent testing
chalk.level = 3;

// Theme configuration type
export interface ThemeConfig {
  name: string;
  levels: {
    [key in LogLevel]?: {
      color: string;
      bold?: boolean;
      dim?: boolean;
      italic?: boolean;
    };
  };
  fields: {
    [key: string]: {
      color: string;
      bold?: boolean;
      dim?: boolean;
      italic?: boolean;
    };
  };
  status: {
    [key: string]: {
      color: string;
      bold?: boolean;
      dim?: boolean;
      italic?: boolean;
    };
  };
  patterns: {
    [key: string]: {
      regex: string | RegExp;
      color: string;
      bold?: boolean;
      dim?: boolean;
      italic?: boolean;
    };
  };
  elements: {
    brackets: {
      color: string;
      bold?: boolean;
      dim?: boolean;
      italic?: boolean;
    };
    keyValue: {
      key: {
        color: string;
        bold?: boolean;
        dim?: boolean;
        italic?: boolean;
      };
      separator: {
        color: string;
        bold?: boolean;
        dim?: boolean;
        italic?: boolean;
      };
      value: {
        color: string;
        bold?: boolean;
        dim?: boolean;
        italic?: boolean;
      };
    };
  };
}

// Built-in themes
export const THEMES = {
  default: {
    name: "default",
    levels: {
      error: { color: "red", bold: true },
      warn: { color: "yellow" },
      info: { color: "blue" },
      debug: { color: "gray", dim: true },
      success: { color: "green" },
      trace: { color: "white", dim: true },
    },
    fields: {
      timestamp: { color: "gray" },
      service: { color: "cyan" },
      action: { color: "magenta" },
      user: { color: "blue" },
      duration: { color: "yellow" },
      requestId: { color: "gray" },
      correlationId: { color: "gray" },
      environment: { color: "green" },
      version: { color: "magenta" },
      method: { color: "cyan" },
      path: { color: "white" },
      statusCode: { color: "yellow" },
      ip: { color: "gray" },
      userAgent: { color: "gray", dim: true },
    },
    status: {
      success: { color: "green" },
      failure: { color: "red" },
      error: { color: "red" },
      pending: { color: "yellow" },
      cancelled: { color: "gray" },
      timeout: { color: "red" },
    },
    patterns: {
      error: {
        regex: /\b(error|exception|failed|failure)\b/i,
        color: "red",
        bold: true,
      },
      warning: { regex: /\b(warning|warn|caution)\b/i, color: "yellow" },
      success: { regex: /\b(success|succeeded|completed)\b/i, color: "green" },
      http: {
        regex: /\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/,
        color: "cyan",
      },
      url: { regex: /https?:\/\/[^\s]+/, color: "blue", italic: true },
      ip: { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, color: "gray" },
      email: { regex: /\b[\w\.-]+@[\w\.-]+\.\w+\b/, color: "blue" },
      uuid: {
        regex:
          /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
        color: "magenta",
      },
      timestamp: {
        regex:
          /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?\b/,
        color: "gray",
      },
      json: { regex: /\{.*\}|\[.*\]/, color: "white" },
    },
    elements: {
      brackets: { color: "yellow" },
      keyValue: {
        key: { color: "cyan" },
        separator: { color: "gray" },
        value: { color: "white" },
      },
    },
  },
  dark: {
    name: "dark",
    levels: {
      error: { color: "#ff5555", bold: true },
      warn: { color: "#ffb86c" },
      info: { color: "#8be9fd" },
      debug: { color: "#6272a4", dim: true },
      success: { color: "#50fa7b" },
      trace: { color: "#f8f8f2", dim: true },
    },
    fields: {
      timestamp: { color: "#6272a4" },
      service: { color: "#8be9fd" },
      action: { color: "#bd93f9" },
      user: { color: "#8be9fd" },
      duration: { color: "#ffb86c" },
      requestId: { color: "#6272a4" },
      correlationId: { color: "#6272a4" },
      environment: { color: "#50fa7b" },
      version: { color: "#bd93f9" },
      method: { color: "#8be9fd" },
      path: { color: "#f8f8f2" },
      statusCode: { color: "#ffb86c" },
      ip: { color: "#6272a4" },
      userAgent: { color: "#6272a4", dim: true },
    },
    status: {
      success: { color: "#50fa7b" },
      failure: { color: "#ff5555" },
      error: { color: "#ff5555" },
      pending: { color: "#ffb86c" },
      cancelled: { color: "#6272a4" },
      timeout: { color: "#ff5555" },
    },
    patterns: {
      error: {
        regex: /\b(error|exception|failed|failure)\b/i,
        color: "#ff5555",
        bold: true,
      },
      warning: { regex: /\b(warning|warn|caution)\b/i, color: "#ffb86c" },
      success: {
        regex: /\b(success|succeeded|completed)\b/i,
        color: "#50fa7b",
      },
      http: {
        regex: /\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/,
        color: "#8be9fd",
      },
      url: { regex: /https?:\/\/[^\s]+/, color: "#8be9fd", italic: true },
      ip: { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, color: "#6272a4" },
      email: { regex: /\b[\w\.-]+@[\w\.-]+\.\w+\b/, color: "#8be9fd" },
      uuid: {
        regex:
          /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
        color: "#bd93f9",
      },
      timestamp: {
        regex:
          /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?\b/,
        color: "#6272a4",
      },
      json: { regex: /\{.*\}|\[.*\]/, color: "#f8f8f2" },
    },
    elements: {
      brackets: { color: "#6272a4" },
      keyValue: {
        key: { color: "#8be9fd" },
        separator: { color: "#6272a4" },
        value: { color: "#f8f8f2" },
      },
    },
  },
  light: {
    name: "light",
    levels: {
      error: { color: "#d32f2f", bold: true },
      warn: { color: "#f57c00" },
      info: { color: "#1976d2" },
      debug: { color: "#757575", dim: true },
      success: { color: "#388e3c" },
      trace: { color: "#212121", dim: true },
    },
    fields: {
      timestamp: { color: "#757575" },
      service: { color: "#0097a7" },
      action: { color: "#7b1fa2" },
      user: { color: "#1976d2" },
      duration: { color: "#f57c00" },
      requestId: { color: "#757575" },
      correlationId: { color: "#757575" },
      environment: { color: "#388e3c" },
      version: { color: "#7b1fa2" },
      method: { color: "#0097a7" },
      path: { color: "#212121" },
      statusCode: { color: "#f57c00" },
      ip: { color: "#757575" },
      userAgent: { color: "#757575", dim: true },
    },
    status: {
      success: { color: "#388e3c" },
      failure: { color: "#d32f2f" },
      error: { color: "#d32f2f" },
      pending: { color: "#f57c00" },
      cancelled: { color: "#757575" },
      timeout: { color: "#d32f2f" },
    },
    patterns: {
      error: {
        regex: /\b(error|exception|failed|failure)\b/i,
        color: "#d32f2f",
        bold: true,
      },
      warning: { regex: /\b(warning|warn|caution)\b/i, color: "#f57c00" },
      success: {
        regex: /\b(success|succeeded|completed)\b/i,
        color: "#388e3c",
      },
      http: {
        regex: /\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/,
        color: "#0097a7",
      },
      url: { regex: /https?:\/\/[^\s]+/, color: "#1976d2", italic: true },
      ip: { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, color: "#757575" },
      email: { regex: /\b[\w\.-]+@[\w\.-]+\.\w+\b/, color: "#1976d2" },
      uuid: {
        regex:
          /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
        color: "#7b1fa2",
      },
      timestamp: {
        regex:
          /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?\b/,
        color: "#757575",
      },
      json: { regex: /\{.*\}|\[.*\]/, color: "#212121" },
    },
    elements: {
      brackets: { color: "#757575" },
      keyValue: {
        key: { color: "#0097a7" },
        separator: { color: "#757575" },
        value: { color: "#212121" },
      },
    },
  },
  minimal: {
    name: "minimal",
    levels: {
      error: { color: "red" },
      warn: { color: "yellow" },
      info: { color: "white" },
      debug: { color: "gray", dim: true },
      success: { color: "green" },
      trace: { color: "gray", dim: true },
    },
    fields: {
      timestamp: { color: "gray" },
      service: { color: "white" },
      action: { color: "white" },
      user: { color: "white" },
      duration: { color: "white" },
      requestId: { color: "gray" },
      correlationId: { color: "gray" },
      environment: { color: "white" },
      version: { color: "white" },
      method: { color: "white" },
      path: { color: "white" },
      statusCode: { color: "white" },
      ip: { color: "gray" },
      userAgent: { color: "gray", dim: true },
    },
    status: {
      success: { color: "green" },
      failure: { color: "red" },
      error: { color: "red" },
      pending: { color: "yellow" },
      cancelled: { color: "gray" },
      timeout: { color: "red" },
    },
    patterns: {
      error: { regex: /\b(error|exception|failed|failure)\b/i, color: "red" },
      warning: { regex: /\b(warning|warn|caution)\b/i, color: "yellow" },
      success: { regex: /\b(success|succeeded|completed)\b/i, color: "green" },
      http: {
        regex: /\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/,
        color: "white",
      },
      url: { regex: /https?:\/\/[^\s]+/, color: "white" },
      ip: { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, color: "gray" },
      email: { regex: /\b[\w\.-]+@[\w\.-]+\.\w+\b/, color: "white" },
      uuid: {
        regex:
          /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
        color: "white",
      },
      timestamp: {
        regex:
          /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?\b/,
        color: "gray",
      },
      json: { regex: /\{.*\}|\[.*\]/, color: "white" },
    },
    elements: {
      brackets: { color: "gray" },
      keyValue: {
        key: { color: "white" },
        separator: { color: "gray" },
        value: { color: "white" },
      },
    },
  },
  dracula: {
    name: "dracula",
    levels: {
      error: { color: "#ff5555", bold: true }, // Red
      warn: { color: "#f1fa8c" },        // Yellow
      info: { color: "#8be9fd" },        // Cyan
      debug: { color: "#6272a4", dim: true }, // Comment Purple
      success: { color: "#50fa7b" },      // Green
      trace: { color: "#f8f8f2", dim: true }, // Foreground
    },
    fields: { 
      timestamp: { color: "#6272a4" },
      service: { color: "#ff79c6" },      // Pink
      action: { color: "#bd93f9" },      // Purple
      user: { color: "#8be9fd" },        // Cyan (Placeholder - adjust if needed)
      duration: { color: "#f1fa8c" },      // Yellow
      requestId: { color: "#6272a4" },
      correlationId: { color: "#6272a4" },
      environment: { color: "#50fa7b" },      // Green
      version: { color: "#bd93f9" },      // Purple
      method: { color: "#8be9fd" },        // Cyan
      path: { color: "#f8f8f2" },        // Foreground
      statusCode: { color: "#ffb86c" },      // Orange
      ip: { color: "#6272a4" },
      userAgent: { color: "#6272a4", dim: true },
    },
    status: { 
      success: { color: "#50fa7b" },
      failure: { color: "#ff5555" },
      error: { color: "#ff5555" },
      pending: { color: "#f1fa8c" },
      cancelled: { color: "#6272a4" },
      timeout: { color: "#ff5555" },
    },
    patterns: { // Colors adjusted to match Dracula
      error: { regex: /\b(error|exception|failed|failure)\b/i, color: "#ff5555", bold: true },
      warning: { regex: /\b(warning|warn|caution)\b/i, color: "#f1fa8c" },
      success: { regex: /\b(success|succeeded|completed)\b/i, color: "#50fa7b" },
      http: { regex: /\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/, color: "#8be9fd" },
      url: { regex: /https?:\/\/[^\s]+/, color: "#8be9fd", italic: true },
      ip: { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, color: "#6272a4" },
      email: { regex: /\b[\w\.-]+@[\w\.-]+\.\w+\b/, color: "#8be9fd" },
      uuid: { regex: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i, color: "#bd93f9" },
      timestamp: { regex: /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?\b/, color: "#6272a4" },
      json: { regex: /\{.*\}|\[.*\]/, color: "#f8f8f2" },
    },
    elements: {
      brackets: { color: "#f8f8f2" },      // Foreground for {}, [], "
      keyValue: {
        key: { color: "#8be9fd" },      // Cyan for keys
        separator: { color: "#ff79c6" }, // Pink for :
        value: { color: "#f8f8f2" },     // Foreground for values
      },
    },
  },

  githubLight: {
    name: "githubLight",
    levels: {
      error: { color: "#d73a49", bold: true }, // Red-600
      warn: { color: "#b08800" },       // Yellow-700 
      info: { color: "#0366d6" },       // Blue-600
      debug: { color: "#586069", dim: true }, // Gray-600
      success: { color: "#22863a" },      // Green-600
      trace: { color: "#24292e", dim: true }, // Gray-900 (Default Text)
    },
    fields: { 
      timestamp: { color: "#586069" },
      service: { color: "#6f42c1" },      // Purple-600
      action: { color: "#005cc5" },       // Blue-700
      user: { color: "#0366d6" },        // Blue-600
      duration: { color: "#e36209" },     // Orange-600
      requestId: { color: "#586069" },
      correlationId: { color: "#586069" },
      environment: { color: "#22863a" },      // Green-600
      version: { color: "#6f42c1" },      // Purple-600
      method: { color: "#005cc5" },       // Blue-700
      path: { color: "#24292e" },        // Gray-900
      statusCode: { color: "#b08800" },     // Yellow-700
      ip: { color: "#586069" },
      userAgent: { color: "#586069", dim: true },
    },
    status: { 
      success: { color: "#22863a" },
      failure: { color: "#d73a49" },
      error: { color: "#d73a49" },
      pending: { color: "#b08800" },
      cancelled: { color: "#586069" },
      timeout: { color: "#d73a49" },
    },
    patterns: {
      error: { regex: /\b(error|exception|failed|failure)\b/i, color: "#d73a49", bold: true },
      warning: { regex: /\b(warning|warn|caution)\b/i, color: "#b08800" },
      success: { regex: /\b(success|succeeded|completed)\b/i, color: "#22863a" },
      http: { regex: /\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/, color: "#005cc5" },
      url: { regex: /https?:\/\/[^\s]+/, color: "#0366d6", italic: true },
      ip: { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, color: "#586069" },
      email: { regex: /\b[\w\.-]+@[\w\.-]+\.\w+\b/, color: "#0366d6" },
      uuid: { regex: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i, color: "#6f42c1" },
      timestamp: { regex: /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?\b/, color: "#586069" },
      json: { regex: /\{.*\}|\[.*\]/, color: "#24292e" },
    },
    elements: {
      brackets: { color: "#586069" },
      keyValue: {
        key: { color: "#005cc5" },
        separator: { color: "#586069" },
        value: { color: "#24292e" },
      },
    },
  },
  githubDark: {
    name: "githubDark",
    levels: {
      error: { color: "#f97583", bold: true },
      warn: { color: "#dbab09" },
      info: { color: "#79b8ff" },
      debug: { color: "#6a737d", dim: true },
      success: { color: "#85e89d" },
      trace: { color: "#d1d5da", dim: true },
    },
    fields: {
      timestamp: { color: "#6a737d" },
      service: { color: "#b392f0" },
      action: { color: "#58a6ff" },
      user: { color: "#79b8ff" },
      duration: { color: "#ffab70" },
      requestId: { color: "#6a737d" },
      correlationId: { color: "#6a737d" },
      environment: { color: "#85e89d" },
      version: { color: "#b392f0" },
      method: { color: "#58a6ff" },
      path: { color: "#d1d5da" },
      statusCode: { color: "#dbab09" },
      ip: { color: "#6a737d" },
      userAgent: { color: "#6a737d", dim: true },
    },
    status: {
      success: { color: "#85e89d" },
      failure: { color: "#f97583" },
      error: { color: "#f97583" },
      pending: { color: "#dbab09" },
      cancelled: { color: "#6a737d" },
      timeout: { color: "#f97583" },
    },
    patterns: {
      error: { regex: /\b(error|exception|failed|failure)\b/i, color: "#f97583", bold: true },
      warning: { regex: /\b(warning|warn|caution)\b/i, color: "#dbab09" },
      success: { regex: /\b(success|succeeded|completed)\b/i, color: "#85e89d" },
      http: { regex: /\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/, color: "#58a6ff" },
      url: { regex: /https?:\/\/[^\s]+/, color: "#79b8ff", italic: true },
      ip: { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, color: "#6a737d" },
      email: { regex: /\b[\w\.-]+@[\w\.-]+\.\w+\b/, color: "#79b8ff" },
      uuid: { regex: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i, color: "#b392f0" },
      timestamp: { regex: /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?\b/, color: "#6a737d" },
      json: { regex: /\{.*\}|\[.*\]/, color: "#d1d5da" },
    },
    elements: {
      brackets: { color: "#6a737d" },
      keyValue: {
        key: { color: "#79b8ff" },
        separator: { color: "#6a737d" },
        value: { color: "#d1d5da" },
      },
    },
  },
} as const;

// Create a chalk style from theme config
function createStyle(
  config:
    | ThemeConfig["levels"][LogLevel]
    | ThemeConfig["fields"][string]
    | ThemeConfig["status"][string]
    | ThemeConfig["patterns"][string]
    | ThemeConfig["elements"]["brackets"]
    | ThemeConfig["elements"]["keyValue"]["key"]
    | ThemeConfig["elements"]["keyValue"]["separator"]
    | ThemeConfig["elements"]["keyValue"]["value"],
): ChalkInstance {
  if (!config) return chalk.white;

  const color = config.color;
  let style: ChalkInstance;

  // Handle hex colors
  if (color.startsWith("#")) {
    style = chalk.hex(color);
  } else {
    // Handle chalk colors
    style =
      (chalk[color as keyof typeof chalk] as ChalkInstance) || chalk.white;
  }

  if (config.bold) style = style.bold;
  if (config.dim) style = style.dim;
  if (config.italic) style = style.italic;
  return style;
}

// Style manager class for handling themes and caching
export class StyleManager {
  private static instance: StyleManager;
  public currentTheme: ThemeConfig;
  private styleCache: Map<string, ChalkInstance>;
  private patternCache: Map<string, { regex: RegExp; style: ChalkInstance }>;

  private constructor() {
    this.currentTheme = THEMES.default;
    this.styleCache = new Map();
    this.patternCache = new Map();
    this.initializeCache();
  }

  public static getInstance(): StyleManager {
    if (!StyleManager.instance) {
      StyleManager.instance = new StyleManager();
    }
    return StyleManager.instance;
  }

  private initializeCache(): void {
    // Cache level styles
    Object.entries(this.currentTheme.levels).forEach(([level, config]) => {
      this.styleCache.set(`level:${level}`, createStyle(config));
    });

    // Cache field styles
    Object.entries(this.currentTheme.fields).forEach(([field, config]) => {
      this.styleCache.set(`field:${field}`, createStyle(config));
    });

    // Cache status styles
    Object.entries(this.currentTheme.status).forEach(([status, config]) => {
      this.styleCache.set(`status:${status}`, createStyle(config));
    });

    // Cache element styles
    this.styleCache.set(
      "brackets",
      createStyle(this.currentTheme.elements.brackets),
    );
    this.styleCache.set(
      "keyValue:key",
      createStyle(this.currentTheme.elements.keyValue.key),
    );
    this.styleCache.set(
      "keyValue:separator",
      createStyle(this.currentTheme.elements.keyValue.separator),
    );
    this.styleCache.set(
      "keyValue:value",
      createStyle(this.currentTheme.elements.keyValue.value),
    );

    // Cache pattern styles
    Object.entries(this.currentTheme.patterns).forEach(([pattern, config]) => {
      this.patternCache.set(pattern, {
        regex:
          typeof config.regex === "string"
            ? new RegExp(config.regex)
            : config.regex,
        style: createStyle(config),
      });
    });
  }

  public setTheme(
    themeName: keyof typeof THEMES | Partial<ThemeConfig> | string,
  ): void {
    if (typeof themeName === "string") {
      // Check if it's a built-in theme
      if (themeName in THEMES) {
        this.currentTheme = THEMES[themeName as keyof typeof THEMES];
      } else {
        // Try to load from config
        const config = loadConfig();
        if (
          config?.customThemes &&
          themeName in config.customThemes &&
          config.customThemes[themeName]
        ) {
          // Ensure we have a valid theme config by merging with default
          const customTheme = {
            ...THEMES.default,
            ...config.customThemes[themeName],
            name: themeName,
          };
          this.currentTheme = customTheme;
        } else {
          // Fall back to default theme if not found
          this.currentTheme = THEMES.default;
        }
      }
    } else {
      // Merge with default theme to ensure all required properties are present
      this.currentTheme = {
        name: themeName.name || "custom",
        levels: { ...THEMES.default.levels, ...themeName.levels },
        fields: { ...THEMES.default.fields, ...themeName.fields },
        status: { ...THEMES.default.status, ...themeName.status },
        patterns: { ...THEMES.default.patterns, ...themeName.patterns },
        elements: {
          brackets: {
            ...THEMES.default.elements.brackets,
            ...themeName.elements?.brackets,
          },
          keyValue: {
            key: {
              ...THEMES.default.elements.keyValue.key,
              ...themeName.elements?.keyValue?.key,
            },
            separator: {
              ...THEMES.default.elements.keyValue.separator,
              ...themeName.elements?.keyValue?.separator,
            },
            value: {
              ...THEMES.default.elements.keyValue.value,
              ...themeName.elements?.keyValue?.value,
            },
          },
        },
      };
    }
    this.styleCache.clear();
    this.patternCache.clear();
    this.initializeCache();
  }

  public getLevelStyle(level: LogLevel): ChalkInstance {
    return this.styleCache.get(`level:${level}`) || chalk.white;
  }

  public getFieldStyle(field: string): ChalkInstance {
    return this.styleCache.get(`field:${field}`) || chalk.white;
  }

  public getStatusStyle(status: string): ChalkInstance {
    return this.styleCache.get(`status:${status}`) || chalk.white;
  }

  public getBracketStyle(): ChalkInstance {
    return this.styleCache.get("brackets") || chalk.gray;
  }

  public getKeyValueStyles(): {
    key: ChalkInstance;
    separator: ChalkInstance;
    value: ChalkInstance;
  } {
    return {
      key: this.styleCache.get("keyValue:key") || chalk.cyan,
      separator: this.styleCache.get("keyValue:separator") || chalk.gray,
      value: this.styleCache.get("keyValue:value") || chalk.white,
    };
  }

  public applyPatternStyles(text: string): string {
    let result = text;

    // Sort patterns by length (longest first) to avoid overlapping matches
    const sortedPatterns = Array.from(this.patternCache.entries()).sort(
      (a, b) => {
        const aLength = a[1].regex.toString().length;
        const bLength = b[1].regex.toString().length;
        return bLength - aLength;
      },
    );

    for (const [_, { regex, style }] of sortedPatterns) {
      result = result.replace(regex, (match) => style(match));
    }

    return result;
  }

  public formatJson(obj: Record<string, any>): string {
    const lines: string[] = [];
    const bracketStyle = this.getBracketStyle();
    const {
      key: keyStyle,
      separator: separatorStyle,
      value: valueStyle,
    } = this.getKeyValueStyles();

    lines.push(bracketStyle("{"));

    const entries = Object.entries(obj);
    const lastEntry = entries[entries.length - 1];

    for (const [key, val] of entries) {
      const formattedValue =
        typeof val === "object" ? JSON.stringify(val, null, 2) : String(val);
      const isLast = lastEntry && lastEntry[0] === key;
      lines.push(
        `  ${bracketStyle('"')}${keyStyle(key)}${bracketStyle('"')}${separatorStyle(":")} ${valueStyle(formattedValue)}${isLast ? "" : separatorStyle(",")}`,
      );
    }

    lines.push(bracketStyle("}"));
    return lines.join("\n");
  }

  styleLine(line: string, parsed?: { level?: LogLevel; [key: string]: any }, parserName?: string): string {
    // If parser is json, try to format it compactly
    if (parserName === "json") {
      try {
        const json = JSON5.parse(line);
        return formatJsonCompact(json, this); // Use the compact formatter
      } catch (error) {
        // JSON parsing failed, fall back to default styling for the raw line
        // Use level from parsed object if available, otherwise default to 'info'
        const level = parsed?.level || "info"; 
        const style = this.getLevelStyle(level);
        return this.applyPatternStyles(style(line));
      }
    }

    // Fallback for non-JSON parsers or if parsing failed above
    const level = parsed?.level || "info";
    const style = this.getLevelStyle(level);
    const styledLine = style(line);
    return this.applyPatternStyles(styledLine);
  }
}

// Export singleton instance
export const styleManager = StyleManager.getInstance();

// UPDATE: Accept optional parserName and pass it to the manager's method
export const styleLine = (
  line: string,
  parsed?: { level?: LogLevel; [key: string]: any },
  parserName?: string, // Added parserName argument
): string => {
  // Remove the previous logic, delegate entirely to the manager instance
  return styleManager.styleLine(line, parsed, parserName);

  // OLD Logic moved/modified into styleManager.styleLine:
  // if (parsed.language === "json") { ... }
  // Apply level-based styling
  // const level = parsed.level || "info";
  // const styledLine = styleManager.getLevelStyle(level)(line);
  // Apply pattern-based styling
  // return styleManager.applyPatternStyles(styledLine);
};

// Export theme-related functions
export const setTheme = (
  theme: keyof typeof THEMES | Partial<ThemeConfig> | string,
): void => {
  if (typeof theme === "string") {
    // Check if it's a built-in theme
    if (theme in THEMES) {
      styleManager.setTheme(theme as keyof typeof THEMES);
    } else {
      // Try to load from config
      const config = loadConfig();
      if (
        config?.customThemes &&
        theme in config.customThemes &&
        config.customThemes[theme]
      ) {
        // Ensure we have a valid theme config by merging with default
        const customTheme = {
          ...THEMES.default,
          ...config.customThemes[theme],
          name: theme,
        };
        styleManager.setTheme(customTheme);
      } else {
        // Fall back to default theme if not found
        styleManager.setTheme("default");
      }
    }
  } else {
    styleManager.setTheme(theme);
  }
};

export const getTheme = () => styleManager.currentTheme;

// NEW function: Format JSON compactly on a single line with colors
function formatJsonCompact(
  obj: any,
  styleManager: StyleManager,
  isRoot = true,
): string {
  const bracketStyle = styleManager.getBracketStyle();
  const {
    key: keyStyle,
    separator: separatorStyle,
    value: valueStyle,
  } = styleManager.getKeyValueStyles();

  if (obj === null) {
    return valueStyle("null");
  }
  if (typeof obj === "string") {
    // NEW: Style quotes with bracketStyle, content with valueStyle
    return `${bracketStyle('"')}${valueStyle(obj)}${bracketStyle('"')}`;
  }
  if (typeof obj === "number" || typeof obj === "boolean") {
    return valueStyle(String(obj));
  }

  if (Array.isArray(obj)) {
    const items = obj
      .map((item) => formatJsonCompact(item, styleManager, false))
      .join(separatorStyle(", "));
    return `${bracketStyle("[")}${items}${bracketStyle("]")}`;
  }

  if (typeof obj === "object") {
    const entries = Object.entries(obj)
      .map(([key, value]) => {
        const formattedKey = `${bracketStyle('"')}${keyStyle(key)}${bracketStyle('"')}`;
        const formattedValue = formatJsonCompact(value, styleManager, false);
        return `${formattedKey}${separatorStyle(":")}${formattedValue}`;
      })
      .join(separatorStyle(", "));
    return `${bracketStyle("{")}${entries}${bracketStyle("}")}`;
  }

  // Fallback for unexpected types
  return valueStyle(String(obj));
}
