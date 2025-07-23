import { expect, test, describe } from "bun:test";
import {
  interactiveConfigSchema,
  themeChoiceSchema,
  showThemeList,
} from "./interactive";

describe("Interactive schemas", () => {
  describe("interactiveConfigSchema", () => {
    test("should validate valid interactive config", () => {
      const validConfig = {
        theme: "oh-my-zsh",
        outputFormat: "ansi" as const,
        preview: true,
      };

      const result = interactiveConfigSchema.parse(validConfig);
      expect(result.theme).toBe("oh-my-zsh");
      expect(result.outputFormat).toBe("ansi");
      expect(result.preview).toBe(true);
    });

    test("should validate with html output format", () => {
      const validConfig = {
        theme: "dracula",
        outputFormat: "html" as const,
        preview: false,
      };

      const result = interactiveConfigSchema.parse(validConfig);
      expect(result.theme).toBe("dracula");
      expect(result.outputFormat).toBe("html");
      expect(result.preview).toBe(false);
    });

    test("should reject invalid output format", () => {
      const invalidConfig = {
        theme: "oh-my-zsh",
        outputFormat: "invalid",
        preview: true,
      };

      expect(() => interactiveConfigSchema.parse(invalidConfig)).toThrow();
    });

    test("should require all fields", () => {
      const incompleteConfig = {
        theme: "oh-my-zsh",
        outputFormat: "ansi" as const,
      };

      expect(() => interactiveConfigSchema.parse(incompleteConfig)).toThrow();
    });

    test("should reject non-boolean preview", () => {
      const invalidConfig = {
        theme: "oh-my-zsh",
        outputFormat: "ansi" as const,
        preview: "yes",
      };

      expect(() => interactiveConfigSchema.parse(invalidConfig)).toThrow();
    });
  });

  describe("themeChoiceSchema", () => {
    test("should validate valid theme choice", () => {
      const validChoice = {
        name: "Dracula Theme",
        value: "dracula",
        description: "A dark theme with purple accents",
      };

      const result = themeChoiceSchema.parse(validChoice);
      expect(result.name).toBe("Dracula Theme");
      expect(result.value).toBe("dracula");
      expect(result.description).toBe("A dark theme with purple accents");
    });

    test("should require all fields", () => {
      const incompleteChoice = {
        name: "Theme Name",
        value: "theme-value",
      };

      expect(() => themeChoiceSchema.parse(incompleteChoice)).toThrow();
    });

    test("should reject non-string fields", () => {
      const invalidChoice = {
        name: 123,
        value: "theme-value",
        description: "Description",
      };

      expect(() => themeChoiceSchema.parse(invalidChoice)).toThrow();
    });
  });
});

describe("showThemeList", () => {
  test("should not throw when called", () => {
    expect(() => showThemeList()).not.toThrow();
  });
});

describe("Type exports", () => {
  test("should export InteractiveConfig type", () => {
    const config: typeof import("./interactive").InteractiveConfig = {
      theme: "test",
      outputFormat: "ansi",
      preview: false,
    };

    expect(config.theme).toBe("test");
    expect(config.outputFormat).toBe("ansi");
    expect(config.preview).toBe(false);
  });

  test("should export ThemeChoice type", () => {
    const choice: typeof import("./interactive").ThemeChoice = {
      name: "Test Theme",
      value: "test",
      description: "A test theme",
    };

    expect(choice.name).toBe("Test Theme");
    expect(choice.value).toBe("test");
    expect(choice.description).toBe("A test theme");
  });
});
