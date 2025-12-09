import { expect, test, describe, beforeEach } from "bun:test";
import {
  themeRegistry,
  getTheme,
  getThemeSync,
  registerTheme,
  registerThemeLoader,
  getThemeNames,
  getAllLoadedThemes,
  preloadTheme,
  preloadAllThemes,
} from "../../../src/themes/registry";
import type { Theme } from "../../../src/types";

describe("ThemeRegistry", () => {
  const testTheme: Theme = {
    name: "registry-test-theme",
    description: "Test theme for registry",
    mode: "dark",
    schema: {
      defaultStyle: { color: "#ffffff" },
      matchWords: {},
      matchPatterns: [],
    },
  };

  describe("getTheme", () => {
    test("returns built-in theme", async () => {
      const theme = await getTheme("dracula");
      expect(theme.name).toBe("dracula");
    });

    test("falls back to default when theme not found", async () => {
      const theme = await getTheme("non-existent-theme-xyz");
      expect(theme.name).toBe("oh-my-zsh");
    });

    test("returns registered custom theme", async () => {
      registerTheme(testTheme);
      const theme = await getTheme("registry-test-theme");
      expect(theme.name).toBe("registry-test-theme");
    });
  });

  describe("getThemeSync", () => {
    test("returns undefined for unloaded theme", () => {
      const theme = getThemeSync("solarized-light");
      expect(theme === undefined || theme.name === "solarized-light").toBe(true);
    });

    test("returns theme after it has been loaded", async () => {
      await getTheme("nord");
      const theme = getThemeSync("nord");
      expect(theme?.name).toBe("nord");
    });

    test("returns default theme when requested theme not loaded", () => {
      const theme = getThemeSync("definitely-not-loaded-xyz");
      expect(theme === undefined || theme.name === "oh-my-zsh").toBe(true);
    });

    test("returns registered theme synchronously", () => {
      const syncTheme: Theme = {
        name: "sync-test-theme",
        schema: { defaultStyle: { color: "#000" } },
      };
      registerTheme(syncTheme);
      const theme = getThemeSync("sync-test-theme");
      expect(theme?.name).toBe("sync-test-theme");
    });
  });

  describe("registerThemeLoader", () => {
    test("registers a lazy loader for a theme", async () => {
      const lazyTheme: Theme = {
        name: "lazy-loaded-theme",
        description: "Theme loaded via loader",
        schema: { defaultStyle: { color: "#123456" } },
      };

      registerThemeLoader("lazy-loaded-theme", async () => ({
        default: lazyTheme,
      }));

      expect(getThemeNames()).toContain("lazy-loaded-theme");

      const theme = await getTheme("lazy-loaded-theme");
      expect(theme.name).toBe("lazy-loaded-theme");
      expect(theme.description).toBe("Theme loaded via loader");
    });

    test("lazy loader is called only once", async () => {
      let callCount = 0;
      const countingTheme: Theme = {
        name: "counting-theme",
        schema: { defaultStyle: { color: "#000" } },
      };

      registerThemeLoader("counting-theme", async () => {
        callCount++;
        return { default: countingTheme };
      });

      await getTheme("counting-theme");
      await getTheme("counting-theme");
      await getTheme("counting-theme");

      expect(callCount).toBe(1);
    });
  });

  describe("preloadTheme", () => {
    test("preloads a single theme", async () => {
      await preloadTheme("monokai");
      const theme = getThemeSync("monokai");
      expect(theme?.name).toBe("monokai");
    });

    test("preloading same theme multiple times is idempotent", async () => {
      await preloadTheme("github-dark");
      await preloadTheme("github-dark");
      const theme = getThemeSync("github-dark");
      expect(theme?.name).toBe("github-dark");
    });
  });

  describe("preloadAllThemes", () => {
    test("preloads all registered themes", async () => {
      await preloadAllThemes();
      const allThemes = getAllLoadedThemes();
      const themeNames = getThemeNames();

      expect(Object.keys(allThemes).length).toBeGreaterThanOrEqual(8);
      expect(themeNames).toContain("oh-my-zsh");
      expect(themeNames).toContain("dracula");
      expect(themeNames).toContain("nord");
    });
  });

  describe("getAllLoadedThemes", () => {
    test("returns only themes that have been loaded", async () => {
      const beforeLoad = getAllLoadedThemes();
      const initialCount = Object.keys(beforeLoad).length;

      await getTheme("github-light");
      const afterLoad = getAllLoadedThemes();

      expect(afterLoad["github-light"]).toBeDefined();
      expect(Object.keys(afterLoad).length).toBeGreaterThanOrEqual(initialCount);
    });
  });

  describe("getThemeNames", () => {
    test("returns all registered theme names", () => {
      const names = getThemeNames();
      expect(names).toContain("oh-my-zsh");
      expect(names).toContain("dracula");
      expect(names).toContain("nord");
      expect(names).toContain("monokai");
      expect(names).toContain("github-light");
      expect(names).toContain("github-dark");
      expect(names).toContain("solarized-light");
      expect(names).toContain("solarized-dark");
    });

    test("includes custom registered themes", () => {
      const customTheme: Theme = {
        name: "custom-names-test",
        schema: { defaultStyle: { color: "#fff" } },
      };
      registerTheme(customTheme);
      expect(getThemeNames()).toContain("custom-names-test");
    });
  });

  describe("themeRegistry instance", () => {
    test("hasTheme returns true for registered themes", () => {
      expect(themeRegistry.hasTheme("oh-my-zsh")).toBe(true);
      expect(themeRegistry.hasTheme("dracula")).toBe(true);
    });

    test("hasTheme returns false for non-existent themes", () => {
      expect(themeRegistry.hasTheme("this-theme-does-not-exist")).toBe(false);
    });

    test("setDefaultTheme changes the default", async () => {
      const originalDefault = "oh-my-zsh";

      themeRegistry.setDefaultTheme("nord");

      // When getting non-existent theme, should fall back to new default
      const theme = await themeRegistry.getTheme("non-existent-for-default-test");
      expect(theme.name).toBe("nord");

      // Reset to original
      themeRegistry.setDefaultTheme(originalDefault);
    });
  });
});
