import { expect, test, describe } from "bun:test";
import {
  parseToken,
  parseTokenSafe,
  parseTokenList,
  parseTokenListSafe,
  parseTheme,
  parseThemeSafe,
  ValidationError,
} from "../../../src/schema/index";

describe("Schema Definitions", () => {
  describe("parseToken", () => {
    test("validates token with style", () => {
      const validToken = {
        content: "error",
        metadata: {
          style: { color: "red" },
        },
      };

      const result = parseTokenSafe(validToken);
      expect(result.success).toBe(true);
    });

    test("requires content property", () => {
      const missingContent = {
        metadata: { style: { color: "red" } },
      };

      const result = parseTokenSafe(missingContent);
      expect(result.success).toBe(false);
    });

    test("validates token without metadata", () => {
      const tokenWithoutMetadata = {
        content: "just content",
      };

      const result = parseTokenSafe(tokenWithoutMetadata);
      expect(result.success).toBe(true);
    });
  });

  describe("parseTokenList", () => {
    test("validates token list", () => {
      const validList = [
        { content: "error", metadata: { style: { color: "red" } } },
        { content: " message", metadata: { style: { color: "white" } } },
      ];

      const result = parseTokenListSafe(validList);
      expect(result.success).toBe(true);
    });

    test("validates empty list", () => {
      const result = parseTokenListSafe([]);
      expect(result.success).toBe(true);
    });

    test("fails on invalid tokens", () => {
      const invalidList = [
        { content: "valid" },
        { invalidProp: "not a token" },
      ];

      const result = parseTokenListSafe(invalidList);
      expect(result.success).toBe(false);
    });
  });

  describe("parseTheme", () => {
    test("validates theme preset", () => {
      const validTheme = {
        name: "Dark Theme",
        description: "A dark theme for logs",
        schema: {
          defaultStyle: { color: "white" },
          matchWords: { error: { color: "red" } },
        },
      };

      const result = parseThemeSafe(validTheme);
      expect(result.success).toBe(true);
    });

    test("requires name and schema", () => {
      const missingSchema = {
        name: "Dark Theme",
      };

      const result = parseThemeSafe(missingSchema);
      expect(result.success).toBe(false);
    });

    test("validates full config", () => {
      const fullConfig = {
        name: "Full Theme",
        schema: {
          defaultStyle: { color: "white" },
          matchWords: { error: { color: "red" } },
          matchStartsWith: { "[ERR]": { color: "red" } },
          matchEndsWith: { failed: { color: "red" } },
          matchContains: { warning: { color: "yellow" } },
          matchPatterns: [
            {
              name: "timestamp",
              pattern: "\\d{4}-\\d{2}-\\d{2}",
              options: { color: "blue" },
            },
          ],
          whiteSpace: "preserve",
          newLine: "trim",
        },
      };

      const result = parseThemeSafe(fullConfig);
      expect(result.success).toBe(true);
    });

    test("validates default values for whiteSpace and newLine", () => {
      const minimalTheme = {
        name: "Minimal",
        schema: {},
      };
      const result = parseTheme(minimalTheme);

      expect(result.schema.whiteSpace).toBe("preserve");
      expect(result.schema.newLine).toBe("preserve");
    });
  });

  describe("Style validation", () => {
    test("validates valid style in token", () => {
      const validToken = {
        content: "test",
        metadata: {
          style: {
            color: "red",
            styleCodes: ["bold", "underline"],
            htmlStyleFormat: "css",
          },
        },
      };

      const result = parseTokenSafe(validToken);
      expect(result.success).toBe(true);
    });

    test("requires color in style", () => {
      const invalidToken = {
        content: "test",
        metadata: {
          style: {
            styleCodes: ["bold"],
          },
        },
      };

      const result = parseTokenSafe(invalidToken);
      expect(result.success).toBe(false);
    });

    test("validates htmlStyleFormat enum values", () => {
      const validCss = {
        content: "test",
        metadata: { style: { color: "blue", htmlStyleFormat: "css" } },
      };
      const validClassName = {
        content: "test",
        metadata: { style: { color: "blue", htmlStyleFormat: "className" } },
      };
      const invalidFormat = {
        content: "test",
        metadata: { style: { color: "blue", htmlStyleFormat: "invalid" } },
      };

      expect(parseTokenSafe(validCss).success).toBe(true);
      expect(parseTokenSafe(validClassName).success).toBe(true);
      expect(parseTokenSafe(invalidFormat).success).toBe(false);
    });
  });

  describe("Pattern match validation", () => {
    test("validates pattern match in theme", () => {
      const theme = {
        name: "Test",
        schema: {
          matchPatterns: [
            {
              name: "errorPattern",
              pattern: "Error:\\s.*",
              options: { color: "red" },
            },
          ],
        },
      };

      const result = parseThemeSafe(theme);
      expect(result.success).toBe(true);
    });

    test("requires all pattern match properties", () => {
      const theme = {
        name: "Test",
        schema: {
          matchPatterns: [
            {
              name: "errorPattern",
              pattern: "Error:\\s.*",
            },
          ],
        },
      };

      const result = parseThemeSafe(theme);
      expect(result.success).toBe(false);
    });
  });
});
