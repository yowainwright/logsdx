import type { OutputView, ViewMode, GhosttyTheme } from "./types";

export const TEXT = {
  title: {
    highlight: "Real",
    rest: "Output Comparison",
  },
  description: "See exactly what logsDX outputs for terminal vs browser",
  labels: {
    theme: "Theme",
    terminalOutput: "Terminal Output",
    browserOutput: "Browser Output",
    processing: "Processing...",
    loadingTerminal: "Loading terminal...",
    significance:
      "The Terminal panel uses Ghostty, a real WebAssembly terminal emulator—not fake styling. What you see is exactly how these logs render in an actual terminal.",
  },
} as const;

export const CLASSES = {
  section: "py-24",
  container: "container mx-auto px-4",
  wrapper: "mx-auto max-w-6xl",
  header: {
    title: "mb-4 text-center text-5xl lg:text-6xl font-bold",
    gradient:
      "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
    description: "mb-12 text-center text-xl text-slate-600 dark:text-slate-400",
  },
  grid: "grid gap-8 lg:grid-cols-3",
  sidebar: "lg:col-span-1 space-y-6",
  content: "lg:col-span-2",
  label: "block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300",
  significanceText:
    "text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed",
  tab: {
    base: "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
    active: "bg-blue-600 text-white",
    inactive:
      "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600",
  },
  tabDescription: "text-sm text-slate-500 dark:text-slate-400 mb-4",
  terminal: {
    wrapper: "rounded-lg overflow-hidden border border-slate-700",
    header: "bg-slate-800 px-4 py-2 flex items-center gap-2",
    dots: "flex gap-1.5",
    dot: {
      red: "w-3 h-3 rounded-full bg-red-500",
      yellow: "w-3 h-3 rounded-full bg-yellow-500",
      green: "w-3 h-3 rounded-full bg-green-500",
    },
    title: "text-xs text-white/60 ml-2",
    content: "p-4 min-h-[300px] overflow-auto",
  },
  outputCard: "bg-slate-100 dark:bg-slate-800 rounded-lg p-4",
  outputTitle: "text-sm font-semibold mb-2",
  outputCode: "text-xs text-slate-600 dark:text-slate-400 block",
  outputFormat: "text-xs text-slate-500 mt-2",
} as const;

export const STYLES = {
  headerDropShadow: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
  terminalBg: "#1e1e1e",
} as const;

export const TERMINAL = {
  initTimeoutMs: 10000,
  minHeight: "min-h-[300px]",
  fontSize: 14,
  fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, monospace",
} as const;

export const SAMPLE_LOGS = [
  "[INFO] Server started on port 3000",
  "[WARN] Memory usage: 85%",
  "[ERROR] Connection failed: timeout",
  "[DEBUG] Request id=abc123 processed",
  "[SUCCESS] Deploy complete ✓",
];

export const VIEWS: { id: OutputView; label: string }[] = [
  { id: "terminal", label: "Terminal" },
  { id: "html", label: "HTML" },
];

export const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "rendered", label: "Rendered" },
  { id: "source", label: "Source" },
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

const ANSI_ESCAPE = String.fromCharCode(27);

export const ANSI_ESCAPE_REPLACEMENTS: [RegExp, string][] = [
  [new RegExp(ANSI_ESCAPE, "g"), "\\x" + "1b"],
];

export const DEFAULT_GHOSTTY_THEME: GhosttyTheme = {
  background: "#282a36",
  foreground: "#f8f8f2",
  cursor: "#f8f8f2",
  cursorAccent: "#282a36",
  selectionBackground: "#44475a",
  black: "#000000",
  red: "#ff5555",
  green: "#50fa7b",
  yellow: "#ffb86c",
  blue: "#ff79c6",
  magenta: "#bd93f9",
  cyan: "#8be9fd",
  white: "#f8f8f2",
  brightBlack: "#6272a4",
  brightRed: "#ff6e6e",
  brightGreen: "#69ff94",
  brightYellow: "#ffca85",
  brightBlue: "#ff92d0",
  brightMagenta: "#d6acff",
  brightCyan: "#a4ffff",
  brightWhite: "#ffffff",
};
