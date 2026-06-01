import type { CliFeature } from "./types";

export const TEXT = {
  title: {
    highlight: "Powerful",
    rest: "CLI",
  },
  description: "Style your logs from anywhere with a single command",
  labels: {
    terminal: "Terminal",
  },
} as const;

export const CLASSES = {
  section: "py-24 bg-slate-50 dark:bg-slate-900",
  container: "container mx-auto px-4",
  wrapper: "mx-auto max-w-6xl",
  header: {
    title: "mb-4 text-center text-5xl lg:text-6xl font-bold",
    gradient:
      "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
    description: "mb-12 text-center text-xl text-slate-600 dark:text-slate-400",
  },
  packageManager: {
    wrapper: "flex justify-center gap-2 mb-4",
    button: {
      base: "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
      active: "bg-blue-600 text-white",
      inactive:
        "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600",
    },
    command: "rounded-lg p-4 font-mono text-center",
  },
  grid: "grid gap-8 lg:grid-cols-2",
  featureList: "space-y-3",
  featureButton: {
    base: "w-full text-left p-4 rounded-lg transition-all",
    active: "bg-blue-600/10 border-2 border-blue-600",
    inactive:
      "bg-white dark:bg-slate-800 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600",
    title: {
      active: "text-blue-600 dark:text-blue-400",
      inactive: "text-slate-900 dark:text-white",
    },
    titleWrapper: "font-semibold mb-1",
    description: "text-sm text-slate-600 dark:text-slate-400",
  },
  terminal: {
    header: "px-4 py-2 flex items-center gap-2",
    dots: "flex gap-1.5",
    dot: {
      red: "w-3 h-3 rounded-full bg-red-500",
      yellow: "w-3 h-3 rounded-full bg-yellow-500",
      green: "w-3 h-3 rounded-full bg-green-500",
    },
    title: "text-xs text-white/60 ml-2",
    content: "p-6 font-mono min-h-[300px]",
    prompt: "mb-4",
    output: "text-sm leading-relaxed",
  },
} as const;

export const STYLES = {
  headerDropShadow: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
} as const;

export const CLI_FEATURES: CliFeature[] = [
  {
    title: "Pipe Logs",
    description: "Pipe any log output through logsdx for instant styling",
    command: "cat server.log | logsdx --theme dracula",
  },
  {
    title: "Process Files",
    description: "Process log files directly with your chosen theme",
    command: "logsdx process app.log --theme github-dark",
  },
  {
    title: "Interactive Theme Creator",
    description: "Create custom themes with an interactive wizard",
    command: "logsdx create-theme",
  },
  {
    title: "Preview Themes",
    description: "Preview any theme with sample logs before using",
    command: "logsdx preview --theme nord",
  },
  {
    title: "Tail with Style",
    description: "Follow logs in real-time with beautiful styling",
    command: "tail -f /var/log/app.log | logsdx --theme monokai",
  },
  {
    title: "List Themes",
    description: "View all available built-in themes",
    command: "logsdx themes",
  },
];

export const INSTALL_COMMANDS = {
  npm: "npm install -g logsdx",
  pnpm: "pnpm add -g logsdx",
  bun: "bun add -g logsdx",
} as const;

export const TERMINAL_COLORS = {
  bg: "#1a1b26",
  headerBg: "#24283b",
  border: "#414868",
  text: "#a9b1d6",
  prompt: "#7aa2f7",
  command: "#9ece6a",
  output: "#787c99",
} as const;
