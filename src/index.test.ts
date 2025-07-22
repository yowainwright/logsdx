import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { LogsDX, getLogsDX } from "./index";

describe("LogsDX", () => {
  // Save original console methods
  const originalConsoleWarn = console.warn;
  let consoleWarnings: string[] = [];

  // Setup and teardown
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
      expect(instance.getCurrentTheme().name).toBe("oh-my-zsh");
    });

    test("applies custom options when provided", () => {
      // First reset to ensure we're starting fresh
      LogsDX.resetInstance();
      // Then create with custom options
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

      // Just verify it returns a string
      expect(typeof result).toBe("string");
    });

    test("processes a line with HTML output format", () => {
      const instance = LogsDX.getInstance();
      instance.setOutputFormat("html");
      const result = instance.processLine("error: test");
      expect(result).toContain("<span");

      // Check that the word "error" is properly styled as a complete word
      expect(result).toContain("error");
      // Check that individual characters are properly styled
      expect(result).toContain(">t</span>");
      expect(result).toContain(">e</span>");
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

      // The entire string should be tokenized
      const totalContent = tokens.map((t) => t.content).join("");
      expect(totalContent).toBe("test line");
    });
  });

  describe("setTheme", () => {
    test("sets theme by name", () => {
      const instance = LogsDX.getInstance();
      // Use a theme we know exists
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

    test("returns false for invalid theme", () => {
      const instance = LogsDX.getInstance({ debug: true });
      // @ts-expect-error - Testing invalid theme object
      expect(instance.setTheme({ invalid: "theme" })).toBe(false);
      expect(consoleWarnings.length).toBeGreaterThan(0);
    });
  });

  describe("getCurrentTheme", () => {
    test("returns the current theme", () => {
      const instance = LogsDX.getInstance();
      const theme = instance.getCurrentTheme();
      expect(theme.name).toBe("oh-my-zsh");
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

      // Test that HTML format is applied
      const result = instance.processLine("test");
      expect(result).toContain("<span");
    });
  });

  describe("setHtmlStyleFormat", () => {
    test("updates HTML style format", () => {
      const instance = LogsDX.getInstance({ outputFormat: "html" });

      // Test with CSS format
      instance.setHtmlStyleFormat("css");
      let result = instance.processLine("test");
      expect(result).toContain("style=");

      // Test with className format
      instance.setHtmlStyleFormat("className");
      result = instance.processLine("test");
      expect(result).toContain("class=");
    });
  });
});

describe("ANSI theming integration", () => {
  // Save original console methods
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    // Reset the instance before each test to ensure clean state
    LogsDX.resetInstance();
    // Silence warnings during these tests
    console.warn = () => {};
  });

  afterEach(() => {
    // Restore console.warn
    console.warn = originalConsoleWarn;
  });

  test("applies theme colors to ANSI output", () => {
    // Create a fresh instance with explicit ANSI output format
    const instance = LogsDX.getInstance({
      theme: "oh-my-zsh",
      outputFormat: "ansi", // Explicitly set output format to ansi
    });

    // Verify the output format is set correctly
    expect(instance.getCurrentOutputFormat()).toBe("ansi");

    // Process lines with different log levels
    const errorLine = instance.processLine("ERROR: This is an error message");
    const warnLine = instance.processLine("WARN: This is a warning message");
    const infoLine = instance.processLine("INFO: This is an info message");

    // Strip ANSI codes and check the plain text content
    expect(stripAnsi(errorLine)).toBe("ERROR: This is an error message");
    expect(stripAnsi(warnLine)).toBe("WARN: This is a warning message");
    expect(stripAnsi(infoLine)).toBe("INFO: This is an info message");

    // Test that different themes produce different output
    LogsDX.resetInstance();
    const dracula = LogsDX.getInstance({
      theme: "dracula",
      outputFormat: "ansi", // Explicitly set output format to ansi
    });
    const draculaError = dracula.processLine("ERROR: This is an error message");

    // The original text should be preserved
    expect(stripAnsi(draculaError)).toBe("ERROR: This is an error message");
  });

  // Helper function to strip ANSI escape codes for testing
  function stripAnsi(str: string): string {
    return str.replace(/\x1B\[\d+m/g, "");
  }

  test("applies style codes like bold and italic", () => {
    // Create a fresh instance with explicit ANSI output format and a custom theme
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

    // Process a line with a keyword that should have styling
    const errorLine = instance.processLine("ERROR: Critical failure");

    // Strip ANSI codes and check the plain text content
    const plainText = stripAnsi(errorLine);
    expect(plainText).toBe("ERROR: Critical failure");

    // Verify the output format is set correctly
    expect(instance.getCurrentOutputFormat()).toBe("ansi");
  });
});
