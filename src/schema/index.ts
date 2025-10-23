import { z } from "zod";
import {
  COLOR_VALIDATION_MESSAGE,
  EMPTY_COLOR_MESSAGE,
  STYLE_CODES,
  WHITESPACE_OPTIONS,
  NEWLINE_OPTIONS,
  THEME_MODES,
  HTML_STYLE_FORMATS,
  DEFAULT_WHITESPACE,
  DEFAULT_NEWLINE,
  THEME_MODE_DESCRIPTION,
  TOKEN_CONTENT_DESCRIPTION,
  TOKEN_METADATA_DESCRIPTION,
  TOKEN_STYLE_DESCRIPTION,
  HTML_STYLE_FORMAT_DESCRIPTION,
} from "./constants";
import { isValidColorFormat } from "./utils";

export const styleOptionsSchema = z.object({
  color: z.string().min(1, EMPTY_COLOR_MESSAGE).refine(isValidColorFormat, {
    message: COLOR_VALIDATION_MESSAGE,
  }),
  styleCodes: z.array(z.enum(STYLE_CODES)).optional(),
  htmlStyleFormat: z
    .enum(HTML_STYLE_FORMATS)
    .optional()
    .describe(HTML_STYLE_FORMAT_DESCRIPTION),
});

export const tokenMetadataSchema = z
  .object({
    style: styleOptionsSchema.optional().describe(TOKEN_STYLE_DESCRIPTION),
  })
  .catchall(z.unknown())
  .optional();

export const patternMatchSchema = z.object({
  name: z.string(),
  pattern: z.string(),
  options: styleOptionsSchema,
});

export const schemaConfigSchema = z.object({
  defaultStyle: styleOptionsSchema.optional(),
  matchWords: z.record(z.string(), styleOptionsSchema).optional(),
  matchStartsWith: z.record(z.string(), styleOptionsSchema).optional(),
  matchEndsWith: z.record(z.string(), styleOptionsSchema).optional(),
  matchContains: z.record(z.string(), styleOptionsSchema).optional(),
  matchPatterns: z.array(patternMatchSchema).optional(),
  whiteSpace: z.enum(WHITESPACE_OPTIONS).optional().default(DEFAULT_WHITESPACE),
  newLine: z.enum(NEWLINE_OPTIONS).optional().default(DEFAULT_NEWLINE),
});

export const themePresetSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  mode: z.enum(THEME_MODES).optional().describe(THEME_MODE_DESCRIPTION),
  schema: schemaConfigSchema,
});

export const tokenSchema = z.object({
  content: z.string().describe(TOKEN_CONTENT_DESCRIPTION),
  metadata: tokenMetadataSchema.describe(TOKEN_METADATA_DESCRIPTION),
});

export const tokenListSchema = z.array(tokenSchema);

export * from "./validator";
