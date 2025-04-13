import { expect, test, describe } from "bun:test";
import { logParserRules } from "./rules";
import { type LogLevel } from "@/src/types";

describe("Regex Parser Rules", () => {
  describe("Language Markers", () => {
    test("should match JSON language marker", () => {
      const rule = logParserRules.find(r => r.match.toString().includes("json"));
      expect(rule).toBeDefined();
      
      const match = "[json] Some content".match(rule!.match);
      expect(match).toBeTruthy();
      
      const result = rule!.extract?.("[json] Some content", match!);
      expect(result?.lang).toBe("json");
    });

    test("should match SQL language marker", () => {
      const rule = logParserRules.find(r => r.match.toString().includes("sql"));
      expect(rule).toBeDefined();
      
      const match = "[SQL] SELECT * FROM table".match(rule!.match);
      expect(match).toBeTruthy();
      
      const result = rule!.extract?.("[SQL] SELECT * FROM table", match!);
      expect(result?.lang).toBe("sql");
    });

    test("should match custom language marker", () => {
      const rule = logParserRules.find(r => r.match.toString().includes("lang:"));
      expect(rule).toBeDefined();
      
      const match = "[lang:python] def main():".match(rule!.match);
      expect(match).toBeTruthy();
      
      const result = rule!.extract?.("[lang:python] def main():", match!);
      expect(result?.lang).toBe("python");
    });
  });

  describe("Log Level Rules", () => {
    test("should match error levels", () => {
      const rule = logParserRules.find(r => r.match.toString().includes("ERROR|ERR|FATAL"));
      expect(rule).toBeDefined();

      const testCases = ["[ERROR]", "[ERR]", "[FATAL]", "[CRITICAL]"];
      for (const testCase of testCases) {
        const match = testCase.match(rule!.match);
        expect(match).toBeTruthy();
        
        const result = rule!.extract?.(testCase, match!);
        expect(result?.level).toBe("error" as LogLevel);
      }
    });

    test("should match warning levels", () => {
      const rule = logParserRules.find(r => r.match.toString().includes("WARN|WARNING"));
      expect(rule).toBeDefined();

      const testCases = ["[WARN]", "[WARNING]", "[ATTENTION]"];
      for (const testCase of testCases) {
        const match = testCase.match(rule!.match);
        expect(match).toBeTruthy();
        
        const result = rule!.extract?.(testCase, match!);
        expect(result?.level).toBe("warn" as LogLevel);
      }
    });

    test("should match info levels", () => {
      const rule = logParserRules.find(r => r.match.toString().includes("INFO|INFORMATION"));
      expect(rule).toBeDefined();

      const testCases = ["[INFO]", "[INFORMATION]"];
      for (const testCase of testCases) {
        const match = testCase.match(rule!.match);
        expect(match).toBeTruthy();
        
        const result = rule!.extract?.(testCase, match!);
        expect(result?.level).toBe("info" as LogLevel);
      }
    });

    test("should match debug levels", () => {
      const rule = logParserRules.find(r => r.match.toString().includes("DEBUG|TRACE"));
      expect(rule).toBeDefined();

      const testCases = ["[DEBUG]", "[TRACE]", "[VERBOSE]"];
      for (const testCase of testCases) {
        const match = testCase.match(rule!.match);
        expect(match).toBeTruthy();
        
        const result = rule!.extract?.(testCase, match!);
        expect(result?.level).toBe("debug" as LogLevel);
      }
    });

    test("should match success levels", () => {
      const rule = logParserRules.find(r => r.match.toString().includes("SUCCESS|SUCCEEDED"));
      expect(rule).toBeDefined();

      const testCases = ["[SUCCESS]", "[SUCCEEDED]", "[COMPLETED]"];
      for (const testCase of testCases) {
        const match = testCase.match(rule!.match);
        expect(match).toBeTruthy();
        
        const result = rule!.extract?.(testCase, match!);
        expect(result?.level).toBe("success" as LogLevel);
      }
    });
  });

  describe("Common Log Format Rules", () => {
    test("should match ISO timestamp format", () => {
      const rule = logParserRules.find(r => r.match.toString().includes("\\d{4}-\\d{2}-\\d{2}T"));
      expect(rule).toBeDefined();

      const line = "2024-03-21T15:30:45.123Z [INFO] Test message";
      const match = line.match(rule!.match);
      expect(match).toBeTruthy();
      
      const result = rule!.extract?.(line, match!);
      expect(result?.timestamp).toBe("2024-03-21T15:30:45.123Z");
      expect(result?.level).toBe("info" as LogLevel);
      expect(result?.message).toBe("Test message");
    });

    test("should match date-time format", () => {
      const rule = logParserRules.find(r => r.match.toString().includes("\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:"));
      expect(rule).toBeDefined();

      const line = "2024-03-21 15:30:45.123 [INFO] Test message";
      const match = line.match(rule!.match);
      expect(match).toBeTruthy();
      
      const result = rule!.extract?.(line, match!);
      expect(result?.timestamp).toBe("2024-03-21 15:30:45.123");
      expect(result?.level).toBe("info" as LogLevel);
      expect(result?.message).toBe("Test message");
    });

    test("should match bracketed timestamp format", () => {
      const line = "[2024-03-21T15:30:45.123Z] [INFO] Test message";
      
      // Find all matching rules
      const matchingRules = logParserRules.filter(r => line.match(r.match));
      expect(matchingRules.length).toBeGreaterThan(0);
      
      // Find the rule that extracts timestamp
      const timestampRule = matchingRules.find(r => {
        const match = line.match(r.match);
        const result = r.extract?.(line, match!);
        return result?.timestamp !== undefined;
      });
      
      expect(timestampRule).toBeDefined();
      
      const match = line.match(timestampRule!.match);
      expect(match).toBeTruthy();
      
      const result = timestampRule!.extract?.(line, match!);
      expect(result?.timestamp).toBe("2024-03-21T15:30:45.123Z");
      expect(result?.level).toBe("info" as LogLevel);
      expect(result?.message).toBe("Test message");
    });
  });

  describe("Fallback Level Rules", () => {
    test("should match error in message content", () => {
      const rule = logParserRules.find(r => r.match.toString().includes("\\b(ERROR|ERR|FATAL"));
      expect(rule).toBeDefined();

      const line = "An ERROR occurred in the system";
      const match = line.match(rule!.match);
      expect(match).toBeTruthy();
      
      const result = rule!.extract?.(line, match!);
      expect(result?.level).toBe("error" as LogLevel);
    });

    test("should match warning in message content", () => {
      const rule = logParserRules.find(r => r.match.toString().includes("\\b(WARN|WARNING"));
      expect(rule).toBeDefined();

      const line = "System shows a WARNING state";
      const match = line.match(rule!.match);
      expect(match).toBeTruthy();
      
      const result = rule!.extract?.(line, match!);
      expect(result?.level).toBe("warn" as LogLevel);
    });
  });
}); 