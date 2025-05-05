import { expect, test, describe } from "bun:test";
import {
  styleOptionsSchema,
  tokenMetadataSchema,
  patternMatchSchema,
  schemaConfigSchema,
  themePresetSchema,
  tokenSchema,
  tokenListSchema
} from "./index";

describe("Schema Definitions", () => {
  describe("styleOptionsSchema", () => {
    test("validates valid style options", () => {
      const validStyle = {
        color: "red",
        styleCodes: ["bold", "underline"],
        htmlStyleFormat: "css"
      };
      
      const result = styleOptionsSchema.safeParse(validStyle);
      expect(result.success).toBe(true);
    });

    test("requires color property", () => {
      const invalidStyle = {
        styleCodes: ["bold"]
      };
      
      const result = styleOptionsSchema.safeParse(invalidStyle);
      expect(result.success).toBe(false);
    });

    test("validates htmlStyleFormat enum values", () => {
      const validStyle = { color: "blue", htmlStyleFormat: "className" };
      const invalidStyle = { color: "blue", htmlStyleFormat: "invalid" };
      
      expect(styleOptionsSchema.safeParse(validStyle).success).toBe(true);
      expect(styleOptionsSchema.safeParse(invalidStyle).success).toBe(false);
    });
  });

  describe("tokenMetadataSchema", () => {
    test("validates metadata with style", () => {
      const validMetadata = {
        style: { color: "green" },
        matchType: "word"
      };
      
      const result = tokenMetadataSchema.safeParse(validMetadata);
      expect(result.success).toBe(true);
    });

    test("allows additional properties", () => {
      const metadataWithExtra = {
        style: { color: "blue" },
        customField: "value",
        matchType: "regex"
      };
      
      const result = tokenMetadataSchema.safeParse(metadataWithExtra);
      expect(result.success).toBe(true);
    });
  });

  describe("patternMatchSchema", () => {
    test("validates pattern match definition", () => {
      const validPattern = {
        name: "errorPattern",
        pattern: "Error:\\s.*",
        options: { color: "red" }
      };
      
      const result = patternMatchSchema.safeParse(validPattern);
      expect(result.success).toBe(true);
    });

    test("requires all properties", () => {
      const missingOptions = {
        name: "errorPattern",
        pattern: "Error:\\s.*"
      };
      
      const result = patternMatchSchema.safeParse(missingOptions);
      expect(result.success).toBe(false);
    });
  });

  describe("schemaConfigSchema", () => {
    test("validates empty config", () => {
      const result = schemaConfigSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    test("validates full config", () => {
      const fullConfig = {
        defaultStyle: { color: "white" },
        matchWords: { "error": { color: "red" } },
        matchStartsWith: { "[ERR]": { color: "red" } },
        matchEndsWith: { "failed": { color: "red" } },
        matchContains: { "warning": { color: "yellow" } },
        matchPatterns: [{ 
          name: "timestamp", 
          pattern: "\\d{4}-\\d{2}-\\d{2}", 
          options: { color: "blue" } 
        }],
        whiteSpace: "preserve",
        newLine: "trim"
      };
      
      const result = schemaConfigSchema.safeParse(fullConfig);
      expect(result.success).toBe(true);
    });

    test("validates default values", () => {
      const emptyConfig = {};
      const result = schemaConfigSchema.parse(emptyConfig);
      
      expect(result.whiteSpace).toBe("preserve");
      expect(result.newLine).toBe("preserve");
    });
  });

  describe("themePresetSchema", () => {
    test("validates theme preset", () => {
      const validTheme = {
        name: "Dark Theme",
        description: "A dark theme for logs",
        schema: {
          defaultStyle: { color: "white" },
          matchWords: { "error": { color: "red" } }
        }
      };
      
      const result = themePresetSchema.safeParse(validTheme);
      expect(result.success).toBe(true);
    });

    test("requires name and schema", () => {
      const missingSchema = {
        name: "Dark Theme"
      };
      
      const result = themePresetSchema.safeParse(missingSchema);
      expect(result.success).toBe(false);
    });
  });

  describe("tokenSchema", () => {
    test("validates token", () => {
      const validToken = {
        content: "error",
        metadata: {
          style: { color: "red" },
          matchType: "word"
        }
      };
      
      const result = tokenSchema.safeParse(validToken);
      expect(result.success).toBe(true);
    });

    test("requires content property", () => {
      const missingContent = {
        metadata: { style: { color: "red" } }
      };
      
      const result = tokenSchema.safeParse(missingContent);
      expect(result.success).toBe(false);
    });
  });

  describe("tokenListSchema", () => {
    test("validates token list", () => {
      const validList = [
        { content: "error", metadata: { style: { color: "red" } } },
        { content: " message", metadata: { style: { color: "white" } } }
      ];
      
      const result = tokenListSchema.safeParse(validList);
      expect(result.success).toBe(true);
    });

    test("validates empty list", () => {
      const result = tokenListSchema.safeParse([]);
      expect(result.success).toBe(true);
    });

    test("fails on invalid tokens", () => {
      const invalidList = [
        { content: "valid" },
        { invalidProp: "not a token" }
      ];
      
      const result = tokenListSchema.safeParse(invalidList);
      expect(result.success).toBe(false);
    });
  });
});