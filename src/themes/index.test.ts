import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { getTheme, getAllThemes, getThemeNames, applyTheme, resetToDefaultTheme } from "./index";
import { THEMES, DEFAULT_THEME } from "./constants";

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

  describe("applyTheme", () => {
    test("logs the applied theme name", () => {
      applyTheme("dark-theme");
      expect(consoleOutput).toEqual(["Applied theme: dark-theme"]);
    });
  });

  describe("resetToDefaultTheme", () => {
    test("applies the default theme", () => {
      resetToDefaultTheme();
      expect(consoleOutput).toEqual([`Applied theme: ${DEFAULT_THEME}`]);
    });
  });
});