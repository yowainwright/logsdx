import { z } from "zod";

export const cliOptionsSchema = z.object({
  input: z.string().optional(),
  output: z.string().optional(),
  theme: z.string().optional(),
  config: z.string().optional(),
  debug: z.boolean().optional().default(false),
  quiet: z.boolean().optional().default(false),
  listThemes: z.boolean().optional().default(false),
  interactive: z.boolean().optional().default(false),
  preview: z.boolean().optional().default(false),
  noSpinner: z.boolean().optional().default(false),
  format: z.enum(["ansi", "html"]).optional(),
  // Theme generation options
  generateTheme: z.boolean().optional().default(false),
  listPalettes: z.boolean().optional().default(false),
  listPatterns: z.boolean().optional().default(false),
  exportTheme: z.string().optional(),
  importTheme: z.string().optional(),
  listThemeFiles: z.boolean().optional().default(false),
});

export type CliOptions = z.infer<typeof cliOptionsSchema>;

// Commander.js specific option types
export const commanderOptionsSchema = z.object({
  theme: z.string().optional(),
  debug: z.boolean().optional(),
  output: z.string().optional(),
  config: z.string().optional(),
  interactive: z.boolean().optional(),
  preview: z.boolean().optional(),
  format: z.string().optional(),
  listThemes: z.boolean().optional(),
  noSpinner: z.boolean().optional(),
  quiet: z.boolean().optional(),
  // Theme generation options
  generateTheme: z.boolean().optional(),
  listPalettes: z.boolean().optional(),
  listPatterns: z.boolean().optional(),
  exportTheme: z.string().optional(),
  importTheme: z.string().optional(),
  listThemeFiles: z.boolean().optional(),
});

export type CommanderOptions = z.infer<typeof commanderOptionsSchema>;
