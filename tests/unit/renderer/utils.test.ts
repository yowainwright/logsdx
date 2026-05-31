import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import {
  escapeHtml,
  hexToRgb,
  stripAnsi,
  hasStyleCode,
  parseColorFgBg,
  isLightBgColor,
  repeatString,
  calculateCenterPadding,
  isBrowser,
  hasMatchMedia,
  detectTerminalBackground,
  detectBrowserBackground,
  detectSystemBackground,
  detectBackground,
  isDarkBackground,
  isLightBackground,
  getRecommendedThemeMode,
  watchBackgroundChanges,
  getThemeBackground,
  renderLightBoxLine,
  renderLightBox,
  isLightTheme,
  isTerminalDark,
} from "../../../src/renderer/utils";
import { Theme } from "../../../src/types";

describe("renderer/utils", () => {
  describe("escapeHtml()", () => {
    test("escapes ampersand", () => {
      expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
    });

    test("escapes less than", () => {
      expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
    });

    test("escapes greater than", () => {
      expect(escapeHtml("5 > 3")).toBe("5 &gt; 3");
    });

    test("escapes double quotes", () => {
      expect(escapeHtml('Say "Hello"')).toBe("Say &quot;Hello&quot;");
    });

    test("escapes single quotes", () => {
      expect(escapeHtml("It's working")).toBe("It&#039;s working");
    });

    test("escapes multiple special characters", () => {
      expect(escapeHtml('<a href="test">Tom & Jerry\'s</a>')).toBe(
        "&lt;a href=&quot;test&quot;&gt;Tom &amp; Jerry&#039;s&lt;/a&gt;",
      );
    });

    test("returns unchanged string with no special characters", () => {
      expect(escapeHtml("plain text")).toBe("plain text");
    });
  });

  describe("hexToRgb()", () => {
    test("converts hex color with hash", () => {
      expect(hexToRgb("#ff0000")).toEqual([255, 0, 0]);
    });

    test("converts hex color without hash", () => {
      expect(hexToRgb("00ff00")).toEqual([0, 255, 0]);
    });

    test("converts hex color case insensitive", () => {
      expect(hexToRgb("#AABBCC")).toEqual([170, 187, 204]);
      expect(hexToRgb("#aabbcc")).toEqual([170, 187, 204]);
    });

    test("returns black for invalid hex", () => {
      expect(hexToRgb("invalid")).toEqual([0, 0, 0]);
    });

    test("returns black for short hex", () => {
      expect(hexToRgb("#fff")).toEqual([0, 0, 0]);
    });

    test("returns black for empty string", () => {
      expect(hexToRgb("")).toEqual([0, 0, 0]);
    });

    test("converts white", () => {
      expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
    });

    test("converts black", () => {
      expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
    });
  });

  describe("stripAnsi()", () => {
    test("removes ANSI color codes", () => {
      expect(stripAnsi("\x1B[31mred text\x1B[0m")).toBe("red text");
    });

    test("returns unchanged text without ANSI codes", () => {
      expect(stripAnsi("plain text")).toBe("plain text");
    });

    test("removes multiple ANSI codes", () => {
      const input = "\x1b[1m\x1b[31mBold Red\x1b[0m\x1b[32m Green\x1b[0m";
      expect(stripAnsi(input)).toBe("Bold Red Green");
    });

    test("removes complex ANSI sequences", () => {
      const input = "\x1b[38;5;196mExtended Color\x1b[0m";
      expect(stripAnsi(input)).toBe("Extended Color");
    });

    test("removes RGB ANSI sequences", () => {
      const input = "\x1b[38;2;255;0;0mRGB Red\x1b[0m";
      expect(stripAnsi(input)).toBe("RGB Red");
    });

    test("handles empty string", () => {
      expect(stripAnsi("")).toBe("");
    });
  });

  describe("hasStyleCode()", () => {
    test("returns true when code is present", () => {
      expect(hasStyleCode(["bold", "italic"], "bold")).toBe(true);
    });

    test("returns false when code is not present", () => {
      expect(hasStyleCode(["bold", "italic"], "underline")).toBe(false);
    });

    test("returns false for undefined array", () => {
      expect(hasStyleCode(undefined, "bold")).toBe(false);
    });

    test("returns false for empty array", () => {
      expect(hasStyleCode([], "bold")).toBe(false);
    });
  });

  describe("parseColorFgBg()", () => {
    test("parses valid COLORFGBG with two parts", () => {
      expect(parseColorFgBg("0;7")).toBe(7);
    });

    test("parses valid COLORFGBG with three parts", () => {
      expect(parseColorFgBg("0;7;1")).toBe(7);
    });

    test("returns undefined for single part", () => {
      expect(parseColorFgBg("7")).toBeUndefined();
    });

    test("returns undefined for non-numeric background", () => {
      expect(parseColorFgBg("0;invalid")).toBeUndefined();
    });

    test("returns undefined for empty string", () => {
      expect(parseColorFgBg("")).toBeUndefined();
    });

    test("parses zero background color", () => {
      expect(parseColorFgBg("7;0")).toBe(0);
    });
  });

  describe("isLightBgColor()", () => {
    test("returns true for color 7", () => {
      expect(isLightBgColor(7)).toBe(true);
    });

    test("returns true for color 15", () => {
      expect(isLightBgColor(15)).toBe(true);
    });

    test("returns false for color 0", () => {
      expect(isLightBgColor(0)).toBe(false);
    });

    test("returns false for color 8", () => {
      expect(isLightBgColor(8)).toBe(false);
    });

    test("returns false for negative numbers", () => {
      expect(isLightBgColor(-1)).toBe(false);
    });
  });

  describe("repeatString()", () => {
    test("repeats string n times", () => {
      expect(repeatString("a", 5)).toBe("aaaaa");
    });

    test("returns empty string for count 0", () => {
      expect(repeatString("test", 0)).toBe("");
    });

    test("returns empty string for negative count", () => {
      expect(repeatString("test", -5)).toBe("");
    });

    test("works with multi-character strings", () => {
      expect(repeatString("ab", 3)).toBe("ababab");
    });
  });

  describe("calculateCenterPadding()", () => {
    test("calculates even padding", () => {
      expect(calculateCenterPadding(10, 4)).toEqual([3, 3]);
    });

    test("calculates odd padding", () => {
      expect(calculateCenterPadding(10, 5)).toEqual([2, 3]);
    });

    test("returns zero padding when text is wider", () => {
      expect(calculateCenterPadding(5, 10)).toEqual([0, 0]);
    });

    test("returns full padding for empty text", () => {
      expect(calculateCenterPadding(10, 0)).toEqual([5, 5]);
    });

    test("handles exact fit", () => {
      expect(calculateCenterPadding(10, 10)).toEqual([0, 0]);
    });
  });

  describe("isBrowser()", () => {
    test("returns false in Node environment", () => {
      expect(isBrowser()).toBe(false);
    });
  });

  describe("hasMatchMedia()", () => {
    test("returns false in Node environment", () => {
      expect(hasMatchMedia()).toBe(false);
    });
  });
});

