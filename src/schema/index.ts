import { z } from "zod";

export const styleOptionsSchema = z.object({
  color: z.string().min(1, "Color cannot be empty").refine(
    (color) => {
      // Basic color validation - hex, rgb, named colors, or semantic references
      return /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|\w+)/.test(color);
    },
    { message: "Invalid color format. Use hex (#ff0000), rgb(), hsl(), or named colors" }
  ),
  styleCodes: z.array(z.enum([
    "bold", "italic", "underline", "dim", "blink", "reverse", "strikethrough"
  ])).optional(),
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
  mode: z.enum(["light", "dark", "auto"]).optional().describe("Theme mode: light for light backgrounds, dark for dark backgrounds, auto for system preference"),
  schema: schemaConfigSchema,
});

export const tokenSchema = z.object({
  content: z.string().describe("The actual text content of the token"),
  metadata: tokenMetadataSchema.describe(
    "Additional token metadata including style information"
  ),
});

export const tokenListSchema = z.array(tokenSchema);

export * from "./validator";
