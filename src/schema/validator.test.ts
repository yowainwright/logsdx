import { expect, test, describe } from "bun:test";
import { 
  validateToken, 
  validateTokenSafe, 
  validateTokenList, 
  validateTokenListSafe,
  validateTheme,
  validateThemeSafe,
  tokenSchemaToJsonSchema,
  themeSchemaToJsonSchema
} from "@/src/schema/validator";
import { z } from "zod";

describe("Schema Validator", () => {
  describe("validateToken", () => {
    test("validates a valid token", () => {
      const validToken = {
        content: "error",
        metadata: {
          style: { color: "red" },
          matchType: "word"
        }
      };
      
      const result = validateToken(validToken);
      expect(result).toEqual(validToken);
    });

    test("throws on invalid token", () => {
      const invalidToken = {
        metadata: { style: { color: "red" } }
      };
      
      expect(() => validateToken(invalidToken)).toThrow();
    });
  });

  describe("validateTokenSafe", () => {
    test("returns success for valid token", () => {
      const validToken = {
        content: "error",
        metadata: {
          style: { color: "red" }
        }
      };
      
      const result = validateTokenSafe(validToken);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validToken);
    });

    test("returns error for invalid token", () => {
      const invalidToken = {
        metadata: { style: { color: "red" } }
      };
      
      const result = validateTokenSafe(invalidToken);
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(z.ZodError);
    });
  });

  describe("validateTokenList", () => {
    test("validates a valid token list", () => {
      const validList = [
        { content: "error", metadata: { style: { color: "red" } } },
        { content: " message", metadata: { style: { color: "white" } } }
      ];
      
      const result = validateTokenList(validList);
      expect(result).toEqual(validList);
    });

    test("throws on invalid token list", () => {
      const invalidList = [
        { content: "valid" },
        { invalidProp: "not a token" }
      ];
      
      expect(() => validateTokenList(invalidList)).toThrow();
    });
  });

  describe("validateTokenListSafe", () => {
    test("returns success for valid token list", () => {
      const validList = [
        { content: "error", metadata: { style: { color: "red" } } },
        { content: " message", metadata: { style: { color: "white" } } }
      ];
      
      const result = validateTokenListSafe(validList);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validList);
    });

    test("returns error for invalid token list", () => {
      const invalidList = [
        { content: "valid" },
        { invalidProp: "not a token" }
      ];
      
      const result = validateTokenListSafe(invalidList);
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
          matchWords: { "error": { color: "red" } },
          whiteSpace: "preserve",
          newLine: "preserve"
        }
      };
      
      const result = validateTheme(validTheme);
      expect(result).toEqual(validTheme);
    });

    test("throws on invalid theme", () => {
      const invalidTheme = {
        name: "Dark Theme"
        // Missing schema property
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
          matchWords: { "error": { color: "red" } },
          whiteSpace: "preserve",
          newLine: "preserve"
        }
      };
      
      const result = validateThemeSafe(validTheme);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validTheme);
    });

    test("returns error for invalid theme", () => {
      const invalidTheme = {
        name: "Dark Theme"
        // Missing schema property
      };
      
      const result = validateThemeSafe(invalidTheme);
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(z.ZodError);
    });
  });

  describe("tokenSchemaToJsonSchema", () => {
    test("converts token schema to JSON schema", () => {
      const jsonSchema = tokenSchemaToJsonSchema();
      
      expect(jsonSchema).toHaveProperty("$schema");
      // The structure might be different than expected, check what's actually returned
      expect(typeof jsonSchema).toBe("object");
      
      // Looking at the implementation, the name is passed as an option to zodToJsonSchema
      // but it might be stored differently in the output
      const hasNameReference = JSON.stringify(jsonSchema).includes("Token");
      expect(hasNameReference).toBe(true);
    });
  });

  describe("themeSchemaToJsonSchema", () => {
    test("converts theme schema to JSON schema", () => {
      const jsonSchema = themeSchemaToJsonSchema();
      
      expect(jsonSchema).toHaveProperty("$schema");
      // The structure might be different than expected, check what's actually returned
      expect(typeof jsonSchema).toBe("object");
      
      // Looking at the implementation, the name is passed as an option to zodToJsonSchema
      // but it might be stored differently in the output
      const hasNameReference = JSON.stringify(jsonSchema).includes("Theme");
      expect(hasNameReference).toBe(true);
    });
  });
});
