import { z } from "zod";

// Basic color patterns
export const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
export const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
export const rgbaPattern =
  /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(?:0|1|0?\.\d+)\s*\)$/;
export const hslPattern = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/;
export const hslaPattern =
  /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*(?:0|1|0?\.\d+)\s*\)$/;

// Terminal colors as const for better performance
export const terminalColors = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "gray",
  "grey",
  "brightRed",
  "brightGreen",
  "brightYellow",
  "brightBlue",
  "brightMagenta",
  "brightCyan",
  "brightWhite",
] as const;

// Color validation schema
export const ColorSchema = z.union([
  z.string().regex(hexPattern),
  z.string().regex(rgbPattern),
  z.string().regex(rgbaPattern),
  z.string().regex(hslPattern),
  z.string().regex(hslaPattern),
  z.enum(terminalColors),
]);

// Style options schema
export const StyleOptionsSchema = z
  .object({
    className: z.string().optional(),
    asciColor: ColorSchema.optional(),
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    dim: z.boolean().optional(),
    underline: z.boolean().optional(),
  })
  .strict();

// Pattern match schema
export const PatternMatchSchema = z
  .object({
    pattern: z.instanceof(RegExp),
    options: StyleOptionsSchema,
  })
  .strict();

// Word match schema
export const WordMatchSchema = z.record(StyleOptionsSchema);

// Main schema
export const Schema = z
  .object({
    matchWords: WordMatchSchema.optional(),
    matchPatterns: z.array(PatternMatchSchema).optional(),
    defaultStyle: StyleOptionsSchema.optional(),
    lineNumbers: z.boolean().optional(),
  })
  .strict();

// Theme preset schema
export const ThemePresetSchema = z
  .object({
    name: z.string(),
    schema: Schema,
  })
  .strict();

// Performance optimization: Pre-compile validation
export const compiledSchemaValidation = Schema.parse;
export const compiledThemeValidation = ThemePresetSchema.parse;

// Validation functions with caching
export const validationCache = new WeakMap<object, boolean>();

/**
 * Client-side validation with caching for better performance
 * @param schema The schema to validate
 * @returns Whether the schema is valid
 */
export function validateSchema(schema: unknown): boolean {
  if (!schema || typeof schema !== "object") return false;

  const cached = validationCache.get(schema as object);
  if (cached !== undefined) return cached;

  try {
    compiledSchemaValidation(schema);
    validationCache.set(schema as object, true);
    return true;
  } catch {
    validationCache.set(schema as object, false);
    return false;
  }
}

/**
 * Client-side validation for theme presets
 * @param theme The theme to validate
 * @returns Whether the theme is valid
 */
export function validateTheme(theme: unknown): boolean {
  if (!theme || typeof theme !== "object") return false;

  const cached = validationCache.get(theme as object);
  if (cached !== undefined) return cached;

  try {
    compiledThemeValidation(theme);
    validationCache.set(theme as object, true);
    return true;
  } catch {
    validationCache.set(theme as object, false);
    return false;
  }
}

/**
 * Server-side validation with detailed error reporting
 * @param schema The schema to validate
 * @returns Validation result with errors if invalid
 */
export function validateServerSchema(schema: unknown) {
  try {
    const result = Schema.safeParse(schema);
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      };
    }
    return { valid: true, schema: result.data };
  } catch (error) {
    return {
      valid: false,
      errors: [{ path: "root", message: "Invalid schema structure" }],
    };
  }
}

/**
 * Simple type checking for client-side validation
 * @param schema The schema to validate
 * @returns Whether the schema has the correct structure
 */
export function validateClientSchema(schema: unknown): boolean {
  if (!schema || typeof schema !== "object") return false;

  const s = schema as any;

  // Basic structural validation
  if (s.matchWords && typeof s.matchWords !== "object") return false;
  if (s.matchPatterns && !Array.isArray(s.matchPatterns)) return false;
  if (s.defaultStyle && typeof s.defaultStyle !== "object") return false;
  if (s.lineNumbers !== undefined && typeof s.lineNumbers !== "boolean")
    return false;

  return true;
}
