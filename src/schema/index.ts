type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ValidationError };

export class ValidationError extends Error {
  constructor(
    message: string,
    public path: string[] = [],
    public issues: { path: string[]; message: string }[] = [],
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

type Validator<T> = {
  parse: (value: unknown) => T;
  safeParse: (value: unknown) => ValidationResult<T>;
  optional: () => Validator<T | undefined>;
};

function createValidator<T>(
  validate: (value: unknown, path: string[]) => T,
): Validator<T> {
  return {
    parse(value: unknown): T {
      return validate(value, []);
    },
    safeParse(value: unknown): ValidationResult<T> {
      try {
        return { success: true, data: validate(value, []) };
      } catch (e) {
        return { success: false, error: e as ValidationError };
      }
    },
    optional(): Validator<T | undefined> {
      return createValidator((v, path) =>
        v === undefined ? undefined : validate(v, path),
      );
    },
  };
}

function fail(message: string, path: string[]): never {
  throw new ValidationError(message, path, [{ path, message }]);
}

export const v = {
  string(): Validator<string> {
    return createValidator((value, path) => {
      if (typeof value !== "string")
        fail(`Expected string, got ${typeof value}`, path);
      return value;
    });
  },

  number(): Validator<number> {
    return createValidator((value, path) => {
      if (typeof value !== "number")
        fail(`Expected number, got ${typeof value}`, path);
      return value;
    });
  },

  boolean(): Validator<boolean> {
    return createValidator((value, path) => {
      if (typeof value !== "boolean")
        fail(`Expected boolean, got ${typeof value}`, path);
      return value;
    });
  },

  literal<T extends string | number | boolean>(expected: T): Validator<T> {
    return createValidator((value, path) => {
      if (value !== expected)
        fail(`Expected ${String(expected)}, got ${String(value)}`, path);
      return expected;
    });
  },

  enum<T extends string>(values: readonly T[]): Validator<T> {
    return createValidator((value, path) => {
      if (typeof value !== "string" || !values.includes(value as T)) {
        fail(`Expected one of: ${values.join(", ")}`, path);
      }
      return value as T;
    });
  },

  array<T>(itemValidator: Validator<T>): Validator<T[]> {
    return createValidator((value, path) => {
      if (!Array.isArray(value)) fail("Expected array", path);
      return value.map((item) => itemValidator.parse(item));
    });
  },

  object<T extends Record<string, Validator<unknown>>>(
    shape: T,
  ): Validator<{
    [K in keyof T]: T[K] extends Validator<infer U> ? U : never;
  }> {
    return createValidator((value, path) => {
      if (typeof value !== "object" || value === null)
        fail("Expected object", path);
      const obj = value as Record<string, unknown>;
      const parseEntry = ([key, validator]: [string, Validator<unknown>]) => {
        try {
          return [key, validator.parse(obj[key])] as const;
        } catch (e) {
          if (e instanceof ValidationError) fail(e.message, [...path, key]);
          throw e;
        }
      };
      const entries = Object.entries(shape).map(parseEntry);
      return Object.fromEntries(entries) as {
        [K in keyof T]: T[K] extends Validator<infer U> ? U : never;
      };
    });
  },

  record<T>(valueValidator: Validator<T>): Validator<Record<string, T>> {
    return createValidator((value, path) => {
      if (typeof value !== "object" || value === null)
        fail("Expected object", path);
      const entries = Object.entries(value).map(
        ([k, val]) => [k, valueValidator.parse(val)] as const,
      );
      return Object.fromEntries(entries) as Record<string, T>;
    });
  },

  union<T extends Validator<unknown>[]>(
    ...validators: T
  ): Validator<T[number] extends Validator<infer U> ? U : never> {
    type ResultType = T[number] extends Validator<infer U> ? U : never;
    return createValidator((value, path) => {
      const results = validators.map((validator) => validator.safeParse(value));
      const match = results.find((r) => r.success);
      if (!match) fail("Value did not match any variant", path);
      return match.data as ResultType;
    });
  },

  refine<T>(
    validator: Validator<T>,
    check: (value: T) => boolean,
    message: string,
  ): Validator<T> {
    return createValidator((value, path) => {
      const parsed = validator.parse(value);
      if (!check(parsed)) fail(message, path);
      return parsed;
    });
  },

  withDefault<T>(validator: Validator<T>, defaultValue: T): Validator<T> {
    return createValidator((value) => {
      if (value === undefined) return defaultValue;
      return validator.parse(value);
    });
  },
};

export function isValidationError(error: unknown): error is ValidationError {
  return (
    error instanceof ValidationError ||
    (typeof error === "object" &&
      error !== null &&
      "issues" in error &&
      Array.isArray((error as ValidationError).issues))
  );
}

export function formatValidationIssues(
  issues: { path: string[]; message: string }[],
): string {
  return issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");
}

import {
  COLOR_VALIDATION_MESSAGE,
  STYLE_CODES,
  WHITESPACE_OPTIONS,
  NEWLINE_OPTIONS,
  THEME_MODES,
  HTML_STYLE_FORMATS,
  DEFAULT_WHITESPACE,
  DEFAULT_NEWLINE,
  TOKEN_SCHEMA_NAME,
  TOKEN_SCHEMA_DESCRIPTION,
  THEME_SCHEMA_NAME,
  THEME_SCHEMA_DESCRIPTION,
} from "./constants";
import { isValidColorFormat } from "./utils";
import type { StyleOptions, Theme } from "../types";

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

const tokenMetadataValidator = v
  .object({
    style: styleOptionsValidator.optional(),
  })
  .optional();

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

export function parseTokenSafe(token: unknown): {
  success: boolean;
  data?: Token;
  error?: ValidationError;
} {
  const result = tokenValidator.safeParse(token);
  if (result.success) return { success: true, data: result.data as Token };
  return { success: false, error: result.error };
}

export function parseTokenList(tokens: unknown): TokenList {
  return tokenListValidator.parse(tokens) as TokenList;
}

export function parseTokenListSafe(tokens: unknown): {
  success: boolean;
  data?: TokenList;
  error?: ValidationError;
} {
  const result = tokenListValidator.safeParse(tokens);
  if (result.success) return { success: true, data: result.data as TokenList };
  return { success: false, error: result.error };
}

export function parseTheme(theme: unknown): Theme {
  return themePresetValidator.parse(theme) as Theme;
}

export function parseThemeSafe(theme: unknown): {
  success: boolean;
  data?: Theme;
  error?: ValidationError;
} {
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

export function validateThemeSafe(theme: unknown): {
  success: boolean;
  data?: Theme;
  error?: ValidationError;
} {
  return parseThemeSafe(theme);
}

export type { JsonSchemaOptions } from "./types";

export function createTokenJsonSchemaOptions() {
  return { name: TOKEN_SCHEMA_NAME, description: TOKEN_SCHEMA_DESCRIPTION };
}

export function createThemeJsonSchemaOptions() {
  return { name: THEME_SCHEMA_NAME, description: THEME_SCHEMA_DESCRIPTION };
}
