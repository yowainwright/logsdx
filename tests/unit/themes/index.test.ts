import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import {
  getTheme,
  getAllThemes,
  getThemeNames,
  registerTheme,
} from "../../../src/themes/index";
import { THEMES, DEFAULT_THEME } from "../../../src/themes/constants";

describe("Theme Management", () => {
  const originalConsoleLog = console.log;
  let consoleOutput: string[] = [];

  beforeEach(() => {
    consoleOutput = [];
    console.log = (message: string) => {
      consoleOutput.push(message);
    };
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe("getTheme", () => {
    test("returns the requested theme when it exists", async () => {
      const theme = await getTheme(DEFAULT_THEME);
      expect(theme.name).toBe(DEFAULT_THEME);
    });

    test("returns a theme when requested theme doesn't exist (falls back to default)", async () => {
      const theme = await getTheme("non-existent-theme");
      expect(theme).toBeDefined();
      expect(theme.name).toBe(DEFAULT_THEME);
    });
  });

  describe("getAllThemes", () => {
    test("returns all available themes", () => {
      const themes = getAllThemes();
      expect(typeof themes).toBe("object");
    });
  });

  describe("getThemeNames", () => {
    test("returns array of all theme names", () => {
      const themeNames = getThemeNames();
      expect(Array.isArray(themeNames)).toBe(true);
      expect(themeNames.length).toBeGreaterThan(0);
    });

    test("includes the default theme", () => {
      const themeNames = getThemeNames();
      expect(themeNames).toContain(DEFAULT_THEME);
    });
  });

  describe("registerTheme", () => {
    test("registers a new theme and makes it available", async () => {
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

      expect(await getTheme("test-theme")).toEqual(testTheme);
      expect(getThemeNames()).toContain("test-theme");
      expect(getAllThemes()["test-theme"]).toEqual(testTheme);
    });

    test("overwrites existing theme with same name", async () => {
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

      const theme = await getTheme("overwrite-test");
      expect(theme).toEqual(secondTheme);
      expect(theme.description).toBe("Second version");
    });
  });
});
