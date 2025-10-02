import { Theme } from "../types";
import type { Token } from "../schema/types";

export type OutputFormat = "ansi" | "html";
export type HtmlStyleFormat = "css" | "className";

export type RenderOptions = {
  theme?: Theme;
  outputFormat?: OutputFormat;
  htmlStyleFormat?: HtmlStyleFormat;
  escapeHtml?: boolean;
  classPrefix?: string;
  useBEM?: boolean;
};

export type MatchType =
  | "whitespace"
  | "newline"
  | "space"
  | "spaces"
  | "tab"
  | "carriage-return";

export type TokenWithStyle = Token & {
  metadata: {
    style?: {
      color?: string;
      backgroundColor?: string;
      styleCodes?: ReadonlyArray<StyleCode>;
    };
    matchType?: MatchType;
    trimmed?: boolean;
    originalLength?: number;
  };
};

export interface ColorDefinition {
  ansi: string;
  hex?: string;
  className?: string;
}

export type StyleCode =
  | "bold"
  | "italic"
  | "underline"
  | "dim"
  | "blink"
  | "reverse"
  | "strikethrough";

export type ColorScheme = "light" | "dark" | "auto";

export type ConfidenceLevel = "high" | "medium" | "low";

export type BackgroundSource = "terminal" | "browser" | "system" | "default";

export interface BackgroundDetails {
  readonly termProgram?: string;
  readonly colorFgBg?: string;
  readonly mediaQuery?: boolean;
  readonly systemPreference?: string;
}

export interface BackgroundInfo {
  readonly scheme: ColorScheme;
  readonly confidence: ConfidenceLevel;
  readonly source: BackgroundSource;
  readonly details?: BackgroundDetails;
}

export type BorderStyle = "rounded" | "square" | "double" | "simple";

export interface BorderChars {
  readonly topLeft: string;
  readonly topRight: string;
  readonly bottomLeft: string;
  readonly bottomRight: string;
  readonly horizontal: string;
  readonly vertical: string;
}

export interface LightBoxOptions {
  readonly width?: number;
  readonly padding?: number;
  readonly border?: boolean;
  readonly borderStyle?: BorderStyle;
  readonly backgroundColor?: string;
}
