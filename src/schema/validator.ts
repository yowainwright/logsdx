import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { tokenSchema, tokenListSchema, themePresetSchema } from "./index";
import type { JsonSchemaOptions } from "./types";
import type { Theme } from "../types";
import {
  TOKEN_SCHEMA_NAME,
  TOKEN_SCHEMA_DESCRIPTION,
  THEME_SCHEMA_NAME,
  THEME_SCHEMA_DESCRIPTION,
} from "./constants";
import { formatZodIssues, createValidationError, isZodError } from "./utils";

export function parseToken(token: unknown): z.infer<typeof tokenSchema> {
  return tokenSchema.parse(token);
}

export function parseTokenSafe(token: unknown): {
  success: boolean;
  data?: z.infer<typeof tokenSchema>;
  error?: z.ZodError;
} {
  const result = tokenSchema.safeParse(token);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

export function parseTokenList(
  tokens: unknown,
): z.infer<typeof tokenListSchema> {
  return tokenListSchema.parse(tokens);
}

export function parseTokenListSafe(tokens: unknown): {
  success: boolean;
  data?: z.infer<typeof tokenListSchema>;
  error?: z.ZodError;
} {
  const result = tokenListSchema.safeParse(tokens);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

export function createTokenJsonSchemaOptions(): JsonSchemaOptions {
  return {
    name: TOKEN_SCHEMA_NAME,
    description: TOKEN_SCHEMA_DESCRIPTION,
  };
}

export function convertTokenSchemaToJson() {
  const options = createTokenJsonSchemaOptions();
  return zodToJsonSchema(tokenSchema, options);
}

export function parseTheme(theme: unknown): Theme {
  return themePresetSchema.parse(theme) as Theme;
}

export function parseThemeSafe(theme: unknown): {
  success: boolean;
  data?: Theme;
  error?: z.ZodError;
} {
  const result = themePresetSchema.safeParse(theme);

  if (result.success) {
    return { success: true, data: result.data as Theme };
  }

  return { success: false, error: result.error };
}

export function createThemeValidationError(error: unknown): Error {
  if (!isZodError(error)) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(String(error));
  }

  const message = `Theme validation failed: ${formatZodIssues(error.issues)}`;
  return createValidationError(message, error);
}

/**
 * Validates a theme configuration with enhanced error messages
 * @param theme The theme configuration to validate
 * @returns The validated theme configuration or throws an error
 */
export function validateTheme(theme: unknown): Theme {
  try {
    return parseTheme(theme);
  } catch (error) {
    throw createThemeValidationError(error);
  }
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
  return parseThemeSafe(theme);
}

export function createThemeJsonSchemaOptions(): JsonSchemaOptions {
  return {
    name: THEME_SCHEMA_NAME,
    description: THEME_SCHEMA_DESCRIPTION,
  };
}

export function convertThemeSchemaToJson() {
  const options = createThemeJsonSchemaOptions();
  return zodToJsonSchema(themePresetSchema, options);
}
