import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  tokenSchema,
  tokenListSchema,
  themePresetSchema,
} from "@/src/schema/index";
import { JsonSchemaOptions } from "@/src/schema/types";
import { Theme } from "@/src/types";

/**
 * Validates a token against the schema
 * @param token The token object to validate
 * @returns The validated token or throws an error
 */
export function validateToken(token: unknown): z.infer<typeof tokenSchema> {
  return tokenSchema.parse(token);
}

/**
 * Safely validates a token against the schema
 * @param token The token object to validate
 * @returns An object with success flag and either the validated data or error
 */
export function validateTokenSafe(token: unknown): {
  success: boolean;
  data?: z.infer<typeof tokenSchema>;
  error?: z.ZodError;
} {
  const result = tokenSchema.safeParse(token);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Validates a list of tokens against the schema
 * @param tokens The token list to validate
 * @returns The validated token list or throws an error
 */
export function validateTokenList(
  tokens: unknown
): z.infer<typeof tokenListSchema> {
  return tokenListSchema.parse(tokens);
}

/**
 * Safely validates a list of tokens against the schema
 * @param tokens The token list to validate
 * @returns An object with success flag and either the validated data or error
 */
export function validateTokenListSafe(tokens: unknown): {
  success: boolean;
  data?: z.infer<typeof tokenListSchema>;
  error?: z.ZodError;
} {
  const result = tokenListSchema.safeParse(tokens);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Converts the token schema to JSON Schema format for documentation
 * @returns JSON Schema representation of the token schema
 */
export function tokenSchemaToJsonSchema() {
  return zodToJsonSchema(tokenSchema, {
    name: "Token",
    description: "Schema for tokens in the LogsDX styling system",
  } as JsonSchemaOptions);
}

/**
 * Validates a theme configuration
 * @param theme The theme configuration to validate
 * @returns The validated theme configuration or throws an error
 */
export function validateTheme(theme: unknown): Theme {
  return themePresetSchema.parse(theme) as Theme;
}

/**
 * Safely validates a theme configuration
 * @param theme The theme configuration to validate
 * @returns An object with success flag and either the validated data or error
 */
export function validateThemeSafe(theme: unknown): {
  success: boolean;
  data?: Theme;
  error?: z.ZodError;
} {
  const result = themePresetSchema.safeParse(theme);
  if (result.success) {
    return { success: true, data: result.data as Theme };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Converts the theme schema to JSON Schema format for documentation
 * @returns JSON Schema representation of the theme schema
 */
export function themeSchemaToJsonSchema() {
  return zodToJsonSchema(themePresetSchema, {
    name: "Theme",
    description: "Schema for themes in the LogsDX styling system",
  } as JsonSchemaOptions);
}
