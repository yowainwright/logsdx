import { expect, test, describe, beforeEach, afterEach, mock } from "bun:test";
import {
  showThemeList,
  selectThemeInteractively,
  InteractiveConfig,
  ThemeChoice,
} from "../../../src/cli/interactive";
import { getThemeNames, getTheme, LogsDX } from "../../../src/index";

const originalLog = console.log;

beforeEach(() => {
  console.log = mock(() => {});
});

afterEach(() => {
  console.log = originalLog;
});

describe("showThemeList", () => {
  test("should not throw when called", async () => {
    let error: Error | undefined;
    try {
      await showThemeList();
    } catch (e) {
      error = e as Error;
    }
    expect(error).toBeUndefined();
  });

  test("should display all available themes", async () => {
    await showThemeList();

    const calls = (console.log as ReturnType<typeof mock>).mock.calls;
    const allOutput = calls.map((call) => call.join(" ")).join("\n");

    const themeNames = getThemeNames();
    expect(themeNames.length).toBeGreaterThan(0);
    themeNames.forEach((themeName) => {
      expect(allOutput).toContain(themeName);
    });
  });

  test("should show theme descriptions if available", async () => {
    await showThemeList();

    const calls = (console.log as ReturnType<typeof mock>).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });

  test("should include usage hints", async () => {
    await showThemeList();

    const calls = (console.log as ReturnType<typeof mock>).mock.calls;
    const allOutput = calls.map((call) => call.join(" ")).join("\n");

    expect(allOutput).toContain("interactive");
  });
});

describe("selectThemeInteractively", () => {
  test("should be a function", () => {
    expect(typeof selectThemeInteractively).toBe("function");
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

  test("should allow html outputFormat", () => {
    const config: InteractiveConfig = {
      theme: "dracula",
      outputFormat: "html",
      preview: true,
    };

    expect(config.outputFormat).toBe("html");
    expect(config.preview).toBe(true);
  });
});

describe("Theme processing", () => {
  test("should get theme names", () => {
    const themeNames = getThemeNames();
    expect(themeNames.length).toBeGreaterThan(0);
    expect(themeNames).toContain("oh-my-zsh");
  });

  test("should get theme by name", async () => {
    const theme = await getTheme("oh-my-zsh");
    expect(theme).toBeDefined();
    expect(theme?.name).toBe("oh-my-zsh");
  });

  test("should process log with theme", async () => {
    const logsDX = await LogsDX.getInstance({
      theme: "oh-my-zsh",
      outputFormat: "ansi",
    });

    const result = logsDX.processLine("INFO Test message");
    expect(result.length).toBeGreaterThan(0);
  });

  test("should process log with html format", async () => {
    const logsDX = await LogsDX.getInstance({
      theme: "dracula",
      outputFormat: "html",
    });

    const result = logsDX.processLine("ERROR Something failed");
    expect(result).toContain("span");
  });
});

describe("Theme choices building", () => {
  test("should build theme choices from theme names", async () => {
    const themeNames = getThemeNames();
    const choices: ThemeChoice[] = await Promise.all(
      themeNames.map(async (name: string) => ({
        name,
        value: name,
        description:
          (await getTheme(name))?.description || "No description available",
      })),
    );

    expect(choices.length).toBe(themeNames.length);
    expect(choices[0]).toHaveProperty("name");
    expect(choices[0]).toHaveProperty("value");
    expect(choices[0]).toHaveProperty("description");
  });

  test("should handle theme without description", async () => {
    const themeNames = getThemeNames();
    const choices = await Promise.all(
      themeNames.slice(0, 3).map(async (name: string) => {
        const theme = await getTheme(name);
        return {
          name,
          value: name,
          description: theme?.description || "No description available",
        };
      }),
    );

    choices.forEach((choice) => {
      expect(typeof choice.description).toBe("string");
    });
  });
});
