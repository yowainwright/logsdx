export interface ThemeConfig {
  bg: string;
  headerBg: string;
  text: string;
  border: string;
  colors: {
    info: string;
    warn: string;
    error: string;
    success: string;
    debug: string;
    critical: string;
  };
}

export interface ThemePair {
  light: string;
  dark: string;
}

export type ColorMode = "light" | "dark" | "system";

export interface LogEntry {
  message: string;
  level?: "info" | "warn" | "error" | "success" | "debug" | "critical";
  timestamp?: string;
}
