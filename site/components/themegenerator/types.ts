export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  warning: string;
  info: string;
  success: string;
  debug: string;
  text: string;
  background: string;
  muted: string;
  highlight?: string;
}

export interface ThemePreset {
  id: string;
  label: string;
  description: string;
}

export interface ThemeConfig {
  name: string;
  mode: "light" | "dark" | "auto";
  colors: ThemeColors;
  presets: string[];
  description?: string;
  customWords?: Record<string, string | StyleOptions>;
  customPatterns?: CustomPattern[];
  defaultTextColor?: string;
  whiteSpace?: "preserve" | "trim";
  newLine?: "preserve" | "trim";
}

export interface StyleOptions {
  color?: string;
  styleCodes?: string[];
}

export interface CustomPattern {
  name: string;
  pattern: string;
  color: string;
  style?: string[];
}

export interface SampleLog {
  text: string;
  category?: "info" | "error" | "warning" | "debug" | "success" | "general";
}
