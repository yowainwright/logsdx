import { expect, test, describe } from "bun:test";
import {
  parseToken,
  parseTokenSafe,
  parseTokenList,
  parseTokenListSafe,
  validateTheme,
  validateThemeSafe,
  createThemeValidationError,
  ValidationError,
} from "../../../src/schema";

describe("Schema Validator", () => {
  describe("parseToken", () => {
    test("validates a valid token", () => {
      const validToken = {
        content: "error",
        metadata: {
          style: { color: "red" },
        },
      };

      const result = parseToken(validToken);
      expect(result.content).toBe("error");
      expect(result.metadata?.style?.color).toBe("red");
    });

    test("throws on invalid token", () => {
      const invalidToken = {
        metadata: { style: { color: "red" } },
      };

      expect(() => parseToken(invalidToken)).toThrow();
    });
  });

  describe("parseTokenSafe", () => {
    test("returns success for valid token", () => {
      const validToken = {
        content: "error",
        metadata: {
          style: { color: "red" },
        },
      };

      const result = parseTokenSafe(validToken);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validToken);
    });

    test("returns error for invalid token", () => {
      const invalidToken = {
        metadata: { style: { color: "red" } },
      };

      const result = parseTokenSafe(invalidToken);
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ValidationError);
    });
  });

  describe("parseTokenList", () => {
    test("validates a valid token list", () => {
      const validList = [
        { content: "error", metadata: { style: { color: "red" } } },
        { content: " message", metadata: { style: { color: "white" } } },
      ];

      const result = parseTokenList(validList);
      expect(result).toEqual(validList);
    });

    test("throws on invalid token list", () => {
      const invalidList = [
        { content: "valid" },
        { invalidProp: "not a token" },
      ];

      expect(() => parseTokenList(invalidList)).toThrow();
    });
  });

  describe("parseTokenListSafe", () => {
    test("returns success for valid token list", () => {
      const validList = [
        { content: "error", metadata: { style: { color: "red" } } },
        { content: " message", metadata: { style: { color: "white" } } },
      ];

      const result = parseTokenListSafe(validList);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validList);
    });

    test("returns error for invalid token list", () => {
      const invalidList = [
        { content: "valid" },
        { invalidProp: "not a token" },
      ];

      const result = parseTokenListSafe(invalidList);
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ValidationError);
    });
  });

  describe("validateTheme", () => {
    test("validates a valid theme", () => {
      const validTheme = {
        name: "Dark Theme",
        description: "A dark theme for logs",
        schema: {
          defaultStyle: { color: "white" },
          matchWords: { error: { color: "red" } },
          whiteSpace: "preserve" as const,
          newLine: "preserve" as const,
        },
      };

      const result = validateTheme(validTheme);
      expect(result).toEqual(validTheme);
    });

    test("throws on invalid theme", () => {
      const invalidTheme = {
        name: "Dark Theme",
      };

      expect(() => validateTheme(invalidTheme)).toThrow();
    });
  });

  describe("validateThemeSafe", () => {
    test("returns success for valid theme", () => {
      const validTheme = {
        name: "Dark Theme",
        description: "A dark theme for logs",
        schema: {
          defaultStyle: { color: "white" },
          matchWords: { error: { color: "red" } },
          whiteSpace: "preserve" as const,
          newLine: "preserve" as const,
        },
      };

      const result = validateThemeSafe(validTheme);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validTheme);
    });

    test("returns error for invalid theme", () => {
      const invalidTheme = {
        name: "Dark Theme",
      };

      const result = validateThemeSafe(invalidTheme);
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ValidationError);
    });
  });

  describe("createThemeValidationError", () => {
    test("returns Error object as is when given Error", () => {
      const originalError = new Error("Custom error message");

      const result = createThemeValidationError(originalError);

      expect(result).toBe(originalError);
      expect(result.message).toBe("Custom error message");
    });

    test("converts string to Error when given string", () => {
      const errorString = "Something went wrong";

      const result = createThemeValidationError(errorString);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("Something went wrong");
    });

    test("converts number to Error when given number", () => {
      const errorNumber = 404;

      const result = createThemeValidationError(errorNumber);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("404");
    });

    test("formats ValidationError with validation message", () => {
      const invalidTheme = {
        name: "test",
      };

      try {
        validateTheme(invalidTheme);
      } catch (error) {
        const result = createThemeValidationError(error);

        expect(result).toBeInstanceOf(Error);
        expect(result.message).toContain("Theme validation failed");
      }
    });
  });
});
