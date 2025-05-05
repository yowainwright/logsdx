/**
 * Options for rendering logs
 */

import { Theme } from '../schema/types';

export type RenderOptions = {
  theme?: Theme;
  outputFormat?: 'ansi' | 'html';
  htmlStyleFormat?: 'css' | 'className'; // HTML output format (defaults to ANSI if not specified)
}

export interface ColorDefinition {
  ansi: string;
  hex?: string;
  className?: string;
}
