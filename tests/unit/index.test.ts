import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import stripAnsi from "strip-ansi";
import { LogsDX, getLogsDX } from "../../src/index";

describe("LogsDX", () => {
  const originalConsoleWarn = console.warn;
  let consoleWarnings: string[] = [];

  beforeEach(() => {
    LogsDX.resetInstance();
    consoleWarnings = [];
    console.warn = (message: string) => {
      consoleWarnings.push(message);
    };
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
  });

  describe("getInstance", () => {
    test("returns singleton instance", async () => {
      const instance1 = await LogsDX.getInstance();
      const instance2 = await LogsDX.getInstance();
      expect(instance1).toBe(instance2);
    });

    test("applies default options when none provided", async () => {
      const instance = await LogsDX.getInstance();
      expect(instance.getCurrentTheme().name).toBeDefined();
    });

    test("applies custom options when provided", async () => {
      LogsDX.resetInstance();

      const customInstance = await LogsDX.getInstance({ theme: "oh-my-zsh" });
      expect(customInstance.getCurrentTheme().name).toBe("oh-my-zsh");
    });
  });

  describe("getLogsDX", () => {
    test("returns the same instance as getInstance", async () => {
      const instance1 = await LogsDX.getInstance();
      const instance2 = await getLogsDX();
      expect(instance1).toBe(instance2);
    });
  });

  describe("resetInstance", () => {
    test("resets the singleton instance", async () => {
      const instance1 = await LogsDX.getInstance();
      LogsDX.resetInstance();
      const instance2 = await LogsDX.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe("processLine", () => {
    test("processes a simple line", async () => {
      const instance = await LogsDX.getInstance();
      const line = "test line";
      const result = instance.processLine(line);

      expect(typeof result).toBe("string");
    });

    test("processes a line with HTML output format", async () => {
      const instance = await LogsDX.getInstance();
      await instance.setTheme("oh-my-zsh");
      instance.setOutputFormat("html");
      const result = instance.processLine("error: test");
      expect(result).toContain("<span");
      expect(result).toContain("error");
      expect(result).toContain(">test</span>");
      expect(result).toContain(">:</span>");
    });
  });

  describe("processLines", () => {
    test("processes multiple lines", async () => {
      const instance = await LogsDX.getInstance();
      const lines = ["line 1", "line 2"];
      const result = instance.processLines(lines);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });

  describe("processLog", () => {
    test("processes multi-line log content", async () => {
      const instance = await LogsDX.getInstance();
      const log = "line 1\nline 2";
      const result = instance.processLog(log);

      expect(typeof result).toBe("string");
    });
  });

  describe("tokenizeLine", () => {
    test("tokenizes a line without styling", async () => {
      const instance = await LogsDX.getInstance();
      const tokens = instance.tokenizeLine("test line");
      expect(tokens).toBeInstanceOf(Array);
      expect(tokens.length).toBeGreaterThan(0);

      const totalContent = tokens.map((t) => t.content).join("");
      expect(totalContent).toBe("test line");
    });
  });

  describe("setTheme", () => {
    test("sets theme by name", async () => {
      const instance = await LogsDX.getInstance();

      const result = await instance.setTheme("oh-my-zsh");
      expect(result).toBe(true);
      expect(instance.getCurrentTheme().name).toBe("oh-my-zsh");
    });

    test("sets theme by configuration object", async () => {
      const instance = await LogsDX.getInstance();
      const customTheme = {
        name: "custom-theme",
        schema: {
          defaultStyle: { color: "white" },
        },
      };
      const result = await instance.setTheme(customTheme);
      expect(result).toBe(true);
      expect(instance.getCurrentTheme().name).toBe("custom-theme");
    });

    test("returns true even for invalid theme (fails silently)", async () => {
      const instance = await LogsDX.getInstance({ debug: true });

      expect(await instance.setTheme({ invalid: "theme" } as any)).toBe(true);

      expect(instance.getCurrentTheme().name).toBe("none");
    });
  });

  describe("getCurrentTheme", () => {
    test("returns the current theme", async () => {
      const instance = await LogsDX.getInstance();
      const theme = instance.getCurrentTheme();
      expect(theme.name).toBeDefined();
    });
  });

  describe("getAllThemes", () => {
    test("returns all available themes", async () => {
      const instance = await LogsDX.getInstance();
      const themes = instance.getAllThemes();
      expect(Object.keys(themes).length).toBeGreaterThan(0);
    });
  });

  describe("getThemeNames", () => {
    test("returns array of theme names", async () => {
      const instance = await LogsDX.getInstance();
      const themeNames = instance.getThemeNames();
      expect(themeNames.length).toBeGreaterThan(0);
      expect(themeNames).toContain("oh-my-zsh");
    });
  });

  describe("setOutputFormat", () => {
    test("updates output format", async () => {
      const instance = await LogsDX.getInstance();
      instance.setOutputFormat("html");

      await instance.setTheme("oh-my-zsh");
      const result = instance.processLine("test");
      expect(result).toContain("<span");
    });
  });

  describe("setHtmlStyleFormat", () => {
    test("updates HTML style format", async () => {
      const instance = await LogsDX.getInstance({ outputFormat: "html" });

      await instance.setTheme("oh-my-zsh");
      instance.setHtmlStyleFormat("css");
      let result = instance.processLine("test");
      expect(result).toContain("style=");

      instance.setHtmlStyleFormat("className");
      result = instance.processLine("test");
      expect(result).toContain("class=");
    });
  });
});

describe("ANSI theming integration", () => {
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    LogsDX.resetInstance();

    console.warn = () => {};
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
  });

  test("applies theme colors to ANSI output", async () => {
    const instance = await LogsDX.getInstance({
      theme: "oh-my-zsh",
      outputFormat: "ansi",
    });

    expect(instance.getCurrentOutputFormat()).toBe("ansi");

    const errorLine = instance.processLine("ERROR: This is an error message");
    const warnLine = instance.processLine("WARN: This is a warning message");
    const infoLine = instance.processLine("INFO: This is an info message");

    expect(stripAnsi(errorLine)).toBe("ERROR: This is an error message");
    expect(stripAnsi(warnLine)).toBe("WARN: This is a warning message");
    expect(stripAnsi(infoLine)).toBe("INFO: This is an info message");

    LogsDX.resetInstance();
    const dracula = await LogsDX.getInstance({
      theme: "dracula",
      outputFormat: "ansi",
    });
    const draculaError = dracula.processLine("ERROR: This is an error message");

    expect(stripAnsi(draculaError)).toBe("ERROR: This is an error message");
  });

  test("applies style codes like bold and italic", async () => {
    const instance = await LogsDX.getInstance({
      theme: {
        name: "test-theme",
        schema: {
          matchWords: {
            ERROR: { color: "red", styleCodes: ["bold"] },
          },
          defaultStyle: { color: "white" },
        },
      },
      outputFormat: "ansi",
    });

    const errorLine = instance.processLine("ERROR: Critical failure");

    const plainText = stripAnsi(errorLine);
    expect(plainText).toBe("ERROR: Critical failure");

    expect(instance.getCurrentOutputFormat()).toBe("ansi");
  });
});
