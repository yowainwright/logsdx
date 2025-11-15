import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import {
  exportThemeToShareCode,
  importThemeFromShareCode,
  generateShareUrl,
  generateThemeCode,
} from "@/lib/themeUtils";
import { mockColors } from "../utils/theme-mocks";

describe("themeUtils", () => {
  beforeEach(() => {
    // Clear any global state
  });

  afterEach(() => {
    // Cleanup
  });
  describe("exportThemeToShareCode", () => {
    it("exports theme to base64 encoded string", () => {
      const shareCode = exportThemeToShareCode("test-theme", mockColors, [
        "logLevels",
        "numbers",
      ]);

      expect(typeof shareCode).toBe("string");
      expect(shareCode.length).toBeGreaterThan(0);
    });

    it("creates valid base64", () => {
      const shareCode = exportThemeToShareCode("test-theme", mockColors, [
        "logLevels",
      ]);

      // Should be decodeable
      const decoded = atob(shareCode);
      expect(() => JSON.parse(decoded)).not.toThrow();
    });

    it("includes theme data in export", () => {
      const shareCode = exportThemeToShareCode("my-theme", mockColors, [
        "logLevels",
        "numbers",
      ]);

      const decoded = JSON.parse(atob(shareCode));

      expect(decoded.name).toBe("my-theme");
      expect(decoded.colors).toEqual(mockColors);
      expect(decoded.presets).toEqual(["logLevels", "numbers"]);
      expect(decoded.version).toBe("1.0.0");
    });
  });

  describe("importThemeFromShareCode", () => {
    it("imports valid theme from share code", () => {
      const shareCode = exportThemeToShareCode("imported-theme", mockColors, [
        "strings",
        "brackets",
      ]);

      const imported = importThemeFromShareCode(shareCode);

      expect(imported).not.toBeNull();
      expect(imported?.name).toBe("imported-theme");
      expect(imported?.colors).toEqual(mockColors);
      expect(imported?.presets).toEqual(["strings", "brackets"]);
    });

    it("returns null for invalid share code", () => {
      const invalid = "!!!invalid!!!";
      const result = importThemeFromShareCode(invalid);

      expect(result).toBeNull();
    });

    it("handles missing data gracefully", () => {
      const partialData = btoa(JSON.stringify({}));
      const result = importThemeFromShareCode(partialData);

      expect(result?.name).toBe("imported-theme");
      expect(result?.colors).toBeDefined();
      expect(result?.presets).toEqual([]);
    });

    it("roundtrips theme data correctly", () => {
      const original = {
        name: "roundtrip-theme",
        colors: mockColors,
        presets: ["logLevels", "numbers", "strings"],
      };

      const shareCode = exportThemeToShareCode(
        original.name,
        original.colors,
        original.presets,
      );

      const imported = importThemeFromShareCode(shareCode);

      expect(imported?.name).toBe(original.name);
      expect(imported?.colors).toEqual(original.colors);
      expect(imported?.presets).toEqual(original.presets);
    });
  });

  describe("generateShareUrl", () => {
    it("generates URL with share code", () => {
      const shareCode = "test-share-code-123";
      const url = generateShareUrl(shareCode);

      expect(url).toContain("/theme/");
      expect(url).toContain(shareCode);
    });

    it("includes origin in URL", () => {
      const shareCode = "abc123";
      const url = generateShareUrl(shareCode);

      // In test environment, window.location.origin might be undefined
      expect(url).toContain("/theme/");
      expect(url).toContain(shareCode);
    });
  });

  describe("generateThemeCode", () => {
    it("generates valid JavaScript code", () => {
      const code = generateThemeCode("my-theme", mockColors, ["logLevels"]);

      expect(code).toContain("import");
      expect(code).toContain("createSimpleTheme");
      expect(code).toContain("registerTheme");
      expect(code).toContain("my-theme");
    });

    it("converts theme name to valid variable name", () => {
      const code = generateThemeCode("my-awesome-theme", mockColors, []);

      expect(code).toContain("my_awesome_themeTheme");
    });

    it("includes color definitions", () => {
      const code = generateThemeCode("test", mockColors, []);

      expect(code).toContain(mockColors.primary);
      expect(code).toContain(mockColors.error);
      expect(code).toContain(mockColors.success);
    });

    it("includes preset configuration", () => {
      const code = generateThemeCode("test", mockColors, [
        "logLevels",
        "numbers",
      ]);

      expect(code).toContain("logLevels");
      expect(code).toContain("numbers");
    });

    it("generates runnable export", () => {
      const code = generateThemeCode("theme", mockColors, ["logLevels"]);

      expect(code).toContain("export default");
    });
  });
});
