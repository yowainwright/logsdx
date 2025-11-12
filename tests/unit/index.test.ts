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
    test("returns singleton instance", () => {
      const instance1 = LogsDX.getInstance();
      const instance2 = LogsDX.getInstance();
      expect(instance1).toBe(instance2);
    });

    test("applies default options when none provided", () => {
      const instance = LogsDX.getInstance();
      expect(instance.getCurrentTheme().name).toBe("none");
    });

    test("applies custom options when provided", () => {
      LogsDX.resetInstance();

      const customInstance = LogsDX.getInstance({ theme: "oh-my-zsh" });
      expect(customInstance.getCurrentTheme().name).toBe("oh-my-zsh");
    });
  });

  describe("getLogsDX", () => {
    test("returns the same instance as getInstance", () => {
      const instance1 = LogsDX.getInstance();
      const instance2 = getLogsDX();
      expect(instance1).toBe(instance2);
    });
  });

  describe("resetInstance", () => {
    test("resets the singleton instance", () => {
      const instance1 = LogsDX.getInstance();
      LogsDX.resetInstance();
      const instance2 = LogsDX.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe("processLine", () => {
    test("processes a simple line", () => {
      const instance = LogsDX.getInstance();
      const line = "test line";
      const result = instance.processLine(line);

      expect(typeof result).toBe("string");
    });

    test("processes a line with HTML output format", () => {
      const instance = LogsDX.getInstance();
      instance.setTheme("oh-my-zsh");
      instance.setOutputFormat("html");
      const result = instance.processLine("error: test");
      expect(result).toContain("<span");
      expect(result).toContain("error");
      expect(result).toContain(">test</span>");
      expect(result).toContain(">:</span>");
    });
  });

  describe("processLines", () => {
    test("processes multiple lines", () => {
      const instance = LogsDX.getInstance();
      const lines = ["line 1", "line 2"];
      const result = instance.processLines(lines);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });

  describe("processLog", () => {
    test("processes multi-line log content", () => {
      const instance = LogsDX.getInstance();
      const log = "line 1\nline 2";
      const result = instance.processLog(log);

      expect(typeof result).toBe("string");
    });
  });

  describe("tokenizeLine", () => {
    test("tokenizes a line without styling", () => {
      const instance = LogsDX.getInstance();
      const tokens = instance.tokenizeLine("test line");
      expect(tokens).toBeInstanceOf(Array);
      expect(tokens.length).toBeGreaterThan(0);

      const totalContent = tokens.map((t) => t.content).join("");
      expect(totalContent).toBe("test line");
    });
  });

  describe("setTheme", () => {
    test("sets theme by name", () => {
      const instance = LogsDX.getInstance();

      const result = instance.setTheme("oh-my-zsh");
      expect(result).toBe(true);
      expect(instance.getCurrentTheme().name).toBe("oh-my-zsh");
    });

    test("sets theme by configuration object", () => {
      const instance = LogsDX.getInstance();
      const customTheme = {
        name: "custom-theme",
        schema: {
          defaultStyle: { color: "white" },
        },
      };
      const result = instance.setTheme(customTheme);
      expect(result).toBe(true);
      expect(instance.getCurrentTheme().name).toBe("custom-theme");
    });

    test("returns true even for invalid theme (fails silently)", () => {
      const instance = LogsDX.getInstance({ debug: true });

      expect(instance.setTheme({ invalid: "theme" })).toBe(true);

      expect(instance.getCurrentTheme().name).toBe("none");
    });
  });

  describe("getCurrentTheme", () => {
    test("returns the current theme", () => {
      const instance = LogsDX.getInstance();
      const theme = instance.getCurrentTheme();
      expect(theme.name).toBe("none");
    });
  });

  describe("getAllThemes", () => {
    test("returns all available themes", () => {
      const instance = LogsDX.getInstance();
      const themes = instance.getAllThemes();
      expect(Object.keys(themes).length).toBeGreaterThan(0);
      expect(themes["oh-my-zsh"]).toBeDefined();
    });
  });

  describe("getThemeNames", () => {
    test("returns array of theme names", () => {
      const instance = LogsDX.getInstance();
      const themeNames = instance.getThemeNames();
      expect(themeNames.length).toBeGreaterThan(0);
      expect(themeNames).toContain("oh-my-zsh");
    });
  });

  describe("setOutputFormat", () => {
    test("updates output format", () => {
      const instance = LogsDX.getInstance();
      instance.setOutputFormat("html");

      instance.setTheme("oh-my-zsh");
      const result = instance.processLine("test");
      expect(result).toContain("<span");
    });
  });

  describe("setHtmlStyleFormat", () => {
    test("updates HTML style format", () => {
      const instance = LogsDX.getInstance({ outputFormat: "html" });

      instance.setTheme("oh-my-zsh");
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

  test("applies theme colors to ANSI output", () => {
    const instance = LogsDX.getInstance({
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
    const dracula = LogsDX.getInstance({
      theme: "dracula",
      outputFormat: "ansi",
    });
    const draculaError = dracula.processLine("ERROR: This is an error message");

    expect(stripAnsi(draculaError)).toBe("ERROR: This is an error message");
  });

  test("applies style codes like bold and italic", () => {
    const instance = LogsDX.getInstance({
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
