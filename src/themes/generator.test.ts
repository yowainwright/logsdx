import { expect, test, describe } from "bun:test";
import {
  colorPaletteSchema,
  patternPresetSchema,
  themeGeneratorConfigSchema,
  getColorPalette,
  getPatternPreset,
  listColorPalettes,
  listPatternPresets,
  generateTheme,
  COLOR_PALETTES,
  PATTERN_PRESETS,
} from "./generator";

describe("Theme Generator Schemas", () => {
  test("colorPaletteSchema should validate valid palette", () => {
    const validPalette = {
      name: "test-palette",
      description: "A test palette",
      colors: {
        primary: "#007acc",
        secondary: "#28a745",
        success: "#1a7f37",
        warning: "#bf8700",
        error: "#d1242f",
        info: "#0969da",
        muted: "#656d76",
        background: "#ffffff",
        text: "#24292f",
      },
      accessibility: {
        contrastRatio: 7.2,
        colorBlindSafe: true,
        darkMode: false,
      },
    };

    const result = colorPaletteSchema.parse(validPalette);
    expect(result.name).toBe("test-palette");
    expect(result.colors.primary).toBe("#007acc");
    expect(result.accessibility.contrastRatio).toBe(7.2);
  });

  test("patternPresetSchema should validate valid preset", () => {
    const validPreset = {
      name: "test-preset",
      description: "A test preset",
      category: "api" as const,
      patterns: [
        {
          name: "status-code",
          pattern: "\\b\\d{3}\\b",
          description: "HTTP status codes",
          colorRole: "primary" as const,
          styleCodes: ["bold"],
        },
      ],
      matchWords: {
        GET: {
          colorRole: "primary" as const,
        },
      },
    };

    const result = patternPresetSchema.parse(validPreset);
    expect(result.name).toBe("test-preset");
    expect(result.category).toBe("api");
    expect(result.patterns[0].colorRole).toBe("primary");
  });

  test("themeGeneratorConfigSchema should validate valid config", () => {
    const validConfig = {
      name: "test-theme",
      description: "A test theme",
      colorPalette: "github-light",
      patternPresets: ["log-levels", "http-api"],
      customPatterns: [
        {
          name: "custom-pattern",
          pattern: "\\bCUSTOM\\b",
          colorRole: "warning" as const,
        },
      ],
      customWords: {
        CUSTOM: {
          colorRole: "error" as const,
          styleCodes: ["bold"],
        },
      },
      options: {
        whiteSpace: "preserve" as const,
        newLine: "preserve" as const,
      },
    };

    const result = themeGeneratorConfigSchema.parse(validConfig);
    expect(result.name).toBe("test-theme");
    expect(result.patternPresets).toEqual(["log-levels", "http-api"]);
    expect(result.customWords?.CUSTOM.colorRole).toBe("error");
  });
});

describe("Color Palette Functions", () => {
  test("getColorPalette should return palette by name", () => {
    const palette = getColorPalette("github-light");
    expect(palette).toBeDefined();
    expect(palette?.name).toBe("github-light");
    expect(palette?.colors.primary).toBe("#0969da");
  });

  test("getColorPalette should return undefined for non-existent palette", () => {
    const palette = getColorPalette("non-existent");
    expect(palette).toBeUndefined();
  });

  test("listColorPalettes should return all palettes", () => {
    const palettes = listColorPalettes();
    expect(palettes.length).toBeGreaterThan(0);
    expect(palettes).toEqual(COLOR_PALETTES);
  });

  test("all built-in palettes should be valid", () => {
    COLOR_PALETTES.forEach((palette) => {
      expect(() => colorPaletteSchema.parse(palette)).not.toThrow();
    });
  });
});

describe("Pattern Preset Functions", () => {
  test("getPatternPreset should return preset by name", () => {
    const preset = getPatternPreset("log-levels");
    expect(preset).toBeDefined();
    expect(preset?.name).toBe("log-levels");
    expect(preset?.category).toBe("generic");
  });

  test("getPatternPreset should return undefined for non-existent preset", () => {
    const preset = getPatternPreset("non-existent");
    expect(preset).toBeUndefined();
  });

  test("listPatternPresets should return all presets", () => {
    const presets = listPatternPresets();
    expect(presets.length).toBeGreaterThan(0);
    expect(presets).toEqual(PATTERN_PRESETS);
  });

  test("listPatternPresets should filter by category", () => {
    const apiPresets = listPatternPresets("api");
    expect(apiPresets.length).toBeGreaterThan(0);
    apiPresets.forEach((preset) => {
      expect(preset.category).toBe("api");
    });
  });

  test("all built-in presets should be valid", () => {
    PATTERN_PRESETS.forEach((preset) => {
      expect(() => patternPresetSchema.parse(preset)).not.toThrow();
    });
  });
});

