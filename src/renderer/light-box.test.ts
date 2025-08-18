import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import {
  getThemeBackground,
  stripAnsi,
  renderLightBoxLine,
  renderLightBox,
  isLightTheme,
  isTerminalDark,
} from "./light-box";
import { Theme } from "../types";

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

describe("stripAnsi", () => {
  test("removes ANSI color codes", () => {
    const input = "\x1b[31mRed Text\x1b[0m";
    expect(stripAnsi(input)).toBe("Red Text");
  });

  test("removes multiple ANSI codes", () => {
    const input = "\x1b[1m\x1b[31mBold Red\x1b[0m\x1b[32m Green\x1b[0m";
    expect(stripAnsi(input)).toBe("Bold Red Green");
  });

  test("handles text without ANSI codes", () => {
    const input = "Plain text";
    expect(stripAnsi(input)).toBe("Plain text");
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

describe("renderLightBoxLine", () => {
  test("renders line with default options", () => {
    const line = "Test line";
    const result = renderLightBoxLine(line, "github-light");

    expect(result).toContain("│");
    expect(result).toContain("\x1b[48;2;255;255;255m");
    expect(result).toContain("Test line");
    expect(result).toContain("\x1b[0m");
  });

  test("renders line without border", () => {
    const line = "Test line";
    const result = renderLightBoxLine(line, "github-light", { border: false });

    expect(result).not.toContain("│");
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

    expect(result).toContain("║");
  });
});

describe("renderLightBox", () => {
  test("renders box with default options", () => {
    const lines = ["Line 1", "Line 2", "Line 3"];
    const result = renderLightBox(lines, "github-light");

    expect(result).toHaveLength(5);
    expect(result[0]).toContain("╭");
    expect(result[0]).toContain("╮");
    expect(result[1]).toContain("Line 1");
    expect(result[2]).toContain("Line 2");
    expect(result[3]).toContain("Line 3");
    expect(result[4]).toContain("╰");
    expect(result[4]).toContain("╯");
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
    expect(result[0]).not.toContain("╭");
    expect(result[1]).not.toContain("╰");
  });

  test("uses square border style", () => {
    const lines = ["Content"];
    const result = renderLightBox(lines, "github-light", undefined, {
      borderStyle: "square",
    });

    expect(result[0]).toContain("┌");
    expect(result[0]).toContain("┐");
    expect(result[2]).toContain("└");
    expect(result[2]).toContain("┘");
  });

  test("uses double border style", () => {
    const lines = ["Content"];
    const result = renderLightBox(lines, "github-light", undefined, {
      borderStyle: "double",
    });

    expect(result[0]).toContain("╔");
    expect(result[0]).toContain("╗");
    expect(result[2]).toContain("╚");
    expect(result[2]).toContain("╝");
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
    expect(result[0]).toContain("╭");
    expect(result[1]).toContain("╰");
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
