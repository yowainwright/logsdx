import { expect, test, describe } from "bun:test";
import { showThemeList, InteractiveConfig, ThemeChoice } from "../../../src/cli/interactive";

describe("showThemeList", () => {
  test("should not throw when called", () => {
    expect(() => showThemeList()).not.toThrow();
  });
});

describe("Type exports", () => {
  test("should export InteractiveConfig type", () => {
    const config: InteractiveConfig = {
      theme: "test",
      outputFormat: "ansi",
      preview: false,
    };

    expect(config.theme).toBe("test");
    expect(config.outputFormat).toBe("ansi");
    expect(config.preview).toBe(false);
  });

  test("should export ThemeChoice type", () => {
    const choice: ThemeChoice = {
      name: "Test Theme",
      value: "test",
      description: "A test theme",
    };

    expect(choice.name).toBe("Test Theme");
    expect(choice.value).toBe("test");
    expect(choice.description).toBe("A test theme");
  });
});
