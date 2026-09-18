import type { Token } from "../schema/types";
import { createLogger } from "../utils/logger";

const log = createLogger("tokenizer:utils");

export function escapeRegexPattern(pattern: string): string {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isObject(value: unknown): value is Record<string, unknown> {
  const isObjectValue = typeof value === "object";
  const isNonNull = value !== null;
  return isObjectValue && isNonNull;
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
  const isStringPattern = typeof pattern === "string";
  if (!isStringPattern) {
    return undefined;
  }
  return pattern;
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
  } catch (error) {
    log.debug(`Invalid regex pattern "${pattern}": ${error}`);
    return undefined;
  }
}

export function isValidMatchPatternsArray(
  matchPatterns: unknown,
): matchPatterns is Array<unknown> {
  return Array.isArray(matchPatterns);
}
