export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  warning: string;
  info: string;
  success: string;
  text: string;
  background: string;
  border: string;
}

export interface Preset {
  id: string;
  label: string;
  description: string;
}

export interface SavedTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  presets: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ThemeExport {
  name: string;
  colors: ThemeColors;
  presets: string[];
  version: string;
}

export interface SampleLog {
  text: string;
  category: string;
}
