import type { ThemeBackground } from "./types";

export const SAMPLE_LOGS = [
  "[2024-01-15 10:23:45] INFO: Server started on port 3000",
  "GET /api/users 200 OK (123ms)",
  "WARN: Memory usage high: 85% (1.7GB/2GB)",
  "[ERROR] Database connection failed: ECONNREFUSED 127.0.0.1:5432",
  "DEBUG: SQL Query executed in 45ms",
  "SUCCESS: All tests passed (42 tests, 0 failures)",
];

export const THEME_BACKGROUNDS: Record<string, ThemeBackground> = {
  "oh-my-zsh": { bg: "#2c3e50", mode: "dark" },
  dracula: { bg: "#282a36", mode: "dark" },
  "github-light": { bg: "#ffffff", mode: "light" },
  "github-dark": { bg: "#0d1117", mode: "dark" },
  "solarized-light": { bg: "#fdf6e3", mode: "light" },
  "solarized-dark": { bg: "#002b36", mode: "dark" },
  nord: { bg: "#2e3440", mode: "dark" },
  monokai: { bg: "#272822", mode: "dark" },
};

export const DEFAULT_BACKGROUND: ThemeBackground = {
  bg: "#1a1a1a",
  mode: "dark",
};
