export interface ColorPalette {
  readonly primary: string;
  readonly secondary: string;
  readonly success: string;
  readonly warning: string;
  readonly error: string;
  readonly info: string;
  readonly text: string;
  readonly background: string;
  readonly [key: string]: string;
}

export interface ThemePreset {
  readonly name: string;
  readonly description?: string;
  readonly mode?: "light" | "dark" | "auto";
}

export interface SimpleThemeConfig {
  readonly name: string;
  readonly description?: string;
  readonly mode?: "light" | "dark" | "auto";
  readonly colors: ColorPalette;
  readonly keywords?: ReadonlyArray<string>;
  readonly patterns?: ReadonlyArray<{
    readonly name: string;
    readonly pattern: string;
    readonly color: string;
  }>;
}
