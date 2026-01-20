import { describe, it, expect } from "bun:test";
import {
  v,
  ValidationError,
  isValidationError,
  formatValidationIssues,
} from "../../../src/lib/validate";

describe("ValidationError", () => {
  it("should create error with message", () => {
    const error = new ValidationError("test error");
    expect(error.message).toBe("test error");
    expect(error.name).toBe("ValidationError");
    expect(error.path).toEqual([]);
    expect(error.issues).toEqual([]);
  });

  it("should create error with path and issues", () => {
    const issues = [{ path: ["a", "b"], message: "error" }];
    const error = new ValidationError("test error", ["a", "b"], issues);
    expect(error.path).toEqual(["a", "b"]);
    expect(error.issues).toEqual(issues);
  });
});

describe("v.string()", () => {
  it("should parse valid string", () => {
    const result = v.string().parse("hello");
    expect(result).toBe("hello");
  });

  it("should throw for non-string", () => {
    expect(() => v.string().parse(123)).toThrow("Expected string, got number");
  });

  it("should return success for safeParse with valid string", () => {
    const result = v.string().safeParse("hello");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("hello");
    }
  });

  it("should return error for safeParse with invalid value", () => {
    const result = v.string().safeParse(123);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });
});

describe("v.number()", () => {
  it("should parse valid number", () => {
    const result = v.number().parse(42);
    expect(result).toBe(42);
  });

  it("should throw for non-number", () => {
    expect(() => v.number().parse("42")).toThrow("Expected number, got string");
  });
});

describe("v.boolean()", () => {
  it("should parse valid boolean", () => {
    expect(v.boolean().parse(true)).toBe(true);
    expect(v.boolean().parse(false)).toBe(false);
  });

  it("should throw for non-boolean", () => {
    expect(() => v.boolean().parse("true")).toThrow(
      "Expected boolean, got string",
    );
  });
});

describe("v.literal()", () => {
  it("should parse matching literal", () => {
    expect(v.literal("hello").parse("hello")).toBe("hello");
    expect(v.literal(42).parse(42)).toBe(42);
    expect(v.literal(true).parse(true)).toBe(true);
  });

  it("should throw for non-matching literal", () => {
    expect(() => v.literal("hello").parse("world")).toThrow(
      "Expected hello, got world",
    );
  });
});

describe("v.optional()", () => {
  it("should return undefined for undefined value", () => {
    const result = v.string().optional().parse(undefined);
    expect(result).toBeUndefined();
  });

  it("should parse valid value", () => {
    const result = v.string().optional().parse("hello");
    expect(result).toBe("hello");
  });

  it("should throw for invalid value", () => {
    expect(() => v.string().optional().parse(123)).toThrow();
  });
});

describe("v.enum()", () => {
  it("should parse valid enum value", () => {
    const validator = v.enum(["a", "b", "c"] as const);
    expect(validator.parse("a")).toBe("a");
    expect(validator.parse("b")).toBe("b");
  });

  it("should throw for invalid enum value", () => {
    const validator = v.enum(["a", "b", "c"] as const);
    expect(() => validator.parse("d")).toThrow("Expected one of: a, b, c");
  });

  it("should throw for non-string value", () => {
    const validator = v.enum(["a", "b"] as const);
    expect(() => validator.parse(123)).toThrow("Expected one of: a, b");
  });
});

describe("v.array()", () => {
  it("should parse valid array", () => {
    const validator = v.array(v.string());
    expect(validator.parse(["a", "b"])).toEqual(["a", "b"]);
  });

  it("should throw for non-array", () => {
    const validator = v.array(v.string());
    expect(() => validator.parse("not array")).toThrow("Expected array");
  });

  it("should throw for array with invalid items", () => {
    const validator = v.array(v.string());
    expect(() => validator.parse(["a", 123, "b"])).toThrow();
  });

  it("should handle empty array", () => {
    const validator = v.array(v.string());
    expect(validator.parse([])).toEqual([]);
  });
});

describe("v.object()", () => {
  it("should parse valid object", () => {
    const validator = v.object({
      name: v.string(),
      age: v.number(),
    });
    const result = validator.parse({ name: "John", age: 30 });
    expect(result).toEqual({ name: "John", age: 30 });
  });

  it("should throw for non-object", () => {
    const validator = v.object({ name: v.string() });
    expect(() => validator.parse("not object")).toThrow("Expected object");
  });

  it("should throw for null", () => {
    const validator = v.object({ name: v.string() });
    expect(() => validator.parse(null)).toThrow("Expected object");
  });

  it("should throw with path for nested validation error", () => {
    const validator = v.object({
      user: v.object({
        name: v.string(),
      }),
    });
    expect(() => validator.parse({ user: { name: 123 } })).toThrow();
  });

  it("should handle optional fields", () => {
    const validator = v.object({
      name: v.string(),
      age: v.number().optional(),
    });
    const result = validator.parse({ name: "John" });
    expect(result).toEqual({ name: "John", age: undefined });
  });
});

