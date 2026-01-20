export interface OutputComparisonProps {
  initialTheme?: string;
}

export interface ProcessedOutput {
  ansi: string;
  html: string;
  ansiVisible: string;
}

export type OutputView = "terminal" | "html";
export type ViewMode = "rendered" | "source";

export interface GhosttyTerminalProps {
  ansiOutputs: string[];
  isLoading: boolean;
  theme: GhosttyTheme;
}

export interface GhosttyTheme {
  background: string;
  foreground: string;
  cursor: string;
  cursorAccent: string;
  selectionBackground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}
