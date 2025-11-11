import { describe, it, expect } from "bun:test";
import {
  generateTemplateFromAnswers,
  validateColorInput,
  generatePatternFromPreset,
} from "../../../../src/cli/theme/generator";
import {
  COLOR_PALETTES,
  PATTERN_PRESETS,
} from "../../../../src/themes/template";

describe("Theme Generator", () => {
  describe("validateColorInput", () => {
    it("should validate hex colors", () => {
      expect(validateColorInput("#ff0000")).toBe(true);
      expect(validateColorInput("#f00")).toBe(true);
      expect(validateColorInput("#ff0000aa")).toBe(true);
      expect(validateColorInput("#gggggg")).toBe(false);
      expect(validateColorInput("ff0000")).toBe(false);
    });

    it("should validate rgb colors", () => {
      expect(validateColorInput("rgb(255, 0, 0)")).toBe(true);
      expect(validateColorInput("rgba(255, 0, 0, 0.5)")).toBe(true);
      expect(validateColorInput("rgb(256, 0, 0)")).toBe(true); 
    });

    it("should validate named colors", () => {
      expect(validateColorInput("red")).toBe(true);
      expect(validateColorInput("blue")).toBe(true);
      expect(validateColorInput("notacolor")).toBe(true); 
    });
  });

  describe("generatePatternFromPreset", () => {
    it("should generate timestamp pattern", () => {
      const pattern = generatePatternFromPreset("timestamp");
      expect(pattern).toEqual({
        name: "timestamp",
        pattern: "\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}",
        options: {
          color: "muted",
          styleCodes: ["dim"],
        },
      });
    });

    it("should generate IP address pattern", () => {
      const pattern = generatePatternFromPreset("ip");
      expect(pattern).toEqual({
        name: "ip",
        pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
        options: {
          color: "info",
        },
      });
    });

    it("should return empty object for unknown preset", () => {
      const pattern = generatePatternFromPreset("unknown");
      expect(pattern).toEqual({});
    });
  });

  describe("generateTemplateFromAnswers", () => {
    it("should generate a basic theme", () => {
      const theme = generateTemplateFromAnswers({
        name: "test-theme",
        description: "Test theme",
        mode: "dark",
        palette: "github-dark",
        features: ["logLevels"],
        patterns: [],
      });

      expect(theme.name).toBe("test-theme");
      expect(theme.description).toBe("Test theme");
      expect(theme.mode).toBe("dark");
      expect(theme.schema.matchWords).toHaveProperty("ERROR");
      expect(theme.schema.matchWords).toHaveProperty("WARN");
      expect(theme.schema.matchWords).toHaveProperty("INFO");
    });

    it("should include custom palette colors", () => {
      const theme = generateTemplateFromAnswers({
        name: "custom-theme",
        mode: "light",
        palette: "github-light",
        features: [],
        patterns: [],
      });

      COLOR_PALETTES.find((p) => p.name === "github-light");
      expect(theme.schema.defaultStyle?.color).toBeDefined();
    });

    it("should include selected patterns", () => {
      const theme = generateTemplateFromAnswers({
        name: "pattern-theme",
        mode: "dark",
        palette: "github-dark",
        features: [],
        patterns: ["log-levels", "http-api"],
      });

      expect(theme.schema.matchPatterns).toBeDefined();
      expect(theme.schema.matchPatterns?.length).toBeGreaterThan(0);
    });

    it("should handle features correctly", () => {
      const theme = generateTemplateFromAnswers({
        name: "feature-theme",
        mode: "dark",
        palette: "github-dark",
        features: ["numbers", "brackets", "booleans"],
        patterns: [],
      });

      expect(theme.schema.matchWords).toHaveProperty("true");
      expect(theme.schema.matchWords).toHaveProperty("false");
      expect(theme.schema.matchWords).toHaveProperty("null");

      
      expect(theme.schema.matchStartsWith).toBeDefined();
      expect(theme.schema.matchEndsWith).toBeDefined();

      
      expect(theme.schema.matchStartsWith?.["["]).toBeDefined();
      expect(theme.schema.matchEndsWith?.["]"]).toBeDefined();
    });
  });

  describe("COLOR_PALETTES", () => {
    it("should have all required palettes", () => {
      const paletteNames = COLOR_PALETTES.map((p) => p.name);
      expect(paletteNames).toContain("github-light");
      expect(paletteNames).toContain("github-dark");
      expect(paletteNames).toContain("dracula");
      expect(paletteNames).toContain("solarized-dark");
      expect(paletteNames).toContain("monokai");
      expect(paletteNames).toContain("high-contrast");
    });

    it("should have all required colors in each palette", () => {
      COLOR_PALETTES.forEach((palette) => {
        expect(palette.colors).toHaveProperty("primary");
        expect(palette.colors).toHaveProperty("error");
        expect(palette.colors).toHaveProperty("warning");
        expect(palette.colors).toHaveProperty("success");
        expect(palette.colors).toHaveProperty("info");
        expect(palette.colors).toHaveProperty("muted");
      });
    });
  });

  describe("PATTERN_PRESETS", () => {
    it("should have common patterns", () => {
      const presetNames = PATTERN_PRESETS.map((p) => p.name);
      expect(presetNames).toContain("log-levels");
      expect(presetNames).toContain("http-api");
      expect(presetNames).toContain("system-logs");
      expect(presetNames).toContain("database-logs");
    });

    it("should have valid regex patterns", () => {
      PATTERN_PRESETS.forEach((preset) => {
        preset.patterns.forEach((pattern) => {
          expect(() => new RegExp(pattern.pattern)).not.toThrow();
        });
      });
    });
  });
});
