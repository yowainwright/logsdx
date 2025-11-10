import { describe, expect, test } from "bun:test";
import {
  hexToRgb,
  calculateChannelLuminance,
  calculateRelativeLuminance,
  hexContrastRatio,
} from "../../../src/utils/contrast";

describe("contrast", () => {
  describe("hexToRgb()", () => {
    test("converts 6-digit hex to RGB", () => {
      expect(hexToRgb("#ff0000")).toEqual([255, 0, 0]);
      expect(hexToRgb("#00ff00")).toEqual([0, 255, 0]);
      expect(hexToRgb("#0000ff")).toEqual([0, 0, 255]);
    });

    test("converts hex without # prefix", () => {
      expect(hexToRgb("ff0000")).toEqual([255, 0, 0]);
    });

    test("converts 3-digit hex to RGB", () => {
      expect(hexToRgb("#f00")).toEqual([255, 0, 0]);
      expect(hexToRgb("#0f0")).toEqual([0, 255, 0]);
      expect(hexToRgb("#00f")).toEqual([0, 0, 255]);
    });

    test("handles white and black", () => {
      expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
      expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
    });

    test("handles invalid hex as black", () => {
      expect(hexToRgb("invalid")).toEqual([0, 0, 0]);
      expect(hexToRgb("#")).toEqual([0, 0, 0]);
    });
  });

  describe("calculateChannelLuminance()", () => {
    test("calculates luminance for low values", () => {
      const result = calculateChannelLuminance(10);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    test("calculates luminance for high values", () => {
      const result = calculateChannelLuminance(200);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    test("returns 0 for black channel", () => {
      expect(calculateChannelLuminance(0)).toBe(0);
    });

    test("returns value close to 1 for white channel", () => {
      const result = calculateChannelLuminance(255);
      expect(result).toBeCloseTo(1, 1);
    });
  });

  describe("calculateRelativeLuminance()", () => {
    test("calculates luminance for white", () => {
      const result = calculateRelativeLuminance([255, 255, 255]);
      expect(result).toBeCloseTo(1, 1);
    });

    test("calculates luminance for black", () => {
      const result = calculateRelativeLuminance([0, 0, 0]);
      expect(result).toBe(0);
    });

    test("calculates luminance for red", () => {
      const result = calculateRelativeLuminance([255, 0, 0]);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    test("calculates luminance for green", () => {
      const result = calculateRelativeLuminance([0, 255, 0]);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    test("calculates luminance for blue", () => {
      const result = calculateRelativeLuminance([0, 0, 255]);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    test("green has higher luminance than red and blue", () => {
      const red = calculateRelativeLuminance([255, 0, 0]);
      const green = calculateRelativeLuminance([0, 255, 0]);
      const blue = calculateRelativeLuminance([0, 0, 255]);

      expect(green).toBeGreaterThan(red);
      expect(green).toBeGreaterThan(blue);
    });
  });

  describe("hexContrastRatio()", () => {
    test("calculates maximum contrast for black and white", () => {
      const ratio = hexContrastRatio("#000000", "#ffffff");
      expect(ratio).toBeCloseTo(21, 0);
    });

    test("calculates same ratio regardless of order", () => {
      const ratio1 = hexContrastRatio("#000000", "#ffffff");
      const ratio2 = hexContrastRatio("#ffffff", "#000000");
      expect(ratio1).toBe(ratio2);
    });

    test("calculates ratio of 1 for same colors", () => {
      const ratio = hexContrastRatio("#ff0000", "#ff0000");
      expect(ratio).toBe(1);
    });

    test("calculates ratio for AA compliant colors", () => {
      const ratio = hexContrastRatio("#000000", "#767676");
      expect(ratio).toBeGreaterThan(4.5);
    });

    test("calculates ratio for AAA compliant colors", () => {
      const ratio = hexContrastRatio("#000000", "#9b9b9b");
      expect(ratio).toBeGreaterThan(7);
    });

    test("handles 3-digit hex codes", () => {
      const ratio = hexContrastRatio("#000", "#fff");
      expect(ratio).toBeCloseTo(21, 0);
    });

    test("handles hex without # prefix", () => {
      const ratio = hexContrastRatio("000000", "ffffff");
      expect(ratio).toBeCloseTo(21, 0);
    });

    test("calculates realistic design system colors", () => {
      const ratio1 = hexContrastRatio("#1a1a1a", "#e0e0e0");
      expect(ratio1).toBeGreaterThan(7);

      const ratio2 = hexContrastRatio("#333333", "#ffffff");
      expect(ratio2).toBeGreaterThan(12);
    });
  });
});
