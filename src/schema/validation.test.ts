import { test, expect, describe } from "bun:test";
import {
  hexPattern,
  rgbPattern,
  rgbaPattern,
  hslPattern,
  hslaPattern,
  terminalColors,
  validateClientSchema
} from "./validation";
import type { Schema } from "../types";

describe("Color pattern regex tests", () => {
  test("hexPattern matches valid hex colors", () => {
    expect(hexPattern.test("#123")).toBe(true);
    expect(hexPattern.test("#123456")).toBe(true);
    expect(hexPattern.test("#abcdef")).toBe(true);
    expect(hexPattern.test("#ABCDEF")).toBe(true);
    expect(hexPattern.test("#123ABC")).toBe(true);
  });

  test("hexPattern rejects invalid hex colors", () => {
    expect(hexPattern.test("123")).toBe(false);
    expect(hexPattern.test("#12")).toBe(false);
    expect(hexPattern.test("#1234")).toBe(false);
    expect(hexPattern.test("#12345")).toBe(false);
    expect(hexPattern.test("#1234567")).toBe(false);
    expect(hexPattern.test("#GHIJKL")).toBe(false);
  });

  test("rgbPattern matches valid rgb colors", () => {
    expect(rgbPattern.test("rgb(0, 0, 0)")).toBe(true);
    expect(rgbPattern.test("rgb(255, 255, 255)")).toBe(true);
    expect(rgbPattern.test("rgb(100, 150, 200)")).toBe(true);
    expect(rgbPattern.test("rgb(0,0,0)")).toBe(true);
  });

  test("rgbPattern rejects invalid rgb colors", () => {
    expect(rgbPattern.test("rgb(0, 0)")).toBe(false);
    expect(rgbPattern.test("rgb(0, 0, 0, 0)")).toBe(false);
    // The regex doesn't validate numeric ranges, so rgb(256, 0, 0) is actually valid for the pattern
    expect(rgbPattern.test("rgba(0, 0, 0, 0)")).toBe(false);
    expect(rgbPattern.test("rgb(0, 0, 0")).toBe(false);
  });

  test("rgbaPattern matches valid rgba colors", () => {
    expect(rgbaPattern.test("rgba(0, 0, 0, 0)")).toBe(true);
    expect(rgbaPattern.test("rgba(255, 255, 255, 1)")).toBe(true);
    expect(rgbaPattern.test("rgba(100, 150, 200, 0.5)")).toBe(true);
    expect(rgbaPattern.test("rgba(0,0,0,0)")).toBe(true);
  });

  test("rgbaPattern rejects invalid rgba colors", () => {
    expect(rgbaPattern.test("rgba(0, 0, 0)")).toBe(false);
    expect(rgbaPattern.test("rgba(0, 0, 0, 0, 0)")).toBe(false);
    expect(rgbaPattern.test("rgba(0, 0, 0, 2)")).toBe(false); // Note: regex doesn't validate range
    expect(rgbaPattern.test("rgb(0, 0, 0)")).toBe(false);
    expect(rgbaPattern.test("rgba(0, 0, 0, 0")).toBe(false);
  });

  test("hslPattern matches valid hsl colors", () => {
    expect(hslPattern.test("hsl(0, 0%, 0%)")).toBe(true);
    expect(hslPattern.test("hsl(360, 100%, 100%)")).toBe(true);
    expect(hslPattern.test("hsl(180, 50%, 50%)")).toBe(true);
    expect(hslPattern.test("hsl(0,0%,0%)")).toBe(true);
  });

  test("hslPattern rejects invalid hsl colors", () => {
    expect(hslPattern.test("hsl(0, 0)")).toBe(false);
    expect(hslPattern.test("hsl(0, 0%, 0)")).toBe(false);
    expect(hslPattern.test("hsl(0, 0, 0%)")).toBe(false);
    expect(hslPattern.test("hsla(0, 0%, 0%, 0)")).toBe(false);
    expect(hslPattern.test("hsl(0, 0%, 0%")).toBe(false);
  });

  test("hslaPattern matches valid hsla colors", () => {
    expect(hslaPattern.test("hsla(0, 0%, 0%, 0)")).toBe(true);
    expect(hslaPattern.test("hsla(360, 100%, 100%, 1)")).toBe(true);
    expect(hslaPattern.test("hsla(180, 50%, 50%, 0.5)")).toBe(true);
    expect(hslaPattern.test("hsla(0,0%,0%,0)")).toBe(true);
  });

  test("hslaPattern rejects invalid hsla colors", () => {
    expect(hslaPattern.test("hsla(0, 0%, 0%)")).toBe(false);
    expect(hslaPattern.test("hsla(0, 0%, 0%, 0, 0)")).toBe(false);
    expect(hslaPattern.test("hsla(0, 0%, 0%, 2)")).toBe(false); // Note: regex doesn't validate range
    expect(hslaPattern.test("hsl(0, 0%, 0%)")).toBe(false);
    expect(hslaPattern.test("hsla(0, 0%, 0%, 0")).toBe(false);
  });

  test("terminalColors contains expected values", () => {
    expect(terminalColors).toContain("red");
    expect(terminalColors).toContain("blue");
    expect(terminalColors).toContain("green");
    expect(terminalColors).toContain("brightRed");
    expect(terminalColors).toContain("brightBlue");
    expect(terminalColors).toContain("brightGreen");
    expect(terminalColors.length).toBe(17);
  });
});

