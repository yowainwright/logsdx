import type { ThemeBackground } from "./types";

export const THEME_BACKGROUNDS: Record<string, ThemeBackground> = {
  "github-light": { bg: "#ffffff", headerBg: "#f6f8fa", border: "#d1d9e0" },
  "github-dark": { bg: "#0d1117", headerBg: "#161b22", border: "#30363d" },
  "solarized-light": { bg: "#fdf6e3", headerBg: "#eee8d5", border: "#eee8d5" },
  "solarized-dark": { bg: "#002b36", headerBg: "#073642", border: "#073642" },
  dracula: { bg: "#282a36", headerBg: "#1e1f29", border: "#44475a" },
  nord: { bg: "#2e3440", headerBg: "#3b4252", border: "#4c566a" },
  monokai: { bg: "#272822", headerBg: "#3e3d32", border: "#75715e" },
  "oh-my-zsh": { bg: "#2c3e50", headerBg: "#34495e", border: "#34495e" },
};

export const DEFAULT_BACKGROUND: ThemeBackground = {
  bg: "#0d1117",
  headerBg: "#161b22",
  border: "#30363d",
};
