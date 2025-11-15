import type { Theme } from "../types";

type ThemeLoader = () => Promise<{ default: Theme }>;

interface ThemeRegistryEntry {
  name: string;
  loader?: ThemeLoader;
  theme?: Theme;
  description?: string;
}

class ThemeRegistry {
  private themes = new Map<string, ThemeRegistryEntry>();
  private defaultThemeName = "oh-my-zsh";
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.registerBuiltInThemes();
    this.initPromise = this.initializeDefaultThemes();
  }

  private registerBuiltInThemes(): void {
    const builtInThemes: Record<string, ThemeLoader> = {
      "oh-my-zsh": () => import("./presets/oh-my-zsh"),
      dracula: () => import("./presets/dracula"),
      nord: () => import("./presets/nord"),
      monokai: () => import("./presets/monokai"),
      "github-light": () => import("./presets/github-light"),
      "github-dark": () => import("./presets/github-dark"),
      "solarized-light": () => import("./presets/solarized-light"),
      "solarized-dark": () => import("./presets/solarized-dark"),
    };

    for (const [name, loader] of Object.entries(builtInThemes)) {
      this.themes.set(name, { name, loader });
    }
  }

  private async initializeDefaultThemes(): Promise<void> {
    try {
      await this.preloadTheme(this.defaultThemeName);
    } catch (error) {
      console.warn("Failed to preload default theme:", error);
    }
  }

  async getTheme(themeName: string): Promise<Theme> {
    const entry = this.themes.get(themeName);

    if (!entry) {
      const defaultEntry = this.themes.get(this.defaultThemeName);
      if (!defaultEntry) {
        throw new Error(
          `Default theme "${this.defaultThemeName}" not found in registry`,
        );
      }
      return this.loadTheme(defaultEntry);
    }

    return this.loadTheme(entry);
  }

  private async loadTheme(entry: ThemeRegistryEntry): Promise<Theme> {
    if (entry.theme) {
      return entry.theme;
    }

    if (!entry.loader) {
      throw new Error(`No loader found for theme "${entry.name}"`);
    }

    const module = await entry.loader();
    entry.theme = module.default;
    return entry.theme;
  }

  getThemeSync(themeName: string): Theme | undefined {
    const entry = this.themes.get(themeName);
    if (!entry?.theme) {
      const defaultEntry = this.themes.get(this.defaultThemeName);
      return defaultEntry?.theme;
    }
    return entry.theme;
  }

  registerTheme(theme: Theme): void {
    this.themes.set(theme.name, { name: theme.name, theme });
  }

  registerThemeLoader(name: string, loader: ThemeLoader): void {
    this.themes.set(name, { name, loader });
  }

  getThemeNames(): string[] {
    return Array.from(this.themes.keys());
  }

  getAllLoadedThemes(): Record<string, Theme> {
    const loaded: Record<string, Theme> = {};
    for (const [name, entry] of this.themes.entries()) {
      if (entry.theme) {
        loaded[name] = entry.theme;
      }
    }
    return loaded;
  }

  async preloadTheme(themeName: string): Promise<void> {
    await this.getTheme(themeName);
  }

  async preloadAllThemes(): Promise<void> {
    const promises = Array.from(this.themes.keys()).map((name) =>
      this.getTheme(name),
    );
    await Promise.all(promises);
  }

  setDefaultTheme(themeName: string): void {
    this.defaultThemeName = themeName;
  }

  hasTheme(themeName: string): boolean {
    return this.themes.has(themeName);
  }
}

export const themeRegistry = new ThemeRegistry();

export async function getTheme(themeName: string): Promise<Theme> {
  return themeRegistry.getTheme(themeName);
}

export function getThemeSync(themeName: string): Theme | undefined {
  return themeRegistry.getThemeSync(themeName);
}

export function registerTheme(theme: Theme): void {
  themeRegistry.registerTheme(theme);
}

export function registerThemeLoader(
  name: string,
  loader: ThemeLoader,
): void {
  themeRegistry.registerThemeLoader(name, loader);
}

export function getThemeNames(): string[] {
  return themeRegistry.getThemeNames();
}

export function getAllLoadedThemes(): Record<string, Theme> {
  return themeRegistry.getAllLoadedThemes();
}

export async function preloadTheme(themeName: string): Promise<void> {
  return themeRegistry.preloadTheme(themeName);
}

export async function preloadAllThemes(): Promise<void> {
  return themeRegistry.preloadAllThemes();
}