describe("validateClientSchema", () => {
  test("returns false for non-object values", () => {
    expect(validateClientSchema(null)).toBe(false);
    expect(validateClientSchema(undefined)).toBe(false);
    expect(validateClientSchema("string")).toBe(false);
    expect(validateClientSchema(123)).toBe(false);
    expect(validateClientSchema(true)).toBe(false);
  });

  test("returns true for empty object", () => {
    expect(validateClientSchema({})).toBe(true);
  });

  test("validates matchWords property", () => {
    expect(validateClientSchema({ matchWords: {} })).toBe(true);
    expect(validateClientSchema({ matchWords: { error: { bold: true } } })).toBe(true);
    expect(validateClientSchema({ matchWords: "invalid" })).toBe(false);
  });

  test("validates matchPatterns property", () => {
    expect(validateClientSchema({ matchPatterns: [] })).toBe(true);
    expect(validateClientSchema({ matchPatterns: [{ pattern: /test/, options: {} }] })).toBe(true);
    expect(validateClientSchema({ matchPatterns: "invalid" })).toBe(false);
  });

  test("validates defaultStyle property", () => {
    expect(validateClientSchema({ defaultStyle: {} })).toBe(true);
    expect(validateClientSchema({ defaultStyle: { bold: true } })).toBe(true);
    expect(validateClientSchema({ defaultStyle: "invalid" })).toBe(false);
  });

  test("validates lineNumbers property", () => {
    expect(validateClientSchema({ lineNumbers: true })).toBe(true);
    expect(validateClientSchema({ lineNumbers: false })).toBe(true);
    expect(validateClientSchema({ lineNumbers: "invalid" })).toBe(false);
  });

  test("validates complex schema", () => {
    const validSchema: Schema = {
      matchWords: {
        error: { bold: true, asciColor: "#ff0000" },
        warning: { asciColor: "yellow" }
      },
      matchPatterns: [
        { pattern: /ERROR/, options: { bold: true, asciColor: "red" } }
      ],
      defaultStyle: { asciColor: "white" },
      lineNumbers: true
    };
    expect(validateClientSchema(validSchema)).toBe(true);
  });

  test("validates schema with all style options", () => {
    const validSchema: Schema = {
      matchWords: {
        error: {
          bold: true,
          italic: true,
          dim: false,
          underline: true,
          asciColor: "#ff0000",
          className: "error-text"
        }
      }
    };
    expect(validateClientSchema(validSchema)).toBe(true);
  });

  test("validates schema with multiple pattern matches", () => {
    const validSchema: Schema = {
      matchPatterns: [
        { pattern: /ERROR/, options: { bold: true, asciColor: "red" } },
        { pattern: /WARNING/, options: { italic: true, asciColor: "yellow" } },
        { pattern: /INFO/, options: { asciColor: "blue" } }
      ]
    };
    expect(validateClientSchema(validSchema)).toBe(true);
  });

  test("validates schema with complex regex patterns", () => {
    const validSchema: Schema = {
      matchPatterns: [
        {
          pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
          options: { bold: true }
        },
        {
          pattern: /\b(ERROR|WARN|INFO)\b/gi,
          options: { underline: true }
        }
      ]
    };
    expect(validateClientSchema(validSchema)).toBe(true);
  });
});