describe("v.record()", () => {
  it("should parse valid record", () => {
    const validator = v.record(v.number());
    const result = validator.parse({ a: 1, b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("should throw for non-object", () => {
    const validator = v.record(v.string());
    expect(() => validator.parse("not object")).toThrow("Expected object");
  });

  it("should throw for null", () => {
    const validator = v.record(v.string());
    expect(() => validator.parse(null)).toThrow("Expected object");
  });

  it("should throw for invalid record values", () => {
    const validator = v.record(v.string());
    expect(() => validator.parse({ a: "valid", b: 123 })).toThrow();
  });

  it("should handle empty record", () => {
    const validator = v.record(v.string());
    expect(validator.parse({})).toEqual({});
  });
});

describe("v.union()", () => {
  it("should parse first matching variant", () => {
    const validator = v.union(v.string(), v.number());
    expect(validator.parse("hello")).toBe("hello");
    expect(validator.parse(42)).toBe(42);
  });

  it("should throw when no variant matches", () => {
    const validator = v.union(v.string(), v.number());
    expect(() => validator.parse(true)).toThrow(
      "Value did not match any variant",
    );
  });

  it("should handle complex union types", () => {
    const validator = v.union(
      v.object({ type: v.literal("a"), value: v.string() }),
      v.object({ type: v.literal("b"), value: v.number() }),
    );
    expect(validator.parse({ type: "a", value: "hello" })).toEqual({
      type: "a",
      value: "hello",
    });
    expect(validator.parse({ type: "b", value: 42 })).toEqual({
      type: "b",
      value: 42,
    });
  });
});

describe("v.refine()", () => {
  it("should pass when refinement check passes", () => {
    const validator = v.refine(
      v.string(),
      (s) => s.length >= 3,
      "Must be at least 3 characters",
    );
    expect(validator.parse("hello")).toBe("hello");
  });

  it("should throw when refinement check fails", () => {
    const validator = v.refine(
      v.string(),
      (s) => s.length >= 3,
      "Must be at least 3 characters",
    );
    expect(() => validator.parse("hi")).toThrow(
      "Must be at least 3 characters",
    );
  });

  it("should throw base validator error first", () => {
    const validator = v.refine(
      v.string(),
      (s) => s.length >= 3,
      "Must be at least 3 characters",
    );
    expect(() => validator.parse(123)).toThrow("Expected string, got number");
  });
});

describe("v.withDefault()", () => {
  it("should return default value for undefined", () => {
    const validator = v.withDefault(v.string(), "default");
    expect(validator.parse(undefined)).toBe("default");
  });

  it("should parse provided value", () => {
    const validator = v.withDefault(v.string(), "default");
    expect(validator.parse("hello")).toBe("hello");
  });

  it("should throw for invalid non-undefined value", () => {
    const validator = v.withDefault(v.string(), "default");
    expect(() => validator.parse(123)).toThrow();
  });
});

describe("isValidationError()", () => {
  it("should return true for ValidationError instance", () => {
    const error = new ValidationError("test");
    expect(isValidationError(error)).toBe(true);
  });

  it("should return true for error-like object with issues array", () => {
    const errorLike = { issues: [] };
    expect(isValidationError(errorLike)).toBe(true);
  });

  it("should return false for non-error objects", () => {
    expect(isValidationError("error")).toBe(false);
    expect(isValidationError(null)).toBe(false);
    expect(isValidationError(undefined)).toBe(false);
    expect(isValidationError({})).toBe(false);
    expect(isValidationError({ issues: "not array" })).toBe(false);
  });
});

describe("formatValidationIssues()", () => {
  it("should format single issue", () => {
    const issues = [{ path: ["user", "name"], message: "Required" }];
    expect(formatValidationIssues(issues)).toBe("user.name: Required");
  });

  it("should format multiple issues", () => {
    const issues = [
      { path: ["a"], message: "Error 1" },
      { path: ["b", "c"], message: "Error 2" },
    ];
    expect(formatValidationIssues(issues)).toBe("a: Error 1, b.c: Error 2");
  });

  it("should handle empty path", () => {
    const issues = [{ path: [], message: "Root error" }];
    expect(formatValidationIssues(issues)).toBe(": Root error");
  });

  it("should handle empty issues array", () => {
    expect(formatValidationIssues([])).toBe("");
  });
});
