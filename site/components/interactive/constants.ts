import type { ThemePair } from "./types";

export const SAMPLE_LOGS = [
  "[2024-01-15 10:23:45] INFO: Server started on port 3000",
  "GET /api/users 200 OK (123ms)",
  "POST /api/auth/login 401 Unauthorized",
  "WARN: Memory usage high: 85% (1.7GB/2GB)",
  "[ERROR] Database connection failed: ECONNREFUSED 127.0.0.1:5432",
  "DEBUG: SQL Query executed in 45ms",
  "SUCCESS: All tests passed (42 tests, 0 failures)",
  "CRITICAL: System shutdown initiated",
  "Processing batch job... [████████████████████] 100%",
  "Application ready at http://localhost:3000",
];

export const THEME_PAIRS: Record<string, ThemePair> = {
  GitHub: { light: "github-light", dark: "github-dark" },
  Solarized: { light: "solarized-light", dark: "solarized-dark" },
  Dracula: { light: "dracula", dark: "dracula" },
  Nord: { light: "nord", dark: "nord" },
  Monokai: { light: "monokai", dark: "monokai" },
  "Oh My Zsh": { light: "oh-my-zsh", dark: "oh-my-zsh" },
};

export const THEME_BACKGROUNDS: Record<
  string,
  { bg: string; headerBg: string; border: string }
> = {
  "github-light": { bg: "#ffffff", headerBg: "#f6f8fa", border: "#d1d9e0" },
  "github-dark": { bg: "#0d1117", headerBg: "#161b22", border: "#30363d" },
  "solarized-light": { bg: "#fdf6e3", headerBg: "#eee8d5", border: "#eee8d5" },
  "solarized-dark": { bg: "#002b36", headerBg: "#073642", border: "#073642" },
  dracula: { bg: "#282a36", headerBg: "#1e1f29", border: "#44475a" },
  nord: { bg: "#2e3440", headerBg: "#3b4252", border: "#4c566a" },
  monokai: { bg: "#272822", headerBg: "#3e3d32", border: "#75715e" },
  "oh-my-zsh": { bg: "#2c3e50", headerBg: "#34495e", border: "#34495e" },
};
