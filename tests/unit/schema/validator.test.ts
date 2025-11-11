import { expect, test, describe } from "bun:test";
import {
  parseToken,
  parseTokenSafe,
  parseTokenList,
  parseTokenListSafe,
  validateTheme,
  validateThemeSafe,
  convertTokenSchemaToJson,
  convertThemeSchemaToJson,
} from "../../../src/schema/validator";
import { z } from "zod";

describe("Schema Validator", () => {
  describe("parseToken", () => {
    test("validates a valid token", () => {
      const validToken = {
        content: "error",
        metadata: {
          style: { color: "red" },
          matchType: "word",
        },
      };

      const result = parseToken(validToken);
      expect(result).toEqual(validToken);
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
      expect(result.error).toBeInstanceOf(z.ZodError);
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
      expect(result.error).toBeInstanceOf(z.ZodError);
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
      expect(result.error).toBeInstanceOf(z.ZodError);
    });
  });

  describe("convertTokenSchemaToJson", () => {
    test("converts token schema to JSON schema", () => {
      const jsonSchema = convertTokenSchemaToJson();

      expect(jsonSchema).toHaveProperty("$schema");

      expect(typeof jsonSchema).toBe("object");

      const hasNameReference = JSON.stringify(jsonSchema).includes("Token");
      expect(hasNameReference).toBe(true);
    });
  });

  describe("convertThemeSchemaToJson", () => {
    test("converts theme schema to JSON schema", () => {
      const jsonSchema = convertThemeSchemaToJson();

      expect(jsonSchema).toHaveProperty("$schema");

      expect(typeof jsonSchema).toBe("object");

      const hasNameReference = JSON.stringify(jsonSchema).includes("Theme");
      expect(hasNameReference).toBe(true);
    });
  });
});
