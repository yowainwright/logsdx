import type { Token } from "../schema/types";

export function escapeRegexPattern(pattern: string): string {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function createWordBoundaryPattern(word: string): RegExp {
  const escapedWord = escapeRegexPattern(word);
  return new RegExp(`\\b${escapedWord}\\b`, "i");
}

export function extractStyle(value: unknown): unknown | undefined {
  if (!isObject(value)) {
    return undefined;
  }
  return value.style;
}

export function extractPattern(value: unknown): string | undefined {
  if (!isObject(value)) {
    return undefined;
  }
  const pattern = value.pattern;
  return typeof pattern === "string" ? pattern : undefined;
}

export function hasStyleMetadata(token: Token): boolean {
  return Boolean(token.metadata?.style);
}

export function isTrimmedWhitespace(value: unknown): boolean {
  if (!isObject(value)) {
    return false;
  }
  return Boolean(value.trimmed);
}

export function createSafeRegex(pattern: string): RegExp | undefined {
  try {
    return new RegExp(pattern);
  } catch {
    return undefined;
  }
}

export function isValidMatchPatternsArray(
  matchPatterns: unknown,
): matchPatterns is Array<unknown> {
  return Array.isArray(matchPatterns);
}
