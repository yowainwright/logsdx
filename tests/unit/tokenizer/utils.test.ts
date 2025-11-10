import { describe, expect, test } from "bun:test";
import {
  escapeRegexPattern,
  isObject,
  createWordBoundaryPattern,
  extractStyle,
  extractPattern,
  hasStyleMetadata,
  isTrimmedWhitespace,
  createSafeRegex,
  isValidMatchPatternsArray,
} from "../../../src/tokenizer/utils";

describe("tokenizer/utils", () => {
  describe("escapeRegexPattern()", () => {
    test("escapes special regex characters", () => {
      expect(escapeRegexPattern(".*+?")).toBe("\\.\\*\\+\\?");
    });

    test("escapes brackets", () => {
      expect(escapeRegexPattern("[test]")).toBe("\\[test\\]");
    });

    test("escapes parentheses", () => {
      expect(escapeRegexPattern("(test)")).toBe("\\(test\\)");
    });

    test("returns unchanged string with no special chars", () => {
      expect(escapeRegexPattern("test")).toBe("test");
    });

    test("escapes backslash", () => {
      expect(escapeRegexPattern("\\test")).toBe("\\\\test");
    });
  });

  describe("isObject()", () => {
    test("returns true for plain object", () => {
      expect(isObject({})).toBe(true);
    });

    test("returns true for object with properties", () => {
      expect(isObject({ key: "value" })).toBe(true);
    });

    test("returns false for null", () => {
      expect(isObject(null)).toBe(false);
    });

    test("returns false for string", () => {
      expect(isObject("string")).toBe(false);
    });

    test("returns false for number", () => {
      expect(isObject(123)).toBe(false);
    });

    test("returns false for boolean", () => {
      expect(isObject(true)).toBe(false);
    });

    test("returns false for undefined", () => {
      expect(isObject(undefined)).toBe(false);
    });

    test("returns true for array", () => {
      expect(isObject([])).toBe(true);
    });
  });

  describe("createWordBoundaryPattern()", () => {
    test("creates pattern with word boundaries", () => {
      const pattern = createWordBoundaryPattern("test");
      expect(pattern.test("test")).toBe(true);
      expect(pattern.test("testing")).toBe(false);
    });

    test("is case insensitive", () => {
      const pattern = createWordBoundaryPattern("test");
      expect(pattern.test("TEST")).toBe(true);
      expect(pattern.test("Test")).toBe(true);
    });

    test("escapes special regex characters", () => {
      const pattern = createWordBoundaryPattern("test.pattern");
      expect(pattern.test("test.pattern")).toBe(true);
      expect(pattern.test("testXpattern")).toBe(false);
    });
  });

  describe("extractStyle()", () => {
    test("extracts style from object", () => {
      const style = { color: "red" };
      expect(extractStyle({ style })).toEqual(style);
    });

    test("returns undefined for non-object", () => {
      expect(extractStyle("string")).toBeUndefined();
    });

    test("returns undefined for null", () => {
      expect(extractStyle(null)).toBeUndefined();
    });

    test("returns undefined for object without style", () => {
      expect(extractStyle({ other: "value" })).toBeUndefined();
    });
  });

  describe("extractPattern()", () => {
    test("extracts pattern string from object", () => {
      expect(extractPattern({ pattern: "test" })).toBe("test");
    });

    test("returns undefined for non-object", () => {
      expect(extractPattern("string")).toBeUndefined();
    });

    test("returns undefined for null", () => {
      expect(extractPattern(null)).toBeUndefined();
    });

    test("returns undefined for object without pattern", () => {
      expect(extractPattern({ other: "value" })).toBeUndefined();
    });

    test("returns undefined for non-string pattern", () => {
      expect(extractPattern({ pattern: 123 })).toBeUndefined();
    });
  });

  describe("hasStyleMetadata()", () => {
    test("returns true when token has style metadata", () => {
      const token = { type: "test", value: "test", metadata: { style: { color: "red" } } };
      expect(hasStyleMetadata(token)).toBe(true);
    });

    test("returns false when token has no metadata", () => {
      const token = { type: "test", value: "test" };
      expect(hasStyleMetadata(token)).toBe(false);
    });

    test("returns false when metadata has no style", () => {
      const token = { type: "test", value: "test", metadata: {} };
      expect(hasStyleMetadata(token)).toBe(false);
    });
  });

  describe("isTrimmedWhitespace()", () => {
    test("returns true for object with trimmed flag", () => {
      expect(isTrimmedWhitespace({ trimmed: true })).toBe(true);
    });

    test("returns false for object without trimmed flag", () => {
      expect(isTrimmedWhitespace({ other: "value" })).toBe(false);
    });

    test("returns false for non-object", () => {
      expect(isTrimmedWhitespace("string")).toBe(false);
    });

    test("returns false for null", () => {
      expect(isTrimmedWhitespace(null)).toBe(false);
    });

    test("returns false for object with falsy trimmed", () => {
      expect(isTrimmedWhitespace({ trimmed: false })).toBe(false);
    });
  });

  describe("createSafeRegex()", () => {
    test("creates regex from valid pattern", () => {
      const regex = createSafeRegex("test");
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex?.test("test")).toBe(true);
    });

    test("returns undefined for invalid pattern", () => {
      expect(createSafeRegex("[invalid")).toBeUndefined();
    });

    test("handles complex patterns", () => {
      const regex = createSafeRegex("^[a-z]+$");
      expect(regex?.test("abc")).toBe(true);
      expect(regex?.test("123")).toBe(false);
    });
  });

  describe("isValidMatchPatternsArray()", () => {
    test("returns true for array", () => {
      expect(isValidMatchPatternsArray([])).toBe(true);
      expect(isValidMatchPatternsArray([1, 2, 3])).toBe(true);
    });

    test("returns false for non-array", () => {
      expect(isValidMatchPatternsArray("string")).toBe(false);
      expect(isValidMatchPatternsArray({})).toBe(false);
      expect(isValidMatchPatternsArray(null)).toBe(false);
      expect(isValidMatchPatternsArray(undefined)).toBe(false);
    });
  });
});
