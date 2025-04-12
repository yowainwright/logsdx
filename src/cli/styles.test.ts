import { expect, test, describe } from "bun:test";
import { styleLine, style, applyStyles, ANSI, LEVEL_STYLES } from "./styles";

describe("styleLine", () => {
  test("should style error level correctly", () => {
    const result = styleLine("Error message", "error");
    expect(result).toBe(
      `${ANSI.bold}${ANSI.brightRed}Error message${ANSI.reset}`,
    );
  });

  test("should style warn level correctly", () => {
    const result = styleLine("Warning message", "warn");
    expect(result).toBe(`${ANSI.yellow}Warning message${ANSI.reset}`);
  });

  test("should style info level correctly", () => {
    const result = styleLine("Info message", "info");
    expect(result).toBe(`${ANSI.blue}Info message${ANSI.reset}`);
  });

  test("should style debug level correctly", () => {
    const result = styleLine("Debug message", "debug");
    expect(result).toBe(`${ANSI.dim}${ANSI.gray}Debug message${ANSI.reset}`);
  });

  test("should return unstyled text for unknown level", () => {
    const result = styleLine("Plain message", "unknown");
    expect(result).toBe("Plain message");
  });

  test("should return unstyled text for undefined level", () => {
    const result = styleLine("Plain message");
    expect(result).toBe("Plain message");
  });
});

describe("style", () => {
  test("should apply single style correctly", () => {
    const result = style("Bold text", "bold");
    expect(result).toBe(`${ANSI.bold}Bold text${ANSI.reset}`);
  });

  test("should apply multiple styles correctly", () => {
    const result = style("Important error", ["bold", "brightRed"]);
    expect(result).toBe(
      `${ANSI.bold}${ANSI.brightRed}Important error${ANSI.reset}`,
    );
  });

  test("should handle background colors", () => {
    const result = style("Highlighted", ["bgYellow", "black"]);
    expect(result).toBe(
      `${ANSI.bgYellow}${ANSI.black}Highlighted${ANSI.reset}`,
    );
  });
});

describe("applyStyles", () => {
  test("should apply multiple ANSI codes", () => {
    const result = applyStyles("Test", [ANSI.bold, ANSI.blue]);
    expect(result).toBe(`${ANSI.bold}${ANSI.blue}Test${ANSI.reset}`);
  });

  test("should return original string when no styles provided", () => {
    const result = applyStyles("Test", []);
    expect(result).toBe("Test");
  });
});

describe("LEVEL_STYLES", () => {
  test("should have correct styles for each level", () => {
    expect(LEVEL_STYLES.error).toEqual([ANSI.bold, ANSI.brightRed]);
    expect(LEVEL_STYLES.warn).toEqual([ANSI.yellow]);
    expect(LEVEL_STYLES.info).toEqual([ANSI.blue]);
    expect(LEVEL_STYLES.debug).toEqual([ANSI.dim, ANSI.gray]);
    expect(LEVEL_STYLES.success).toEqual([ANSI.green]);
    expect(LEVEL_STYLES.trace).toEqual([ANSI.dim, ANSI.white]);
  });
});
