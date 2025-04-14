import { readFileSync } from "fs";
import { resolve } from "path";
import { homedir } from "os";
import type { ThemeConfig } from "./styles";
import { THEMES } from "./styles";

export const CONFIG_FILES = [
  ".logsdxrc", // Project root
  ".logsdxrc.json", // Project root (explicit JSON)
  ".config/logsdx/config.json", // User config (XDG)
];

export type LogsDXConfig = {
  theme?: keyof typeof THEMES | Partial<ThemeConfig>;
  customThemes?: {
    [key: string]: Partial<ThemeConfig>;
  };
}

/**
 * Load config from the first available config file
 * @returns The loaded config or null if no config found
 */
export function loadConfig(): LogsDXConfig | null {
  const home = homedir();

  // Try current directory first, then home directory
  for (const configFile of CONFIG_FILES) {
    try {
      // Try project directory
      const projectPath = resolve(process.cwd(), configFile);
      try {
        const content = readFileSync(projectPath, "utf-8");
        return JSON.parse(content);
      } catch (e) {
        // Project config doesn't exist, try home directory
      }

      // Try home directory
      const homePath = resolve(home, configFile);
      try {
        const content = readFileSync(homePath, "utf-8");
        return JSON.parse(content);
      } catch (e) {
        // Home config doesn't exist, continue to next file
      }
    } catch (error) {
      // Skip files that don't exist or can't be read
    }
  }

  return null;
}

/**
 * Load a theme from a file
 * @param themePath Path to the theme file
 * @returns The loaded theme or null if loading fails
 */
export function loadThemeFromFile(
  themePath: string,
): Partial<ThemeConfig> | null {
  try {
    const content = readFileSync(themePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Get all available themes (built-in and custom)
 * @param config The LogsDX config
 * @returns Map of theme names to their configurations
 */
export function getAllThemes(
  config: LogsDXConfig | null,
): Map<string, ThemeConfig> {
  const themes = new Map<string, ThemeConfig>();

  // Add built-in themes
  Object.entries(THEMES).forEach(([name, theme]) => {
    themes.set(name, theme);
  });

  // Add custom themes from config
  if (config?.customThemes) {
    Object.entries(config.customThemes).forEach(([name, theme]) => {
      themes.set(name, {
        name,
        levels: { ...THEMES.default.levels, ...theme.levels },
        fields: { ...THEMES.default.fields, ...theme.fields },
        status: { ...THEMES.default.status, ...theme.status },
        patterns: { ...THEMES.default.patterns, ...theme.patterns },
        elements: {
          brackets: {
            ...THEMES.default.elements.brackets,
            ...theme.elements?.brackets,
          },
          keyValue: {
            key: {
              ...THEMES.default.elements.keyValue.key,
              ...theme.elements?.keyValue?.key,
            },
            separator: {
              ...THEMES.default.elements.keyValue.separator,
              ...theme.elements?.keyValue?.separator,
            },
            value: {
              ...THEMES.default.elements.keyValue.value,
              ...theme.elements?.keyValue?.value,
            },
          },
        },
      });
    });
  }

  return themes;
}