describe("detectTerminalBackground", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("detects dark background from COLORFGBG", () => {
    process.env.COLORFGBG = "15;0";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("dark");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("terminal");
  });

  test("detects light background from COLORFGBG", () => {
    process.env.COLORFGBG = "0;7";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("light");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("terminal");
  });

  test("detects bright white background from COLORFGBG", () => {
    process.env.COLORFGBG = "0;15";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("light");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("terminal");
  });

  test("detects dark terminal from iTerm", () => {
    delete process.env.COLORFGBG;
    process.env.TERM_PROGRAM = "iTerm.app";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("dark");
    expect(result.confidence).toBe("medium");
    expect(result.source).toBe("terminal");
    expect(result.details?.termProgram).toBe("iTerm.app");
  });

  test("detects dark terminal from WarpTerminal", () => {
    delete process.env.COLORFGBG;
    process.env.TERM_PROGRAM = "WarpTerminal";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("dark");
    expect(result.confidence).toBe("medium");
    expect(result.source).toBe("terminal");
  });

  test("detects light terminal from Apple Terminal", () => {
    delete process.env.COLORFGBG;
    process.env.TERM_PROGRAM = "Apple_Terminal";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("light");
    expect(result.confidence).toBe("medium");
    expect(result.source).toBe("terminal");
  });

  test("detects VS Code terminal as auto", () => {
    delete process.env.COLORFGBG;
    delete process.env.TERM_PROGRAM;
    process.env.VSCODE_PID = "12345";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("low");
    expect(result.source).toBe("terminal");
    expect(result.details?.termProgram).toBe("vscode");
  });

  test("defaults to dark when no information available", () => {
    delete process.env.COLORFGBG;
    delete process.env.TERM_PROGRAM;
    delete process.env.VSCODE_PID;
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("dark");
    expect(result.confidence).toBe("low");
    expect(result.source).toBe("default");
  });

  test("handles invalid COLORFGBG gracefully", () => {
    process.env.COLORFGBG = "invalid";
    delete process.env.TERM_PROGRAM;
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("dark");
    expect(result.source).toBe("default");
  });

  test("handles partial COLORFGBG", () => {
    process.env.COLORFGBG = "15";
    const result = detectTerminalBackground();
    expect(result.confidence).not.toBe("high");
  });
});

