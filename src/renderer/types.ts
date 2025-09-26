import { Theme } from "../types";

export type RenderOptions = {
  theme?: Theme;
  outputFormat?: "ansi" | "html";
  htmlStyleFormat?: "css" | "className";
  escapeHtml?: boolean;
  classPrefix?: string;
  useBEM?: boolean;
};

export interface ColorDefinition {
  ansi: string;
  hex?: string;
  className?: string;
}
