import type { Theme } from "../types";

export const DEFAULT_THEME = "oh-my-zsh";

export const DEFAULT_COLORS = {
  DARK_BACKGROUND: "#000000",
  LIGHT_BACKGROUND: "#ffffff",
  DARK_TEXT: "#000000",
  LIGHT_TEXT: "#ffffff",
} as const;

export const THEMES: Record<string, Theme> = {};
