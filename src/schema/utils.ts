import type { z } from "zod";
import { COLOR_PATTERN } from "./constants";

export function isValidColorFormat(color: string): boolean {
  return COLOR_PATTERN.test(color);
}

export function formatZodIssues(issues: ReadonlyArray<z.ZodIssue>): string {
  return issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");
}

export function createValidationError(message: string, cause: Error): Error {
  const error = new Error(message);
  error.cause = cause;
  return error;
}

export function isZodError(error: unknown): error is z.ZodError {
  return (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as z.ZodError).issues)
  );
}