describe("Theme Generation", () => {
  test("generateTheme should create valid theme from config", () => {
    const config = {
      name: "test-theme",
      description: "A test theme",
      colorPalette: "github-light",
      patternPresets: ["log-levels"],
    };

    const theme = generateTheme(config);
    expect(theme.name).toBe("test-theme");
    expect(theme.description).toBe("A test theme");
    expect(theme.schema).toBeDefined();
    expect(theme.schema.defaultStyle).toBeDefined();
    expect(theme.schema.matchWords).toBeDefined();
    expect(theme.schema.matchPatterns).toBeDefined();
  });

  test("generateTheme should throw for invalid palette", () => {
    const config = {
      name: "test-theme",
      colorPalette: "non-existent-palette",
      patternPresets: ["log-levels"],
    };

    expect(() => generateTheme(config)).toThrow(
      "Color palette 'non-existent-palette' not found",
    );
  });

  test("generateTheme should throw for invalid preset", () => {
    const config = {
      name: "test-theme",
      colorPalette: "github-light",
      patternPresets: ["non-existent-preset"],
    };

    expect(() => generateTheme(config)).toThrow(
      "Pattern preset 'non-existent-preset' not found",
    );
  });

  test("generateTheme should include custom patterns", () => {
    const config = {
      name: "test-theme",
      colorPalette: "github-light",
      patternPresets: ["log-levels"],
      customPatterns: [
        {
          name: "custom-pattern",
          pattern: "\\bCUSTOM\\b",
          colorRole: "warning" as const,
        },
      ],
    };

    const theme = generateTheme(config);
    const customPattern = theme.schema.matchPatterns?.find(
      (p) => p.name === "custom-pattern",
    );
    expect(customPattern).toBeDefined();
    expect(customPattern?.pattern).toBe("\\bCUSTOM\\b");
  });

  test("generateTheme should include custom words", () => {
    const config = {
      name: "test-theme",
      colorPalette: "github-light",
      patternPresets: ["log-levels"],
      customWords: {
        CUSTOM: {
          colorRole: "error" as const,
          styleCodes: ["bold"],
        },
      },
    };

    const theme = generateTheme(config);
    expect(theme.schema.matchWords?.CUSTOM).toBeDefined();
    expect(theme.schema.matchWords?.CUSTOM.color).toBe("#d1242f"); // github-light error color
    expect(theme.schema.matchWords?.CUSTOM.styleCodes).toEqual(["bold"]);
  });

  test("generateTheme should combine multiple presets", () => {
    const config = {
      name: "test-theme",
      colorPalette: "github-light",
      patternPresets: ["log-levels", "http-api"],
    };

    const theme = generateTheme(config);

    // Should have words from both presets
    expect(theme.schema.matchWords?.INFO).toBeDefined(); // from log-levels
    expect(theme.schema.matchWords?.GET).toBeDefined(); // from http-api

    // Should have patterns from both presets
    const timestampPattern = theme.schema.matchPatterns?.find(
      (p) => p.name === "timestamp-iso",
    );
    const urlPattern = theme.schema.matchPatterns?.find(
      (p) => p.name === "url-path",
    );
    expect(timestampPattern).toBeDefined();
    expect(urlPattern).toBeDefined();
  });

  test("generateTheme should apply correct colors from palette", () => {
    const config = {
      name: "test-theme",
      colorPalette: "dracula",
      patternPresets: ["log-levels"],
    };

    const theme = generateTheme(config);
    const draculaPalette = getColorPalette("dracula")!;

    expect(theme.schema.defaultStyle?.color).toBe(draculaPalette.colors.text);
    expect(theme.schema.matchWords?.ERROR?.color).toBe(
      draculaPalette.colors.error,
    );
    expect(theme.schema.matchWords?.INFO?.color).toBe(
      draculaPalette.colors.primary,
    );
  });
});

describe("Built-in Content Validation", () => {
  test("all color palettes should have required accessibility info", () => {
    COLOR_PALETTES.forEach((palette) => {
      expect(palette.accessibility.contrastRatio).toBeGreaterThan(0);
      expect(palette.accessibility.contrastRatio).toBeLessThanOrEqual(21);
      expect(typeof palette.accessibility.colorBlindSafe).toBe("boolean");
      expect(typeof palette.accessibility.darkMode).toBe("boolean");
    });
  });

  test("all pattern presets should have valid regex patterns", () => {
    PATTERN_PRESETS.forEach((preset) => {
      preset.patterns.forEach((pattern) => {
        expect(() => new RegExp(pattern.pattern)).not.toThrow();
      });
    });
  });

  test("all pattern presets should have valid categories", () => {
    const validCategories = [
      "api",
      "system",
      "application",
      "security",
      "database",
      "generic",
    ];
    PATTERN_PRESETS.forEach((preset) => {
      expect(validCategories).toContain(preset.category);
    });
  });

  test("all color roles in presets should be valid", () => {
    const validColorRoles = [
      "primary",
      "secondary",
      "success",
      "warning",
      "error",
      "info",
      "muted",
      "accent",
    ];

    PATTERN_PRESETS.forEach((preset) => {
      preset.patterns.forEach((pattern) => {
        expect(validColorRoles).toContain(pattern.colorRole);
      });
      Object.values(preset.matchWords).forEach((word) => {
        expect(validColorRoles).toContain(word.colorRole);
      });
    });
  });
});
