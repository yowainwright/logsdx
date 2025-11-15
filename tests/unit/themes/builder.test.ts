import { expect, test, describe } from "bun:test";
import {
  createTheme,
  createSimpleTheme,
  extendTheme,
  checkWCAGCompliance,
  adjustThemeForAccessibility,
  ThemeBuilder,
  type ColorPalette,
  type SimpleThemeConfig,
} from "../../../src/themes/builder";
import type { Theme } from "../../../src/types";

describe("Theme Builder", () => {
  const testPalette: ColorPalette = {
    primary: "#0969da",
    secondary: "#1f883d",
    error: "#d1242f",
    warning: "#bf8700",
    info: "#0969da",
    success: "#1a7f37",
    muted: "#656d76",
    background: "#ffffff",
    text: "#24292f",
  };

  describe("createTheme", () => {
    test("creates a basic theme with minimal config", () => {
      const config: SimpleThemeConfig = {
        name: "test-theme",
        colors: testPalette,
      };

      const theme = createTheme(config);

      expect(theme.name).toBe("test-theme");
      expect(theme.schema.defaultStyle?.color).toBe(testPalette.text);
      expect(theme.colors).toEqual(testPalette);
    });

    test("applies default presets when none specified", () => {
      const config: SimpleThemeConfig = {
        name: "test-theme",
        colors: testPalette,
      };

      const theme = createTheme(config);

      expect(theme.schema.matchWords).toBeDefined();
      expect(theme.schema.matchWords?.ERROR).toBeDefined();
      expect(theme.schema.matchWords?.INFO).toBeDefined();
      expect(theme.schema.matchPatterns).toBeDefined();
      expect(theme.schema.matchPatterns!.length).toBeGreaterThan(0);
    });

    test("includes custom words", () => {
      const config: SimpleThemeConfig = {
        name: "test-theme",
        colors: testPalette,
        customWords: {
          CUSTOM: { color: "#ff0000", styleCodes: ["bold"] },
          ANOTHER: "#00ff00",
        },
      };

      const theme = createTheme(config);

      expect(theme.schema.matchWords?.CUSTOM).toEqual({
        color: "#ff0000",
        styleCodes: ["bold"],
      });
      expect(theme.schema.matchWords?.ANOTHER).toEqual({
        color: "#00ff00",
      });
    });

    test("includes custom patterns", () => {
      const config: SimpleThemeConfig = {
        name: "test-theme",
        colors: testPalette,
        customPatterns: [
          {
            name: "custom-pattern",
            pattern: "\\d{3}-\\d{3}-\\d{4}",
            color: "primary",
            style: ["bold", "underline"],
          },
        ],
      };

      const theme = createTheme(config);

      const customPattern = theme.schema.matchPatterns?.find(
        (p) => p.name === "custom-pattern",
      );
      expect(customPattern).toBeDefined();
      expect(customPattern?.options.color).toBe(testPalette.primary);
      expect(customPattern?.options.styleCodes).toEqual(["bold", "underline"]);
    });

    test("sets description and mode", () => {
      const config: SimpleThemeConfig = {
        name: "test-theme",
        description: "A test theme",
        mode: "light",
        colors: testPalette,
      };

      const theme = createTheme(config);

      expect(theme.description).toBe("A test theme");
      expect(theme.mode).toBe("light");
    });

    test("respects whiteSpace and newLine settings", () => {
      const config: SimpleThemeConfig = {
        name: "test-theme",
        colors: testPalette,
        whiteSpace: "trim",
        newLine: "trim",
      };

      const theme = createTheme(config);

      expect(theme.schema.whiteSpace).toBe("trim");
      expect(theme.schema.newLine).toBe("trim");
    });
  });

  describe("createSimpleTheme", () => {
    test("creates theme with name and colors", () => {
      const theme = createSimpleTheme("simple-test", testPalette);

      expect(theme.name).toBe("simple-test");
      expect(theme.colors).toEqual(testPalette);
    });

    test("accepts additional options", () => {
      const theme = createSimpleTheme("simple-test", testPalette, {
        description: "Simple theme description",
        mode: "dark",
      });

      expect(theme.description).toBe("Simple theme description");
      expect(theme.mode).toBe("dark");
    });

    test("applies default presets", () => {
      const theme = createSimpleTheme("simple-test", testPalette);

      expect(theme.schema.matchWords?.ERROR).toBeDefined();
      expect(theme.schema.matchPatterns!.length).toBeGreaterThan(0);
    });
  });

  describe("extendTheme", () => {
    const baseTheme: Theme = {
      name: "base-theme",
      mode: "dark",
      schema: {
        defaultStyle: { color: "#ffffff" },
        matchWords: {
          ERROR: { color: "#ff0000", styleCodes: ["bold"] },
          WARN: { color: "#ffaa00" },
        },
        matchPatterns: [
          {
            name: "timestamp",
            pattern: "\\d{4}-\\d{2}-\\d{2}",
            options: { color: "#666666" },
          },
        ],
      },
    };

    test("creates extended theme with new name", () => {
      const extended = extendTheme(baseTheme, {
        name: "extended-theme",
        colors: testPalette,
      });

      expect(extended.name).toBe("extended-theme");
    });

    test("generates default name if not provided", () => {
      const extended = extendTheme(baseTheme, {
        colors: testPalette,
      });

      expect(extended.name).toBe("base-theme-extended");
      expect(extended.description).toContain("Extended version");
    });

    test("preserves base theme words when no presets specified", () => {
      const extended = extendTheme(baseTheme, {
        colors: testPalette,
      });

      expect(extended.schema.matchWords?.ERROR).toBeDefined();
      expect(extended.schema.matchWords?.WARN).toBeDefined();
    });

    test("adds custom words to base theme", () => {
      const extended = extendTheme(baseTheme, {
        colors: testPalette,
        customWords: {
          CUSTOM: "#00ff00",
        },
      });

      expect(extended.schema.matchWords?.ERROR).toBeDefined();
      expect(extended.schema.matchWords?.CUSTOM).toBeDefined();
    });

    test("preserves whiteSpace and newLine settings", () => {
      const baseWithSettings: Theme = {
        ...baseTheme,
        schema: {
          ...baseTheme.schema,
          whiteSpace: "trim",
          newLine: "preserve",
        },
      };

      const extended = extendTheme(baseWithSettings, {
        colors: testPalette,
      });

      expect(extended.schema.whiteSpace).toBe("trim");
      expect(extended.schema.newLine).toBe("preserve");
    });

    test("overrides whiteSpace and newLine when provided", () => {
      const extended = extendTheme(baseTheme, {
        colors: testPalette,
        whiteSpace: "trim",
        newLine: "trim",
      });

      expect(extended.schema.whiteSpace).toBe("trim");
      expect(extended.schema.newLine).toBe("trim");
    });
  });

  describe("checkWCAGCompliance", () => {
    test("checks compliance for theme with good contrast", () => {
      const theme: Theme = {
        name: "high-contrast",
        schema: { defaultStyle: { color: "#000000" } },
        colors: {
          text: "#000000",
          background: "#ffffff",
        },
      };

      const result = checkWCAGCompliance(theme);

      expect(result.level).toBe("AAA");
      expect(result.details.normalText.ratio).toBeGreaterThan(7);
    });

    test("checks compliance for theme with poor contrast", () => {
      const theme: Theme = {
        name: "low-contrast",
        schema: { defaultStyle: { color: "#aaaaaa" } },
        colors: {
          text: "#aaaaaa",
          background: "#bbbbbb",
        },
      };

      const result = checkWCAGCompliance(theme);

      expect(result.level).toBe("FAIL");
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    test("uses default colors when theme colors not provided", () => {
      const theme: Theme = {
        name: "no-colors",
        schema: { defaultStyle: { color: "#ffffff" } },
      };

      const result = checkWCAGCompliance(theme);

      expect(result.level).toBeDefined();
      expect(result.details.normalText.ratio).toBeGreaterThan(0);
    });
  });

  describe("adjustThemeForAccessibility", () => {
    test("returns theme unchanged if contrast is good", () => {
      const theme: Theme = {
        name: "good-contrast",
        schema: { defaultStyle: { color: "#000000" } },
        colors: {
          text: "#000000",
          background: "#ffffff",
        },
      };

      const adjusted = adjustThemeForAccessibility(theme, 4.5);

      expect(adjusted.colors?.text).toBe("#000000");
      expect(adjusted.colors?.background).toBe("#ffffff");
    });

    test("adjusts theme with poor contrast", () => {
      const theme: Theme = {
        name: "poor-contrast",
        schema: { defaultStyle: { color: "#aaaaaa" } },
        colors: {
          text: "#aaaaaa",
          background: "#bbbbbb",
        },
      };

      const adjusted = adjustThemeForAccessibility(theme, 4.5);

      expect(adjusted).toBeDefined();
      expect(adjusted.colors).toBeDefined();
    });

    test("accepts custom target contrast ratio", () => {
      const theme: Theme = {
        name: "test-theme",
        schema: { defaultStyle: { color: "#666666" } },
        colors: {
          text: "#666666",
          background: "#ffffff",
        },
      };

      const adjustedAA = adjustThemeForAccessibility(theme, 4.5);
      const adjustedAAA = adjustThemeForAccessibility(theme, 7);

      expect(adjustedAA).toBeDefined();
      expect(adjustedAAA).toBeDefined();
    });

    test("creates colors object if not present", () => {
      const theme: Theme = {
        name: "no-colors",
        schema: { defaultStyle: { color: "#666666" } },
      };

      const adjusted = adjustThemeForAccessibility(theme, 4.5);

      expect(adjusted).toBeDefined();
      if (adjusted.colors) {
        expect(Object.keys(adjusted.colors).length).toBeGreaterThan(0);
      }
    });
  });

  describe("ThemeBuilder", () => {
    test("creates theme builder with name", () => {
      const builder = new ThemeBuilder("builder-theme");
      expect(builder).toBeDefined();
    });

    test("builds theme with colors", () => {
      const theme = new ThemeBuilder("builder-theme")
        .colors(testPalette)
        .build();

      expect(theme.name).toBe("builder-theme");
      expect(theme.colors).toEqual(testPalette);
    });

    test("builds theme with mode", () => {
      const theme = new ThemeBuilder("builder-theme")
        .colors(testPalette)
        .mode("dark")
        .build();

      expect(theme.mode).toBe("dark");
    });

    test("supports method chaining", () => {
      const theme = new ThemeBuilder("builder-theme")
        .colors(testPalette)
        .mode("light")
        .build();

      expect(theme.name).toBe("builder-theme");
      expect(theme.mode).toBe("light");
      expect(theme.colors).toEqual(testPalette);
    });

    test("throws error when building without name", () => {
      const builder = new ThemeBuilder("");

      expect(() => {
        builder.colors(testPalette).build();
      }).toThrow("name");
    });

    test("throws error when building without colors", () => {
      const builder = new ThemeBuilder("test");

      expect(() => {
        builder.build();
      }).toThrow("colors");
    });

    test("provides detailed error message for missing fields", () => {
      const builder = new ThemeBuilder("");

      expect(() => {
        builder.build();
      }).toThrow("Missing required fields");
    });

    test("static create method works", () => {
      const theme = ThemeBuilder.create("static-theme")
        .colors(testPalette)
        .build();

      expect(theme.name).toBe("static-theme");
    });
  });
});
