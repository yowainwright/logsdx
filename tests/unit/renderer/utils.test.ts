import { describe, expect, test } from "bun:test";
import {
  escapeHtml,
  hexToRgb,
  stripAnsi,
  hasStyleCode,
  parseColorFgBg,
  isLightBgColor,
  repeatString,
  calculateCenterPadding,
  isBrowser,
  hasMatchMedia,
} from "../../../src/renderer/utils";

describe("renderer/utils", () => {
  describe("escapeHtml()", () => {
    test("escapes ampersand", () => {
      expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
    });

    test("escapes less than", () => {
      expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
    });

    test("escapes greater than", () => {
      expect(escapeHtml("5 > 3")).toBe("5 &gt; 3");
    });

    test("escapes double quotes", () => {
      expect(escapeHtml('Say "Hello"')).toBe("Say &quot;Hello&quot;");
    });

    test("escapes single quotes", () => {
      expect(escapeHtml("It's working")).toBe("It&#039;s working");
    });

    test("escapes multiple special characters", () => {
      expect(escapeHtml('<a href="test">Tom & Jerry\'s</a>')).toBe(
        "&lt;a href=&quot;test&quot;&gt;Tom &amp; Jerry&#039;s&lt;/a&gt;"
      );
    });

    test("returns unchanged string with no special characters", () => {
      expect(escapeHtml("plain text")).toBe("plain text");
    });
  });

  describe("hexToRgb()", () => {
    test("converts hex color with hash", () => {
      expect(hexToRgb("#ff0000")).toEqual([255, 0, 0]);
    });

    test("converts hex color without hash", () => {
      expect(hexToRgb("00ff00")).toEqual([0, 255, 0]);
    });

    test("converts hex color case insensitive", () => {
      expect(hexToRgb("#AABBCC")).toEqual([170, 187, 204]);
      expect(hexToRgb("#aabbcc")).toEqual([170, 187, 204]);
    });

    test("returns black for invalid hex", () => {
      expect(hexToRgb("invalid")).toEqual([0, 0, 0]);
    });

    test("returns black for short hex", () => {
      expect(hexToRgb("#fff")).toEqual([0, 0, 0]);
    });

    test("returns black for empty string", () => {
      expect(hexToRgb("")).toEqual([0, 0, 0]);
    });

    test("converts white", () => {
      expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
    });

    test("converts black", () => {
      expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
    });
  });

  describe("stripAnsi()", () => {
    test("removes ANSI color codes", () => {
      expect(stripAnsi("\x1B[31mred text\x1B[0m")).toBe("red text");
    });

    test("returns unchanged text without ANSI codes", () => {
      expect(stripAnsi("plain text")).toBe("plain text");
    });
  });

  describe("hasStyleCode()", () => {
    test("returns true when code is present", () => {
      expect(hasStyleCode(["bold", "italic"], "bold")).toBe(true);
    });

    test("returns false when code is not present", () => {
      expect(hasStyleCode(["bold", "italic"], "underline")).toBe(false);
    });

    test("returns false for undefined array", () => {
      expect(hasStyleCode(undefined, "bold")).toBe(false);
    });

    test("returns false for empty array", () => {
      expect(hasStyleCode([], "bold")).toBe(false);
    });
  });

  describe("parseColorFgBg()", () => {
    test("parses valid COLORFGBG with two parts", () => {
      expect(parseColorFgBg("0;7")).toBe(7);
    });

    test("parses valid COLORFGBG with three parts", () => {
      expect(parseColorFgBg("0;7;1")).toBe(7);
    });

    test("returns undefined for single part", () => {
      expect(parseColorFgBg("7")).toBeUndefined();
    });

    test("returns undefined for non-numeric background", () => {
      expect(parseColorFgBg("0;invalid")).toBeUndefined();
    });

    test("returns undefined for empty string", () => {
      expect(parseColorFgBg("")).toBeUndefined();
    });

    test("parses zero background color", () => {
      expect(parseColorFgBg("7;0")).toBe(0);
    });
  });

  describe("isLightBgColor()", () => {
    test("returns true for color 7", () => {
      expect(isLightBgColor(7)).toBe(true);
    });

    test("returns true for color 15", () => {
      expect(isLightBgColor(15)).toBe(true);
    });

    test("returns false for color 0", () => {
      expect(isLightBgColor(0)).toBe(false);
    });

    test("returns false for color 8", () => {
      expect(isLightBgColor(8)).toBe(false);
    });

    test("returns false for negative numbers", () => {
      expect(isLightBgColor(-1)).toBe(false);
    });
  });

  describe("repeatString()", () => {
    test("repeats string n times", () => {
      expect(repeatString("a", 5)).toBe("aaaaa");
    });

    test("returns empty string for count 0", () => {
      expect(repeatString("test", 0)).toBe("");
    });

    test("returns empty string for negative count", () => {
      expect(repeatString("test", -5)).toBe("");
    });

    test("works with multi-character strings", () => {
      expect(repeatString("ab", 3)).toBe("ababab");
    });
  });

  describe("calculateCenterPadding()", () => {
    test("calculates even padding", () => {
      expect(calculateCenterPadding(10, 4)).toEqual([3, 3]);
    });

    test("calculates odd padding", () => {
      expect(calculateCenterPadding(10, 5)).toEqual([2, 3]);
    });

    test("returns zero padding when text is wider", () => {
      expect(calculateCenterPadding(5, 10)).toEqual([0, 0]);
    });

    test("returns full padding for empty text", () => {
      expect(calculateCenterPadding(10, 0)).toEqual([5, 5]);
    });

    test("handles exact fit", () => {
      expect(calculateCenterPadding(10, 10)).toEqual([0, 0]);
    });
  });

  describe("isBrowser()", () => {
    test("returns false in Node environment", () => {
      expect(isBrowser()).toBe(false);
    });
  });

  describe("hasMatchMedia()", () => {
    test("returns false in Node environment", () => {
      expect(hasMatchMedia()).toBe(false);
    });
  });
});