describe("detectBrowserBackground", () => {
  test("returns auto when not in browser environment", () => {
    const result = detectBrowserBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("low");
    expect(result.source).toBe("default");
  });

  test("detects dark mode preference", () => {
    const originalWindow = global.window;
    global.window = {
      matchMedia: (query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    } as any;

    const result = detectBrowserBackground();
    expect(result.scheme).toBe("dark");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("browser");
    expect(result.details?.mediaQuery).toBe(true);
    expect(result.details?.systemPreference).toBe("dark");

    global.window = originalWindow;
  });

  test("detects light mode preference", () => {
    const originalWindow = global.window;
    global.window = {
      matchMedia: (query: string) => ({
        matches: query === "(prefers-color-scheme: light)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    } as any;

    const result = detectBrowserBackground();
    expect(result.scheme).toBe("light");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("browser");
    expect(result.details?.systemPreference).toBe("light");

    global.window = originalWindow;
  });

  test("returns auto when no preference detected", () => {
    const originalWindow = global.window;
    global.window = {
      matchMedia: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    } as any;

    const result = detectBrowserBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("medium");
    expect(result.source).toBe("browser");
    expect(result.details?.mediaQuery).toBe(false);

    global.window = originalWindow;
  });
});

describe("detectSystemBackground", () => {
  const originalEnv = process.env;
  const originalPlatform = process.platform;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    Object.defineProperty(process, "platform", { value: originalPlatform });
  });

  test("detects macOS dark mode", () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    process.env.APPLE_INTERFACE_STYLE = "Dark";
    const result = detectSystemBackground();
    expect(result.scheme).toBe("dark");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("system");
    expect(result.details?.systemPreference).toBe("Dark");
  });

  test("detects macOS light mode", () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    process.env.APPLE_INTERFACE_STYLE = "Light";
    const result = detectSystemBackground();
    expect(result.scheme).toBe("light");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("system");
  });

  test("returns auto for Windows", () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    const result = detectSystemBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("low");
    expect(result.source).toBe("system");
  });

  test("detects Linux desktop environment", () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    process.env.DESKTOP_SESSION = "gnome";
    const result = detectSystemBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("medium");
    expect(result.source).toBe("system");
    expect(result.details?.systemPreference).toBe("gnome");
  });

  test("detects XDG desktop environment", () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    process.env.XDG_CURRENT_DESKTOP = "KDE";
    const result = detectSystemBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("medium");
    expect(result.source).toBe("system");
    expect(result.details?.systemPreference).toBe("KDE");
  });

  test("returns auto when no system info available", () => {
    Object.defineProperty(process, "platform", { value: "freebsd" });
    delete process.env.APPLE_INTERFACE_STYLE;
    delete process.env.DESKTOP_SESSION;
    delete process.env.XDG_CURRENT_DESKTOP;
    const result = detectSystemBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("low");
    expect(result.source).toBe("default");
  });
});

