import type { CliFeature } from "./types";

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
