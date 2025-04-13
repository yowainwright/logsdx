import { expect, test, describe } from "bun:test";
import { loadJsonRules } from "./index";
import fs from "fs";
import path from "path";
import { type LogLevel } from "@/src/types";
import JSON5 from "json5";

describe("JSON Parser", () => {
  test("should parse valid JSON logs", async () => {
    const parser = await loadJsonRules();
    
    const logLine = '{"level":"info","message":"Test message","timestamp":"2023-01-01T00:00:00.000Z"}';
    const result = parser(logLine);
    
    expect(result).toBeDefined();
    expect(result?.level).toBe("info");
    expect(result?.message).toBe("Test message");
    expect(result?.timestamp).toBe("2023-01-01T00:00:00.000Z");
    expect(result?.language).toBe("json");
  });

  test("should handle different log level formats", async () => {
    const parser = await loadJsonRules();
    
    const testCases = [
      { input: '{"level":"error","message":"Error message"}', expected: "error" as LogLevel },
      { input: '{"status":"warn","message":"Warning message"}', expected: "warn" as LogLevel },
      { input: '{"severity":"debug","message":"Debug message"}', expected: "debug" as LogLevel },
      { input: '{"level":"unknown","message":"Unknown level"}', expected: "info" as LogLevel },
    ];

    for (const { input, expected } of testCases) {
      const result = parser(input);
      expect(result?.level).toBe(expected);
    }
  });

  test("should handle different timestamp formats", async () => {
    const parser = await loadJsonRules();
    
    const testCases = [
      { input: '{"timestamp":"2023-01-01T00:00:00.000Z","message":"Test"}', expected: "2023-01-01T00:00:00.000Z" },
      { input: '{"time":"2023-01-01T00:00:00.000Z","message":"Test"}', expected: "2023-01-01T00:00:00.000Z" },
      { input: '{"date":"2023-01-01T00:00:00.000Z","message":"Test"}', expected: "2023-01-01T00:00:00.000Z" },
      { input: '{"@timestamp":"2023-01-01T00:00:00.000Z","message":"Test"}', expected: "2023-01-01T00:00:00.000Z" },
    ];

    for (const { input, expected } of testCases) {
      const result = parser(input);
      expect(result?.timestamp).toBe(expected);
    }
  });

  test("should handle different message formats", async () => {
    const parser = await loadJsonRules();
    
    const testCases = [
      { input: '{"message":"Test message","level":"info"}', expected: "Test message" },
      { input: '{"msg":"Test message","level":"info"}', expected: "Test message" },
      { input: '{"log":"Test message","level":"info"}', expected: "Test message" },
      { input: '{"text":"Test message","level":"info"}', expected: "Test message" },
    ];

    for (const { input, expected } of testCases) {
      const result = parser(input);
      expect(result?.message).toBe(expected);
    }
  });

  test("should handle additional metadata fields", async () => {
    const parser = await loadJsonRules();
    
    const logLine = '{"level":"info","message":"Test","service":"api","user_id":123,"error_code":500}';
    const result = parser(logLine);
    
    expect(result).toBeDefined();
    expect(result?.service).toBe("api");
    expect(result?.user_id).toBe(123);
    expect(result?.error_code).toBe(500);
  });

  test("should return undefined for non-JSON lines", async () => {
    const parser = await loadJsonRules();
    
    const testCases = [
      "This is not a JSON log",
      "[INFO] This is a regular log",
      "{invalid json",
      "",
      "   ",
    ];

    for (const input of testCases) {
      const result = parser(input);
      expect(result).toBeUndefined();
    }
  });

  test("should load custom rules from file", async () => {
    // Create a temporary rules file
    const tempRulesPath = path.join(process.cwd(), "temp-rules.json5");
    const customRules = [
      {
        match: "\\{.*\\}",
        lang: "json",
        level: "info",
        meta: {
          service: "service",
          timestamp: "timestamp",
          message: "message",
          level: "level"
        }
      }
    ];
    
    fs.writeFileSync(tempRulesPath, JSON5.stringify(customRules, null, 2));
    
    try {
      const parser = await loadJsonRules(tempRulesPath);
      const logLine = '{"level":"info","message":"Test","timestamp":"2023-01-01T00:00:00.000Z","service":"api"}';
      const result = parser(logLine);
      
      expect(result).toBeDefined();
      expect(result?.level).toBe("info");
      expect(result?.message).toBe("Test");
      expect(result?.timestamp).toBe("2023-01-01T00:00:00.000Z");
      expect(result?.service).toBe("api");
    } finally {
      // Clean up the temporary file
      fs.unlinkSync(tempRulesPath);
    }
  });

  test("should fall back to default rules when custom rules file is invalid", async () => {
    // Create a temporary invalid rules file
    const tempRulesPath = path.join(process.cwd(), "temp-invalid-rules.json5");
    fs.writeFileSync(tempRulesPath, "invalid json content");
    
    try {
      const parser = await loadJsonRules(tempRulesPath);
      const logLine = '{"level":"info","message":"Test","timestamp":"2023-01-01T00:00:00.000Z"}';
      const result = parser(logLine);
      
      expect(result).toBeDefined();
      expect(result?.level).toBe("info");
      expect(result?.message).toBe("Test");
      expect(result?.timestamp).toBe("2023-01-01T00:00:00.000Z");
    } finally {
      // Clean up the temporary file
      fs.unlinkSync(tempRulesPath);
    }
  });
}); 