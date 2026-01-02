import { v, ValidationError, isValidationError, formatValidationIssues } from "../lib/validate";
import {
  COLOR_VALIDATION_MESSAGE,
  STYLE_CODES,
  WHITESPACE_OPTIONS,
  NEWLINE_OPTIONS,
  THEME_MODES,
  HTML_STYLE_FORMATS,
  DEFAULT_WHITESPACE,
  DEFAULT_NEWLINE,
} from "./constants";
import { isValidColorFormat } from "./utils";
import type { StyleOptions, PatternMatch, SchemaConfig, Theme } from "../types";

const styleOptionsValidator = v.object({
  color: v.refine(v.string(), isValidColorFormat, COLOR_VALIDATION_MESSAGE),
  styleCodes: v.array(v.enum(STYLE_CODES)).optional(),
  htmlStyleFormat: v.enum(HTML_STYLE_FORMATS).optional(),
});

const patternMatchValidator = v.object({
  name: v.string(),
  pattern: v.string(),
  options: styleOptionsValidator,
});

const schemaConfigValidator = v.object({
  defaultStyle: styleOptionsValidator.optional(),
  matchWords: v.record(styleOptionsValidator).optional(),
  matchStartsWith: v.record(styleOptionsValidator).optional(),
  matchEndsWith: v.record(styleOptionsValidator).optional(),
  matchContains: v.record(styleOptionsValidator).optional(),
  matchPatterns: v.array(patternMatchValidator).optional(),
  whiteSpace: v.withDefault(v.enum(WHITESPACE_OPTIONS), DEFAULT_WHITESPACE),
  newLine: v.withDefault(v.enum(NEWLINE_OPTIONS), DEFAULT_NEWLINE),
});

const themePresetValidator = v.object({
  name: v.string(),
  description: v.string().optional(),
  mode: v.enum(THEME_MODES).optional(),
  schema: schemaConfigValidator,
});

const tokenMetadataValidator = v.object({
  style: styleOptionsValidator.optional(),
}).optional();

const tokenValidator = v.object({
  content: v.string(),
  metadata: tokenMetadataValidator,
});

const tokenListValidator = v.array(tokenValidator);

export type TokenMetadata = {
  style?: StyleOptions;
  matchType?: string;
  matchPattern?: string;
  pattern?: string | RegExp;
  trimmed?: boolean;
  originalLength?: number;
};

export type Token = { content: string; metadata?: TokenMetadata };
export type TokenList = Token[];

export function parseToken(token: unknown): Token {
  return tokenValidator.parse(token) as Token;
}

export function parseTokenSafe(token: unknown): { success: boolean; data?: Token; error?: ValidationError } {
  const result = tokenValidator.safeParse(token);
  if (result.success) return { success: true, data: result.data as Token };
  return { success: false, error: result.error };
}

export function parseTokenList(tokens: unknown): TokenList {
  return tokenListValidator.parse(tokens) as TokenList;
}

export function parseTokenListSafe(tokens: unknown): { success: boolean; data?: TokenList; error?: ValidationError } {
  const result = tokenListValidator.safeParse(tokens);
  if (result.success) return { success: true, data: result.data as TokenList };
  return { success: false, error: result.error };
}

export function parseTheme(theme: unknown): Theme {
  return themePresetValidator.parse(theme) as Theme;
}

export function parseThemeSafe(theme: unknown): { success: boolean; data?: Theme; error?: ValidationError } {
  const result = themePresetValidator.safeParse(theme);
  if (result.success) return { success: true, data: result.data as Theme };
  return { success: false, error: result.error };
}

export function createThemeValidationError(error: unknown): Error {
  if (!isValidationError(error)) {
    return error instanceof Error ? error : new Error(String(error));
  }
  const message = `Theme validation failed: ${formatValidationIssues(error.issues)}`;
  const err = new Error(message);
  err.cause = error;
  return err;
}

export function validateTheme(theme: unknown): Theme {
  try {
    return parseTheme(theme);
  } catch (error) {
    throw createThemeValidationError(error);
  }
}

export function validateThemeSafe(theme: unknown): { success: boolean; data?: Theme; error?: ValidationError } {
  return parseThemeSafe(theme);
}

export { isValidationError, formatValidationIssues, ValidationError };
