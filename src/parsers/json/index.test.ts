import { describe, expect, test } from "bun:test";
import { loadJsonRules, parseJsonLine, applyMetadata, testRule, createBaseResult } from "./index";
import { type JSONRule, type LineParseResult } from "@/src/types";
import fs from "fs";
import path from "path";

describe("JSON Parser", () => {
  describe("loadJsonRules", () => {
    test("should parse JSON logs with default rules", async () => {
      const parser = await loadJsonRules();
      
      const result = parser('{"level":"info","message":"test message","timestamp":"2023-01-01T00:00:00Z"}');
      
      expect(result).toBeDefined();
      expect(result?.level).toBe("info");
      expect(result?.message).toBe("test message");
      expect(result?.timestamp).toBe("2023-01-01T00:00:00Z");
      expect(result?.language).toBe("json");
    });

    test("should parse JSON logs with custom rules", async () => {
      // Create a temporary rules file
      const rulesFile = path.join(process.cwd(), "test-rules.json");
      const customRules: JSONRule[] = [
        {
          match: "\\{.*\\}",
          lang: "custom-json",
          level: "debug",
          meta: {
            service: "app",
            timestamp: "ts",
            message: "msg",
            level: "lvl"
          }
        }
      ];
      
      fs.writeFileSync(rulesFile, JSON.stringify(customRules));
      
      const parser = await loadJsonRules(rulesFile);
      
      const result = parser('{"lvl":"debug","msg":"test message","ts":"2023-01-01T00:00:00Z","app":"myapp"}');
      
      expect(result).toBeDefined();
      expect(result?.level).toBe("debug");
      expect(result?.message).toBe("test message");
      expect(result?.timestamp).toBe("2023-01-01T00:00:00Z");
      expect(result?.service).toBe("myapp");
      expect(result?.language).toBe("custom-json");
      
      // Clean up
      fs.unlinkSync(rulesFile);
    });

    test("should handle invalid JSON", async () => {
      const parser = await loadJsonRules();
      
      const result = parser('not a json string');
      
      expect(result).toBeUndefined();
    });

    test("should fall back to default rules when custom rules file is invalid", async () => {
      // Create an invalid rules file
      const rulesFile = path.join(process.cwd(), "invalid-rules.json");
      fs.writeFileSync(rulesFile, "invalid json content");
      
      const parser = await loadJsonRules(rulesFile);
      
      const result = parser('{"level":"info","message":"test message","timestamp":"2023-01-01T00:00:00Z"}');
      
      expect(result).toBeDefined();
      expect(result?.level).toBe("info");
      expect(result?.message).toBe("test message");
      expect(result?.timestamp).toBe("2023-01-01T00:00:00Z");
      expect(result?.language).toBe("json");
      
      // Clean up
      fs.unlinkSync(rulesFile);
    });
  });

  describe("parseJsonLine", () => {
    test("should parse JSON with standard fields", () => {
      const json = {
        level: "info",
        message: "test message",
        timestamp: "2023-01-01T00:00:00Z"
      };
      
      const rule: JSONRule = {
        match: "\\{.*\\}",
        lang: "json",
        level: "info"
      };
      
      const result = parseJsonLine(json, rule);
      
      expect(result).toBeDefined();
      expect(result.level).toBe("info");
      expect(result.message).toBe("test message");
      expect(result.timestamp).toBe("2023-01-01T00:00:00Z");
      expect(result.language).toBe("json");
    });

    test("should parse JSON with custom field mappings", () => {
      const json = {
        lvl: "debug",
        msg: "test message",
        ts: "2023-01-01T00:00:00Z",
        app: "myapp"
      };
      
      const rule: JSONRule = {
        match: "\\{.*\\}",
        lang: "custom-json",
        level: "debug",
        meta: {
          service: "app",
          timestamp: "ts",
          message: "msg",
          level: "lvl"
        }
      };
      
      const result = parseJsonLine(json, rule);
      
      expect(result).toBeDefined();
      expect(result.level).toBe("debug");
      expect(result.message).toBe("test message");
      expect(result.timestamp).toBe("2023-01-01T00:00:00Z");
      expect(result.service).toBe("myapp");
      expect(result.language).toBe("custom-json");
    });

    test("should handle missing fields with fallbacks", () => {
      const json = {
        status: "error",
        text: "error message",
        date: "2023-01-01T00:00:00Z"
      };
      
      const rule: JSONRule = {
        match: "\\{.*\\}",
        lang: "json"
      };
      
      const result = parseJsonLine(json, rule);
      
      expect(result).toBeDefined();
      expect(result.level).toBe("error");
      expect(result.message).toBe("error message");
      expect(result.timestamp).toBe("2023-01-01T00:00:00Z");
      expect(result.language).toBe("json");
    });
  });

  describe("applyMetadata", () => {
    test("should apply metadata mappings", () => {
      const result: LineParseResult = {
        language: "json",
        level: "info"
      };
      
      const json = {
        app: "myapp",
        env: "production",
        version: "1.0.0"
      };
      
      const meta = {
        service: "app",
        environment: "env",
        version: "version"
      };
      
      const updatedResult = applyMetadata(result, json, meta);
      
      expect(updatedResult).toEqual({
        language: "json",
        level: "info",
        service: "myapp",
        environment: "production",
        version: "1.0.0"
      });
    });

    test("should handle missing fields in metadata", () => {
      const result: LineParseResult = {
        language: "json",
        level: "info"
      };
      
      const json = {
        app: "myapp"
      };
      
      const meta = {
        service: "app",
        environment: "env",
        version: "version"
      };
      
      const updatedResult = applyMetadata(result, json, meta);
      
      expect(updatedResult).toEqual({
        language: "json",
        level: "info",
        service: "myapp"
      });
    });
  });

  describe("testRule", () => {
    test("should find matching rule", () => {
      const rules: JSONRule[] = [
        {
          match: "\\{.*\\}",
          lang: "json"
        },
        {
          match: "\\[.*\\]",
          lang: "bracket"
        }
      ];
      
      const line = '{"level":"info"}';
      
      const matchingRule = testRule(rules, line);
      
      expect(matchingRule).toBeDefined();
      expect(matchingRule?.lang).toBe("json");
    });

    test("should return undefined when no rule matches", () => {
      const rules: JSONRule[] = [
        {
          match: "\\[.*\\]",
          lang: "bracket"
        }
      ];
      
      const line = '{"level":"info"}';
      
      const matchingRule = testRule(rules, line);
      
      expect(matchingRule).toBeUndefined();
    });
  });

  describe("createBaseResult", () => {
    test("should create base result with rule values", () => {
      const rule: JSONRule = {
        match: "\\{.*\\}",
        lang: "custom-json",
        level: "debug"
      };
      
      const result = createBaseResult(rule);
      
      expect(result).toEqual({
        language: "custom-json",
        level: "debug"
      });
    });

    test("should use defaults when rule values are missing", () => {
      const rule: JSONRule = {
        match: "\\{.*\\}"
      };
      
      const result = createBaseResult(rule);
      
      expect(result).toEqual({
        language: "json",
        level: "info"
      });
    });
  });
}); 