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

  generateTheme: z.boolean().optional().default(false),
  listPalettes: z.boolean().optional().default(false),
  listPatterns: z.boolean().optional().default(false),
  exportTheme: z.string().optional(),
  importTheme: z.string().optional(),
  listThemeFiles: z.boolean().optional().default(false),
});

export type CliOptions = z.infer<typeof cliOptionsSchema>;
export type CommanderOptions = CliOptions;

export interface SpinnerLike {
  start(): this;
  succeed(message?: string): this;
  fail(message?: string): this;
  stop(): this;
  text?: string;
}

export interface ProgressBarLike {
  start(total: number, startValue: number): void;
  update(current: number): void;
  stop(): void;
}