describe("detectBackground", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("prioritizes high confidence terminal detection", () => {
    process.env.COLORFGBG = "15;0";
    const result = detectBackground();
    expect(result.scheme).toBe("dark");
    expect(result.source).toBe("terminal");
    expect(result.confidence).toBe("high");
  });

  test("uses medium confidence terminal over low confidence system", () => {
    delete process.env.COLORFGBG;
    process.env.TERM_PROGRAM = "iTerm.app";
    const result = detectBackground();
    expect(result.scheme).toBe("dark");
    expect(result.source).toBe("terminal");
    expect(result.confidence).toBe("medium");
  });

  test("falls back to default when all confidence is low", () => {
    delete process.env.COLORFGBG;
    delete process.env.TERM_PROGRAM;
    delete process.env.APPLE_INTERFACE_STYLE;
    const result = detectBackground();
    expect(result.confidence).toBe("low");
  });
});

describe("background helper functions", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("isDarkBackground returns true for dark schemes", () => {
    process.env.COLORFGBG = "15;0";
    expect(isDarkBackground()).toBe(true);
  });

  test("isDarkBackground returns true for auto with default source", () => {
    delete process.env.COLORFGBG;
    delete process.env.TERM_PROGRAM;
    expect(isDarkBackground()).toBe(true);
  });

  test("isLightBackground returns true for light schemes", () => {
    process.env.COLORFGBG = "0;7";
    expect(isLightBackground()).toBe(true);
  });

  test("isLightBackground returns false for dark schemes", () => {
    process.env.COLORFGBG = "15;0";
    expect(isLightBackground()).toBe(false);
  });

  test("getRecommendedThemeMode returns dark for dark background", () => {
    process.env.COLORFGBG = "15;0";
    expect(getRecommendedThemeMode()).toBe("dark");
  });

  test("getRecommendedThemeMode returns light for light background", () => {
    process.env.COLORFGBG = "0;7";
    expect(getRecommendedThemeMode()).toBe("light");
  });
});

describe("watchBackgroundChanges", () => {
  test("returns no-op function when not in browser", () => {
    const callback = () => {};
    const unsubscribe = watchBackgroundChanges(callback);
    expect(typeof unsubscribe).toBe("function");
    unsubscribe();
  });

  test("subscribes to media query changes in browser", () => {
    const originalWindow = global.window;
    const listeners: Array<() => void> = [];

    global.window = {
      matchMedia: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: (event: string, handler: () => void) => {
          if (event === "change") listeners.push(handler);
        },
        removeEventListener: (event: string, handler: () => void) => {
          const index = listeners.indexOf(handler);
          if (index > -1) listeners.splice(index, 1);
        },
        dispatchEvent: () => true,
      }),
    } as any;

    let callbackCalled = false;
    const callback = () => {
      callbackCalled = true;
    };

    const unsubscribe = watchBackgroundChanges(callback);
    expect(typeof unsubscribe).toBe("function");
    expect(listeners.length).toBeGreaterThan(0);

    listeners[0]();
    expect(callbackCalled).toBe(true);

    unsubscribe();
    expect(listeners.length).toBe(0);

    global.window = originalWindow;
  });

  test("uses legacy addListener API if addEventListener not available", () => {
    const originalWindow = global.window;
    const listeners: Array<() => void> = [];

    global.window = {
      matchMedia: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: (handler: () => void) => {
          listeners.push(handler);
        },
        removeListener: (handler: () => void) => {
          const index = listeners.indexOf(handler);
          if (index > -1) listeners.splice(index, 1);
        },
        dispatchEvent: () => true,
      }),
    } as any;

    const callback = () => {};
    const unsubscribe = watchBackgroundChanges(callback);

    expect(typeof unsubscribe).toBe("function");
    expect(listeners.length).toBeGreaterThan(0);

    unsubscribe();
    expect(listeners.length).toBe(0);

    global.window = originalWindow;
  });
});

