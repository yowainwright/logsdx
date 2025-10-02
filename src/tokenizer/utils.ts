import type { Token } from "../schema/types";

/**
 * Escape special regex characters in a pattern
 * @param pattern - The pattern to escape
 * @returns The escaped pattern
 */
export function escapeRegexPattern(pattern: string): string {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Check if a value is a valid object
 * @param value - The value to check
 * @returns True if value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Create a word boundary regex pattern
 * @param word - The word to match
 * @returns Regex pattern with word boundaries
 */
export function createWordBoundaryPattern(word: string): RegExp {
  const escapedWord = escapeRegexPattern(word);
  return new RegExp(`\\b${escapedWord}\\b`, "i");
}

/**
 * Extract style from token value
 * @param value - The token value
 * @returns Style object or undefined
 */
export function extractStyle(value: unknown): unknown | undefined {
  if (!isObject(value)) {
    return undefined;
  }
  return value.style;
}

/**
 * Extract pattern from token value
 * @param value - The token value
 * @returns Pattern string or undefined
 */
export function extractPattern(value: unknown): string | undefined {
  if (!isObject(value)) {
    return undefined;
  }
  const pattern = value.pattern;
  return typeof pattern === "string" ? pattern : undefined;
}

/**
 * Check if token has metadata style
 * @param token - The token to check
 * @returns True if token has style metadata
 */
export function hasStyleMetadata(token: Token): boolean {
  return Boolean(token.metadata?.style);
}

/**
 * Check if value represents trimmed whitespace
 * @param value - The token value to check
 * @returns True if trimmed
 */
export function isTrimmedWhitespace(value: unknown): boolean {
  if (!isObject(value)) {
    return false;
  }
  return Boolean(value.trimmed);
}

/**
 * Create a safe regex from pattern string
 * @param pattern - The pattern string
 * @returns RegExp or undefined if invalid
 */
export function createSafeRegex(pattern: string): RegExp | undefined {
  try {
    return new RegExp(pattern);
  } catch {
    return undefined;
  }
}

/**
 * Check if match patterns is a valid array
 * @param matchPatterns - The match patterns to validate
 * @returns True if valid array
 */
export function isValidMatchPatternsArray(matchPatterns: unknown): matchPatterns is Array<unknown> {
  return Array.isArray(matchPatterns);
}
