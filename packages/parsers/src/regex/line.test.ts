import { expect, test, describe } from "bun:test";
import { createRegexLineParser } from "./line";
import { logParserRules } from "./rules";
import { type LogLevel } from "@/src/types";

describe("Regex Line Parser", () => {
  const parser = createRegexLineParser(logParserRules);

  describe("Language Detection", () => {
    test("should detect JSON language marker", () => {
      const result = parser("[json] Some JSON content");
      expect(result?.lang).toBe("json");
    });

    test("should detect SQL language marker", () => {
      const result = parser("[sql] SELECT * FROM users");
      expect(result?.lang).toBe("sql");
    });

    test("should detect custom language marker", () => {
      const result = parser("[lang:python] print('hello')");
      expect(result?.lang).toBe("python");
    });

    test("should be case insensitive for language markers", () => {
      const result = parser("[JSON] Some JSON content");
      expect(result?.lang).toBe("json");
    });
  });

  describe("Log Level Detection", () => {
    test("should detect error levels", () => {
      const testCases = [
        "[ERROR] Something went wrong",
        "[ERR] Database connection failed",
        "[FATAL] System crash",
        "[CRITICAL] Service unavailable",
      ];

      for (const input of testCases) {
        const result = parser(input);
        expect(result?.level).toBe("error");
      }
    });

    test("should detect warning levels", () => {
      const testCases = [
        "[WARN] Resource running low",
        "[WARNING] Deprecated feature used",
        "[ATTENTION] Please update your system",
      ];

      for (const input of testCases) {
        const result = parser(input);
        expect(result?.level).toBe("warn");
      }
    });

    test("should detect info levels", () => {
      const testCases = [
        "[INFO] User logged in",
        "[INFORMATION] System started",
      ];

      for (const input of testCases) {
        const result = parser(input);
        expect(result?.level).toBe("info");
      }
    });

    test("should detect debug levels", () => {
      const testCases = [
        "[DEBUG] Variable x = 42",
        "[TRACE] Function entry",
        "[VERBOSE] Detailed logging",
      ];

      for (const input of testCases) {
        const result = parser(input);
        expect(result?.level).toBe("debug");
      }
    });

    test("should detect success levels", () => {
      const testCases = [
        "[SUCCESS] Operation completed",
        "[SUCCEEDED] Task finished",
        "[COMPLETED] Process done",
      ];

      for (const input of testCases) {
        const result = parser(input);
        expect(result?.level).toBe("success");
      }
    });
  });

  describe("Timestamp and Message Parsing", () => {
    test("should parse ISO timestamp format", () => {
      const result = parser("2023-01-01T12:00:00.000Z [INFO] Test message");
      expect(result?.timestamp).toBe("2023-01-01T12:00:00.000Z");
      expect(result?.level).toBe("info");
      expect(result?.message).toBe("Test message");
    });

    test("should parse date-time format", () => {
      const result = parser("2023-01-01 12:00:00.000 [INFO] Test message");
      expect(result?.timestamp).toBe("2023-01-01 12:00:00.000");
      expect(result?.level).toBe("info");
      expect(result?.message).toBe("Test message");
    });

    test("should parse bracketed timestamp format", () => {
      const result = parser("[2023-01-01T12:00:00.000Z] [INFO] Test message");
      expect(result?.timestamp).toBe("2023-01-01T12:00:00.000Z");
      expect(result?.level).toBe("info");
      expect(result?.message).toBe("Test message");
    });
  });

  describe("Fallback Level Detection", () => {
    test("should detect error levels in message content", () => {
      const result = parser("Something went ERROR in the system");
      expect(result?.level).toBe("error");
    });

    test("should detect warning levels in message content", () => {
      const result = parser("Please be WARNING about this");
      expect(result?.level).toBe("warn");
    });

    test("should detect info levels in message content", () => {
      const result = parser("This is an INFO message");
      expect(result?.level).toBe("info");
    });

    test("should detect debug levels in message content", () => {
      const result = parser("DEBUG: Variable x = 42");
      expect(result?.level).toBe("debug");
    });

    test("should detect success levels in message content", () => {
      const result = parser("Operation SUCCESS completed");
      expect(result?.level).toBe("success");
    });
  });

  describe("Edge Cases", () => {
    test("should return undefined for empty lines", () => {
      const result = parser("");
      expect(result).toBeUndefined();
    });

    test("should return undefined for whitespace-only lines", () => {
      const result = parser("   ");
      expect(result).toBeUndefined();
    });

    test("should return undefined for non-matching lines", () => {
      const result = parser("This is a regular log message");
      expect(result).toBeUndefined();
    });

    test("should handle multiple matches (first match wins)", () => {
      const result = parser("[ERROR] [INFO] Test message");
      expect(result?.level).toBe("error");
    });
  });
});