describe("getThemeBackground", () => {
  test("returns specific background for known themes", () => {
    const bg = getThemeBackground("github-light");
    expect(bg).toBe("\x1b[48;2;255;255;255m");
  });

  test("returns solarized light background", () => {
    const bg = getThemeBackground("solarized-light");
    expect(bg).toBe("\x1b[48;2;253;246;227m");
  });

  test("returns one-light background", () => {
    const bg = getThemeBackground("one-light");
    expect(bg).toBe("\x1b[48;2;250;250;250m");
  });

  test("returns default background for unknown themes", () => {
    const bg = getThemeBackground("unknown-theme");
    expect(bg).toBe("\x1b[48;5;255m");
  });

  test("works with theme object", () => {
    const theme: Theme = {
      name: "github-light",
      schema: {},
    };
    const bg = getThemeBackground(theme);
    expect(bg).toBe("\x1b[48;2;255;255;255m");
  });

  test("returns default for theme object with unknown name", () => {
    const theme: Theme = {
      name: "custom-theme",
      schema: {},
    };
    const bg = getThemeBackground(theme);
    expect(bg).toBe("\x1b[48;5;255m");
  });
});

describe("renderLightBoxLine", () => {
  test("renders line with default options", () => {
    const line = "Test line";
    const result = renderLightBoxLine(line, "github-light");

    expect(result).toContain("\u2502");
    expect(result).toContain("\x1b[48;2;255;255;255m");
    expect(result).toContain("Test line");
    expect(result).toContain("\x1b[0m");
  });

  test("renders line without border", () => {
    const line = "Test line";
    const result = renderLightBoxLine(line, "github-light", { border: false });

    expect(result).not.toContain("\u2502");
    expect(result).toContain("\x1b[48;2;255;255;255m");
    expect(result).toContain("Test line");
  });

  test("respects custom padding", () => {
    const line = "Test";
    const result = renderLightBoxLine(line, "github-light", {
      padding: 5,
      border: false,
    });

    expect(result).toContain("     Test");
    expect(result).toContain("     ");
  });

  test("respects custom width", () => {
    const line = "Short";
    const result = renderLightBoxLine(line, "github-light", {
      width: 20,
      padding: 1,
      border: true,
    });

    const stripped = stripAnsi(result);
    expect(stripped.length).toBe(20);
  });

  test("uses custom background color", () => {
    const line = "Test";
    const customBg = "\x1b[48;5;123m";
    const result = renderLightBoxLine(line, "github-light", {
      backgroundColor: customBg,
    });

    expect(result).toContain(customBg);
  });

  test("handles lines with ANSI codes", () => {
    const line = "\x1b[31mRed\x1b[0m Text";
    const result = renderLightBoxLine(line, "github-light");

    expect(result).toContain("Red");
    expect(result).toContain("Text");
  });

  test("pads correctly with different border styles", () => {
    const line = "Test";
    const result = renderLightBoxLine(line, "github-light", {
      borderStyle: "double",
      width: 30,
    });

    expect(result).toContain("\u2551");
  });
});

