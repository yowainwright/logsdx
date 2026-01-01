import type { OutputTab } from "./types";

export const SAMPLE_LOGS = [
  "[INFO] Server started on port 3000",
  "[WARN] Memory usage: 85%",
  "[ERROR] Connection failed: timeout",
  "[DEBUG] Request id=abc123 processed",
  "[SUCCESS] Deploy complete ✓",
];

export const OUTPUT_TABS: { id: OutputTab; label: string; description: string }[] = [
  {
    id: "ansi-raw",
    label: "ANSI (Raw)",
    description: "Raw escape codes sent to terminal",
  },
  {
    id: "ansi-rendered",
    label: "ANSI (Terminal)",
    description: "Real terminal rendering via Ghostty WASM",
  },
  {
    id: "html-raw",
    label: "HTML (Source)",
    description: "Raw HTML markup",
  },
  {
    id: "html-rendered",
    label: "HTML (Browser)",
    description: "How it looks in browser",
  },
];

export const THEME_OPTIONS = [
  "dracula",
  "github-dark",
  "github-light",
  "nord",
  "monokai",
  "solarized-dark",
  "solarized-light",
  "oh-my-zsh",
];
