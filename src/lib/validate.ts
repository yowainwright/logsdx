type ValidationResult<T> = { success: true; data: T } | { success: false; error: ValidationError };

export class ValidationError extends Error {
  constructor(
    message: string,
    public path: string[] = [],
    public issues: { path: string[]; message: string }[] = []
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

function createValidator<T>(validate: (value: unknown, path: string[]) => T): Validator<T> {
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
      return createValidator((v, path) => (v === undefined ? undefined : validate(v, path)));
    },
  };
}

function fail(message: string, path: string[]): never {
  throw new ValidationError(message, path, [{ path, message }]);
}

export const v = {
  string(): Validator<string> {
    return createValidator((value, path) => {
      if (typeof value !== "string") fail(`Expected string, got ${typeof value}`, path);
      return value;
    });
  },

  number(): Validator<number> {
    return createValidator((value, path) => {
      if (typeof value !== "number") fail(`Expected number, got ${typeof value}`, path);
      return value;
    });
  },

  boolean(): Validator<boolean> {
    return createValidator((value, path) => {
      if (typeof value !== "boolean") fail(`Expected boolean, got ${typeof value}`, path);
      return value;
    });
  },

  literal<T extends string | number | boolean>(expected: T): Validator<T> {
    return createValidator((value, path) => {
      if (value !== expected) fail(`Expected ${String(expected)}, got ${String(value)}`, path);
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
      return value.map((item, i) => itemValidator.parse(item));
    });
  },

  object<T extends Record<string, Validator<unknown>>>(
    shape: T
  ): Validator<{ [K in keyof T]: T[K] extends Validator<infer U> ? U : never }> {
    return createValidator((value, path) => {
      if (typeof value !== "object" || value === null) fail("Expected object", path);
      const result: Record<string, unknown> = {};
      const obj = value as Record<string, unknown>;

      for (const [key, validator] of Object.entries(shape)) {
        try {
          result[key] = validator.parse(obj[key]);
        } catch (e) {
          if (e instanceof ValidationError) {
            fail(e.message, [...path, key]);
          }
          throw e;
        }
      }
      return result as { [K in keyof T]: T[K] extends Validator<infer U> ? U : never };
    });
  },

  record<T>(valueValidator: Validator<T>): Validator<Record<string, T>> {
    return createValidator((value, path) => {
      if (typeof value !== "object" || value === null) fail("Expected object", path);
      const result: Record<string, T> = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = valueValidator.parse(val);
      }
      return result;
    });
  },

  union<T extends Validator<unknown>[]>(
    ...validators: T
  ): Validator<T[number] extends Validator<infer U> ? U : never> {
    return createValidator((value, path) => {
      for (const validator of validators) {
        const result = validator.safeParse(value);
        if (result.success) return result.data as T[number] extends Validator<infer U> ? U : never;
      }
      fail("Value did not match any variant", path);
    });
  },

  refine<T>(validator: Validator<T>, check: (value: T) => boolean, message: string): Validator<T> {
    return createValidator((value, path) => {
      const parsed = validator.parse(value);
      if (!check(parsed)) fail(message, path);
      return parsed;
    });
  },

  withDefault<T>(validator: Validator<T>, defaultValue: T): Validator<T> {
    return createValidator((value, path) => {
      if (value === undefined) return defaultValue;
      return validator.parse(value);
    });
  },
};

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError || (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as ValidationError).issues)
  );
}

export function formatValidationIssues(issues: { path: string[]; message: string }[]): string {
  return issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
}
