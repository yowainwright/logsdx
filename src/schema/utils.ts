import { COLOR_PATTERN } from "./constants";
import { ValidationError, isValidationError, formatValidationIssues } from "../lib/validate";

export function isValidColorFormat(color: string): boolean {
  return COLOR_PATTERN.test(color);
}

export function createValidationError(message: string, cause: Error): Error {
  const error = new Error(message);
  error.cause = cause;
  return error;
}

export { isValidationError, formatValidationIssues, ValidationError };
