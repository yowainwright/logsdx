import { Theme } from "@/src/types";

export type RenderOptions = {
  theme?: Theme;
  outputFormat?: "ansi" | "html";
  htmlStyleFormat?: "css" | "className";
};

export interface ColorDefinition {
  ansi: string;
  hex?: string;
  className?: string;
}
