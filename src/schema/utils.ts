import type { z } from "zod";
import { COLOR_PATTERN } from "./constants";

/**
 * Validate color format
 * @param color - Color string to validate
 * @returns True if color is valid
 */
export function isValidColorFormat(color: string): boolean {
  return COLOR_PATTERN.test(color);
}

/**
 * Format Zod error issues into a readable message
 * @param issues - Array of Zod issues
 * @returns Formatted error message
 */
export function formatZodIssues(issues: ReadonlyArray<z.ZodIssue>): string {
  return issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");
}

/**
 * Create an enhanced validation error
 * @param message - Error message
 * @param cause - Original error
 * @returns Enhanced error with cause
 */
export function createValidationError(message: string, cause: Error): Error {
  const error = new Error(message);
  error.cause = cause;
  return error;
}

/**
 * Check if value is a Zod error
 * @param error - Error to check
 * @returns True if error is a Zod error
 */
export function isZodError(error: unknown): error is z.ZodError {
  return (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as z.ZodError).issues)
  );
}
