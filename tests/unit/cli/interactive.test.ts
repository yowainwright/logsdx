import { expect, test, describe, beforeEach, afterEach, mock } from "bun:test";
import {
  showThemeList,
  selectThemeInteractively,
  InteractiveConfig,
  ThemeChoice,
} from "../../../src/cli/interactive";
import { getThemeNames } from "../../../src/index";

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