describe("renderLightBox", () => {
  test("renders box with default options", () => {
    const lines = ["Line 1", "Line 2", "Line 3"];
    const result = renderLightBox(lines, "github-light");

    expect(result).toHaveLength(5);
    expect(result[0]).toContain("\u256d");
    expect(result[0]).toContain("\u256e");
    expect(result[1]).toContain("Line 1");
    expect(result[2]).toContain("Line 2");
    expect(result[3]).toContain("Line 3");
    expect(result[4]).toContain("\u2570");
    expect(result[4]).toContain("\u256f");
  });

  test("renders box with title", () => {
    const lines = ["Content"];
    const result = renderLightBox(lines, "github-light", "Test Title");

    expect(result[0]).toContain("Test Title");
  });

  test("renders box without border", () => {
    const lines = ["Line 1", "Line 2"];
    const result = renderLightBox(lines, "github-light", undefined, {
      border: false,
    });

    expect(result).toHaveLength(2);
    expect(result[0]).not.toContain("\u256d");
    expect(result[1]).not.toContain("\u2570");
  });

  test("uses square border style", () => {
    const lines = ["Content"];
    const result = renderLightBox(lines, "github-light", undefined, {
      borderStyle: "square",
    });

    expect(result[0]).toContain("\u250c");
    expect(result[0]).toContain("\u2510");
    expect(result[2]).toContain("\u2514");
    expect(result[2]).toContain("\u2518");
  });

  test("uses double border style", () => {
    const lines = ["Content"];
    const result = renderLightBox(lines, "github-light", undefined, {
      borderStyle: "double",
    });

    expect(result[0]).toContain("\u2554");
    expect(result[0]).toContain("\u2557");
    expect(result[2]).toContain("\u255a");
    expect(result[2]).toContain("\u255d");
  });

  test("uses simple border style", () => {
    const lines = ["Content"];
    const result = renderLightBox(lines, "github-light", undefined, {
      borderStyle: "simple",
    });

    expect(result[0]).toContain("+");
    expect(result[0]).toContain("-");
    expect(result[2]).toContain("+");
  });

  test("centers title in border", () => {
    const lines = ["Content"];
    const result = renderLightBox(lines, "github-light", "Title", {
      width: 40,
    });

    const topBorder = stripAnsi(result[0]);
    const titleIndex = topBorder.indexOf("Title");
    const leftPadding = titleIndex - 1;
    const rightPadding = topBorder.length - titleIndex - "Title".length - 1;

    expect(Math.abs(leftPadding - rightPadding)).toBeLessThanOrEqual(1);
  });

  test("handles empty lines array", () => {
    const result = renderLightBox([], "github-light");

    expect(result).toHaveLength(2);
    expect(result[0]).toContain("\u256d");
    expect(result[1]).toContain("\u2570");
  });

  test("preserves ANSI codes in content", () => {
    const lines = ["\x1b[31mRed\x1b[0m Text"];
    const result = renderLightBox(lines, "github-light");

    expect(result[1]).toContain("\x1b[31m");
    expect(result[1]).toContain("Red");
  });
});

describe("isLightTheme", () => {
  test("detects light theme by mode property", () => {
    const theme: Theme = {
      name: "custom",
      mode: "light",
      schema: {},
    };
    expect(isLightTheme(theme)).toBe(true);
  });

  test("detects dark theme by mode property", () => {
    const theme: Theme = {
      name: "custom",
      mode: "dark",
      schema: {},
    };
    expect(isLightTheme(theme)).toBe(false);
  });

  test("detects light theme by name containing 'light'", () => {
    const theme: Theme = {
      name: "github-light",
      schema: {},
    };
    expect(isLightTheme(theme)).toBe(true);
  });

  test("detects light theme by name containing 'white'", () => {
    const theme: Theme = {
      name: "snow-white",
      schema: {},
    };
    expect(isLightTheme(theme)).toBe(true);
  });

  test("returns false for dark theme names", () => {
    const theme: Theme = {
      name: "dracula",
      schema: {},
    };
    expect(isLightTheme(theme)).toBe(false);
  });

  test("works with string theme names", () => {
    expect(isLightTheme("github-light")).toBe(true);
    expect(isLightTheme("solarized-light")).toBe(true);
    expect(isLightTheme("dracula")).toBe(false);
  });

  test("case insensitive name detection", () => {
    expect(isLightTheme("GitHub-Light")).toBe(true);
    expect(isLightTheme("LIGHT-THEME")).toBe(true);
  });
});

describe("isTerminalDark", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("delegates to isDarkBackground", () => {
    process.env.COLORFGBG = "15;0";
    expect(isTerminalDark()).toBe(true);
  });

  test("returns false for light background", () => {
    process.env.COLORFGBG = "0;7";
    expect(isTerminalDark()).toBe(false);
  });

  test("uses terminal program detection", () => {
    delete process.env.COLORFGBG;
    process.env.TERM_PROGRAM = "iTerm.app";
    expect(isTerminalDark()).toBe(true);
  });

  test("defaults to dark when uncertain", () => {
    delete process.env.COLORFGBG;
    delete process.env.TERM_PROGRAM;
    expect(isTerminalDark()).toBe(true);
  });
});
