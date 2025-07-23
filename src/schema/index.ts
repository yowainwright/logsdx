import { z } from "zod";

export const styleOptionsSchema = z.object({
  color: z.string(),
  styleCodes: z.array(z.string()).optional(),
  htmlStyleFormat: z
    .enum(["css", "className"])
    .optional()
    .describe("HTML style format"),
});

export const tokenMetadataSchema = z
  .object({
    style: styleOptionsSchema
      .optional()
      .describe("Styling information for this token"),
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
  whiteSpace: z.enum(["preserve", "trim"]).optional().default("preserve"),
  newLine: z.enum(["preserve", "trim"]).optional().default("preserve"),
});

export const themePresetSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  schema: schemaConfigSchema,
});

export const tokenSchema = z.object({
  content: z.string().describe("The actual text content of the token"),
  metadata: tokenMetadataSchema.describe(
    "Additional token metadata including style information",
  ),
});

export const tokenListSchema = z.array(tokenSchema);

export * from "./validator";
