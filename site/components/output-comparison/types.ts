export interface OutputComparisonProps {
  initialTheme?: string;
}

export interface ProcessedOutput {
  ansi: string;
  html: string;
  ansiVisible: string;
}

export type OutputTab =
  | "ansi-raw"
  | "ansi-rendered"
  | "html-raw"
  | "html-rendered";

export interface GhosttyTerminalProps {
  ansiOutputs: string[];
  isLoading: boolean;
}
