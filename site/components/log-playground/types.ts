import type { GhosttyTheme } from "../output-comparison/types";

export interface LogPlaygroundProps {
  defaultTheme?: string;
  defaultLogs?: string;
}

export interface ProcessedOutput {
  html: string;
  ansi: string;
}

export interface OutputPaneProps {
  title: string;
  content: string[];
  backgroundColor: string;
  isLoading: boolean;
}

export interface CardControlsProps {
  selectedTheme: string;
  onThemeChange: (t: string) => void;
  onReset: () => void;
}

export interface TerminalPaneProps {
  ansiContent: string[];
  ghosttyTheme: GhosttyTheme | null;
  isLoading: boolean;
  bgColor: string;
}

export interface PlaygroundPanelsProps {
  inputText: string;
  onInputChange: (v: string) => void;
  htmlContent: string[];
  ansiContent: string[];
  ghosttyTheme: GhosttyTheme | null;
  bgColor: string;
  isLoading: boolean;
}

export interface InputPaneProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}
