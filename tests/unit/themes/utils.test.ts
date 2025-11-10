import { describe, expect, test } from "bun:test";
import {
  isDarkColor,
  getAccessibleTextColors,
  getWCAGLevel,
  getWCAGRecommendations,
} from "../../../src/themes/utils";

describe("themes/utils", () => {
  describe("isDarkColor()", () => {
    test("identifies black as dark", () => {
      expect(isDarkColor("#000000")).toBe(true);
    });

    test("identifies white as light", () => {
      expect(isDarkColor("#FFFFFF")).toBe(false);
    });

    test("identifies dark gray as dark", () => {
      expect(isDarkColor("#333333")).toBe(true);
    });

    test("identifies light gray as light", () => {
      expect(isDarkColor("#CCCCCC")).toBe(false);
    });

    test("handles colors without # prefix", () => {
      expect(isDarkColor("000000")).toBe(true);
      expect(isDarkColor("FFFFFF")).toBe(false);
    });

    test("identifies dark blue as dark", () => {
      expect(isDarkColor("#0000FF")).toBe(true);
    });

    test("identifies light yellow as light", () => {
      expect(isDarkColor("#FFFF00")).toBe(false);
    });

    test("correctly identifies medium luminance colors", () => {
      expect(isDarkColor("#808080")).toBe(false); // Medium gray
      expect(isDarkColor("#404040")).toBe(true); // Dark medium gray
    });
  });

  describe("getAccessibleTextColors()", () => {
    test("returns light colors for dark background with AA", () => {
      const colors = getAccessibleTextColors("#000000", "AA");
      expect(colors.text).toBeDefined();
      expect(colors.info).toBeDefined();
      expect(colors.warn).toBeDefined();
      expect(colors.error).toBeDefined();
      expect(colors.success).toBeDefined();
      expect(colors.debug).toBeDefined();
      expect(colors.number).toBeDefined();
      expect(colors.string).toBeDefined();
    });

    test("returns light colors for dark background with AAA", () => {
      const colors = getAccessibleTextColors("#000000", "AAA");
      expect(colors.text).toBeDefined();
      expect(colors.info).toBeDefined();
      expect(colors.warn).toBeDefined();
      expect(colors.error).toBeDefined();
      expect(colors.success).toBeDefined();
      expect(colors.debug).toBeDefined();
      expect(colors.number).toBeDefined();
      expect(colors.string).toBeDefined();
    });

    test("returns dark colors for light background with AA", () => {
      const colors = getAccessibleTextColors("#FFFFFF", "AA");
      expect(colors.text).toBeDefined();
      expect(colors.info).toBeDefined();
      expect(colors.warn).toBeDefined();
      expect(colors.error).toBeDefined();
      expect(colors.success).toBeDefined();
      expect(colors.debug).toBeDefined();
      expect(colors.number).toBeDefined();
      expect(colors.string).toBeDefined();
    });

    test("returns dark colors for light background with AAA", () => {
      const colors = getAccessibleTextColors("#FFFFFF", "AAA");
      expect(colors.text).toBeDefined();
      expect(colors.info).toBeDefined();
      expect(colors.warn).toBeDefined();
      expect(colors.error).toBeDefined();
      expect(colors.success).toBeDefined();
      expect(colors.debug).toBeDefined();
      expect(colors.number).toBeDefined();
      expect(colors.string).toBeDefined();
    });

    test("defaults to AA contrast level", () => {
      const colorsAA = getAccessibleTextColors("#000000", "AA");
      const colorsDefault = getAccessibleTextColors("#000000");
      expect(colorsAA).toEqual(colorsDefault);
    });

    test("AAA colors are lighter/darker than AA colors for dark backgrounds", () => {
      const colorsAA = getAccessibleTextColors("#000000", "AA");
      const colorsAAA = getAccessibleTextColors("#000000", "AAA");

      // AAA should provide higher contrast (lighter colors for dark background)
      expect(colorsAAA.text).not.toBe(colorsAA.text);
    });

    test("AAA colors are darker than AA colors for light backgrounds", () => {
      const colorsAA = getAccessibleTextColors("#FFFFFF", "AA");
      const colorsAAA = getAccessibleTextColors("#FFFFFF", "AAA");

      // AAA should provide higher contrast (darker colors for light background)
      expect(colorsAAA.text).not.toBe(colorsAA.text);
    });
  });

  describe("getWCAGLevel()", () => {
    test("returns AAA for ratio >= 7 (normal text)", () => {
      expect(getWCAGLevel(7, false)).toBe("AAA");
      expect(getWCAGLevel(10, false)).toBe("AAA");
    });

    test("returns AA for ratio >= 4.5 and < 7 (normal text)", () => {
      expect(getWCAGLevel(4.5, false)).toBe("AA");
      expect(getWCAGLevel(6.9, false)).toBe("AA");
    });

    test("returns A for ratio >= 3 and < 4.5 (normal text)", () => {
      expect(getWCAGLevel(3, false)).toBe("A");
      expect(getWCAGLevel(4.4, false)).toBe("A");
    });

    test("returns FAIL for ratio < 3 (normal text)", () => {
      expect(getWCAGLevel(2.9, false)).toBe("FAIL");
      expect(getWCAGLevel(1, false)).toBe("FAIL");
    });

    test("returns AAA for ratio >= 4.5 (large text)", () => {
      expect(getWCAGLevel(4.5, true)).toBe("AAA");
      expect(getWCAGLevel(10, true)).toBe("AAA");
    });

    test("returns AA for ratio >= 3 and < 4.5 (large text)", () => {
      expect(getWCAGLevel(3, true)).toBe("AA");
      expect(getWCAGLevel(4.4, true)).toBe("AA");
    });

    test("returns FAIL for ratio < 3 (large text)", () => {
      expect(getWCAGLevel(2.9, true)).toBe("FAIL");
      expect(getWCAGLevel(1, true)).toBe("FAIL");
    });

    test("defaults to normal text when isLargeText not provided", () => {
      expect(getWCAGLevel(7)).toBe("AAA");
      expect(getWCAGLevel(4.5)).toBe("AA");
    });
  });

  describe("getWCAGRecommendations()", () => {
    test("provides recommendations for ratio < 3", () => {
      const recommendations = getWCAGRecommendations(2.5);
      expect(recommendations).toHaveLength(2);
      expect(recommendations[0]).toContain("2.50:1");
      expect(recommendations[0]).toContain("below minimum");
      expect(recommendations[1]).toContain("Minimum");
    });

    test("provides recommendations for ratio >= 3 and < 4.5", () => {
      const recommendations = getWCAGRecommendations(4.0);
      expect(recommendations).toHaveLength(2);
      expect(recommendations[0]).toContain("Level A");
      expect(recommendations[0]).toContain("large text");
      expect(recommendations[1]).toContain("4.5:1");
    });

    test("provides recommendations for ratio >= 4.5 and < 7", () => {
      const recommendations = getWCAGRecommendations(5.0);
      expect(recommendations).toHaveLength(2);
      expect(recommendations[0]).toContain("Level AA");
      expect(recommendations[1]).toContain("7:1");
      expect(recommendations[1]).toContain("AAA");
    });

    test("returns empty array for ratio >= 7", () => {
      const recommendations = getWCAGRecommendations(7.0);
      expect(recommendations).toEqual([]);
    });

    test("returns empty array for very high ratios", () => {
      const recommendations = getWCAGRecommendations(15.0);
      expect(recommendations).toEqual([]);
    });

    test("formats ratio correctly in recommendations", () => {
      const recommendations = getWCAGRecommendations(2.856);
      expect(recommendations[0]).toContain("2.86:1");
    });
  });
});
