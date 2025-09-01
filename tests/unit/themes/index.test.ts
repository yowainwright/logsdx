import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import {
  getTheme,
  getAllThemes,
  getThemeNames,
  registerTheme,
} from "../../../src/themes/index";
import { THEMES, DEFAULT_THEME } from "../../../src/themes/constants";

describe("Theme Management", () => {
  // Save original console.log
  const originalConsoleLog = console.log;
  let consoleOutput: string[] = [];

  // Mock console.log before each test
  beforeEach(() => {
    consoleOutput = [];
    console.log = (message: string) => {
      consoleOutput.push(message);
    };
  });

  // Restore console.log after each test
  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe("getTheme", () => {
    test("returns the requested theme when it exists", () => {
      const theme = getTheme(DEFAULT_THEME);
      expect(theme).toEqual(THEMES[DEFAULT_THEME]);
    });

    test("returns the default theme when requested theme doesn't exist", () => {
      const theme = getTheme("non-existent-theme");
      expect(theme).toEqual(THEMES[DEFAULT_THEME]);
    });
  });

  describe("getAllThemes", () => {
    test("returns all available themes", () => {
      const themes = getAllThemes();
      expect(themes).toEqual(THEMES);
    });
  });

  describe("getThemeNames", () => {
    test("returns array of all theme names", () => {
      const themeNames = getThemeNames();
      expect(themeNames).toEqual(Object.keys(THEMES));
    });

    test("includes the default theme", () => {
      const themeNames = getThemeNames();
      expect(themeNames).toContain(DEFAULT_THEME);
    });
  });

  describe("registerTheme", () => {
    test("registers a new theme and makes it available", () => {
      const testTheme = {
        name: "test-theme",
        description: "A test theme",
        schema: {
          defaultStyle: { color: "white" },
          matchWords: {},
          matchPatterns: [],
          whiteSpace: "preserve" as const,
          newLine: "preserve" as const,
        },
      };

      registerTheme(testTheme);

      // Verify theme was registered
      expect(getTheme("test-theme")).toEqual(testTheme);
      expect(getThemeNames()).toContain("test-theme");
      expect(getAllThemes()["test-theme"]).toEqual(testTheme);
    });

    test("overwrites existing theme with same name", () => {
      const firstTheme = {
        name: "overwrite-test",
        description: "First version",
        schema: {
          defaultStyle: { color: "red" },
          matchWords: {},
          matchPatterns: [],
          whiteSpace: "preserve" as const,
          newLine: "preserve" as const,
        },
      };

      const secondTheme = {
        name: "overwrite-test",
        description: "Second version",
        schema: {
          defaultStyle: { color: "blue" },
          matchWords: {},
          matchPatterns: [],
          whiteSpace: "preserve" as const,
          newLine: "preserve" as const,
        },
      };

      registerTheme(firstTheme);
      registerTheme(secondTheme);

      // Should have the second theme
      expect(getTheme("overwrite-test")).toEqual(secondTheme);
      expect(getTheme("overwrite-test").description).toBe("Second version");
    });
  });
});
