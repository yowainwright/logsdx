import { expect, test, describe } from "bun:test";
import { applyHighlightPatterns, formatLineNumber } from "./ink-utils";
import { ANSI } from "@/src/cli/styles";

describe("formatLineNumber", () => {
  test("returns a string", () => {
    const result = formatLineNumber(0, 10);
    expect(typeof result).toBe("string");
  });

  test("includes line number and separator", () => {
    const result = formatLineNumber(0, 10);
    expect(result).toContain("1");
    expect(result).toContain("|");
  });

  test("pads line numbers correctly", () => {
    const result = formatLineNumber(0, 100);
    expect(result.length).toBeGreaterThan(formatLineNumber(0, 10).length);

    const result2 = formatLineNumber(99, 100);
    expect(result2).toContain("100");
  });
});

describe("applyHighlightPatterns", () => {
  test("returns original string when no patterns provided", () => {
    const line = "Test message";
    const result = applyHighlightPatterns(line);
    expect(result).toBe(line);
  });

  test("returns original string when empty patterns array provided", () => {
    const line = "Test message";
    const result = applyHighlightPatterns(line, []);
    expect(result).toBe(line);
  });

  test("applies single style to matched pattern", () => {
    const line = "Test message";
    const patterns = [
      {
        pattern: "Test",
        style: ["bold" as keyof typeof ANSI],
      },
    ];
    const result = applyHighlightPatterns(line, patterns);
    expect(typeof result).toBe("string");
    expect(result).not.toBe(line);
  });

  test("applies multiple styles to matched pattern", () => {
    const line = "Test message";
    const patterns = [
      {
        pattern: "Test",
        style: ["bold" as keyof typeof ANSI, "red" as keyof typeof ANSI],
      },
    ];
    const result = applyHighlightPatterns(line, patterns);
    expect(typeof result).toBe("string");
    expect(result).not.toBe(line);
  });

  test("applies multiple patterns in sequence", () => {
    const line = "Test message with multiple patterns";
    const patterns = [
      { pattern: "Test", style: ["bold" as keyof typeof ANSI] },
      { pattern: "multiple", style: ["red" as keyof typeof ANSI] },
    ];
    const result = applyHighlightPatterns(line, patterns);
    expect(typeof result).toBe("string");
    expect(result).not.toBe(line);
  });

  test("handles regex patterns", () => {
    const line = "Test123 message";
    const patterns = [
      {
        pattern: /Test\d+/,
        style: ["bold" as keyof typeof ANSI],
      },
    ];
    const result = applyHighlightPatterns(line, patterns);
    expect(typeof result).toBe("string");
    expect(result).not.toBe(line);
  });
});
