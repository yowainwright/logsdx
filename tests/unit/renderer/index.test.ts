import { expect, test, describe } from "bun:test";
import {
  renderLine,
  renderAnsi,
  renderHtml,
  styleLine,
  tokensToString,
  tokensToHtml,
  tokensToClassNames,
  applyColor,
  applyBold,
  applyItalic,
  applyUnderline,
  applyDim,
  applyBlink,
  applyReverse,
  applyStrikethrough,
  applyBackgroundColor,
  resolveColorDepth,
} from "../../../src/renderer/index";
import { TokenList } from "../../../src/schema/types";
import type { Theme } from "../../../src/types";

describe("Renderer", () => {
  describe("renderLine", () => {
    test("renders a simple line with default options", () => {
      const result = renderLine("test line");

      expect(result).toContain("t");
      expect(result).toContain("e");
      expect(result).toContain("s");
      expect(result).toContain("t");
    });

    test("renders a line with HTML CSS format", () => {
      const result = renderLine("test line", undefined, {
        outputFormat: "html",
        htmlStyleFormat: "css",
      });

      expect(result).toContain("<span");
      expect(result).toContain("style=");
      expect(result).toContain("t</span>");
    });

    test("renders a line with HTML className format", () => {
      const result = renderLine("test line", undefined, {
        outputFormat: "html",
        htmlStyleFormat: "className",
      });

      expect(result).toContain("<span");
      expect(result).toContain("class=");
      expect(result).toContain("t</span>");
    });

    test("uses the same styled tokens for ANSI and HTML output", () => {
      const theme: Theme = {
        name: "parity",
        schema: {
          defaultStyle: { color: "#e5e7eb" },
          matchWords: {
            NOTICE: { color: "#f87171", styleCodes: ["bold"] },
          },
        },
      };
      const line = "NOTICE: database failed";
      const tokens = styleLine(line, theme);
      const ansi = renderAnsi(line, { theme, forceColors: true });
      const html = renderHtml(line, { theme });

      expect(tokens.map((token) => token.content).join("")).toBe(line);
      expect(ansi).toContain("\x1b[38;2;248;113;113m");
      expect(html).toContain("color: #f87171");
      expect(html).toContain("font-weight: bold");
      expect(renderLine(line, theme, { forceColors: true })).toBe(ansi);
      expect(renderLine(line, theme, { outputFormat: "html" })).toBe(html);
    });

    test("supports explicit ANSI color depths", () => {
      const theme: Theme = {
        name: "depths",
        schema: { defaultStyle: { color: "#123456" } },
      };

      expect(renderAnsi("text", { theme, colorDepth: "truecolor" })).toContain(
        "\x1b[38;2;18;52;86m",
      );
      expect(renderAnsi("text", { theme, colorDepth: "256" })).toContain(
        "\x1b[38;5;",
      );
      const ansi16 = renderAnsi("text", { theme, colorDepth: "16" });
      const ansi16Code = ansi16.slice(2, 4);
      expect(ansi16.startsWith("\x1b[")).toBe(true);
      expect(ansi16Code.startsWith("3") || ansi16Code.startsWith("9")).toBe(
        true,
      );
      expect(
        renderAnsi("text", {
          theme: { name: "named", schema: { defaultStyle: { color: "red" } } },
          colorDepth: "16",
        }),
      ).toContain("\x1b[31m");
      expect(renderAnsi("text", { theme, colorDepth: "none" })).toBe("text");
      expect(resolveColorDepth("truecolor", false)).toBe("none");
    });
  });

  describe("tokensToString", () => {
    test("joins token content without styling when no metadata", () => {
      const tokens: TokenList = [
        { content: "test" },
        { content: " " },
        { content: "line" },
      ];
      const result = tokensToString(tokens);
      expect(result).toBe("test line");
    });

    test("preserves whitespace tokens exactly as is", () => {
      const tokens: TokenList = [
        { content: "test", metadata: { matchType: "word" } },
        { content: "  ", metadata: { matchType: "whitespace" } },
        { content: "line", metadata: { matchType: "word" } },
      ];
      const result = tokensToString(tokens);
      expect(result).toBe("test  line");
    });

    test("preserves newline tokens exactly as is", () => {
      const tokens: TokenList = [
        { content: "test", metadata: { matchType: "word" } },
        { content: "\n", metadata: { matchType: "newline" } },
        { content: "line", metadata: { matchType: "word" } },
      ];
      const result = tokensToString(tokens);
      expect(result).toBe("test\nline");
    });

    test("applies color styling to tokens", () => {
      const tokens: TokenList = [
        {
          content: "error",
          metadata: {
            style: { color: "red" },
          },
        },
      ];
      const result = tokensToString(tokens, true);
      expect(result).toContain("error");
      expect(result).toContain("\x1b[31m");
    });

    test("applies multiple style codes to tokens", () => {
      const tokens: TokenList = [
        {
          content: "important",
          metadata: {
            style: {
              color: "red",
              styleCodes: ["bold", "underline"],
            },
          },
        },
      ];
      const result = tokensToString(tokens, true);
      expect(result).toContain("important");
      expect(result).toContain("\x1b[1m");
      expect(result).toContain("\x1b[4m");
    });
  });

  describe("tokensToHtml", () => {
    test("converts tokens to HTML with inline styles", () => {
      const tokens: TokenList = [
        {
          content: "error",
          metadata: {
            style: { color: "red", styleCodes: ["bold"] },
          },
        },
      ];
      const result = tokensToHtml(tokens);
      expect(result).toContain("<span style=");
      expect(result).toContain("color:");
      expect(result).toContain("font-weight: bold");
      expect(result).toContain(">error</span>");
    });

    test("handles whitespace in HTML", () => {
      const tokens: TokenList = [
        { content: "test", metadata: { matchType: "word" } },
        { content: "  ", metadata: { matchType: "whitespace" } },
        { content: "line", metadata: { matchType: "word" } },
      ];
      const result = tokensToHtml(tokens);
      expect(result).toContain("test");
      expect(result).toContain("&nbsp;&nbsp;");
      expect(result).toContain("line");
    });

    test("handles newlines in HTML", () => {
      const tokens: TokenList = [
        { content: "test", metadata: { matchType: "word" } },
        { content: "\n", metadata: { matchType: "newline" } },
        { content: "line", metadata: { matchType: "word" } },
      ];
      const result = tokensToHtml(tokens);
      expect(result).toContain("test");
      expect(result).toContain("<br>");
      expect(result).toContain("line");
    });

    test("escapes HTML special characters", () => {
      const tokens: TokenList = [{ content: "<div>test</div>" }];
      const result = tokensToHtml(tokens);
      expect(result).toContain("&lt;div&gt;test&lt;/div&gt;");
      expect(result).not.toContain("<div>");
    });
  });

  describe("tokensToClassNames", () => {
    test("converts tokens to HTML with class names", () => {
      const tokens: TokenList = [
        {
          content: "error",
          metadata: {
            style: { color: "red", styleCodes: ["bold"] },
          },
        },
      ];
      const result = tokensToClassNames(tokens);
      expect(result).toContain("<span class=");
      expect(result).toContain("logsdx-bold");
      expect(result).toContain(">error</span>");
    });

    test("handles whitespace in HTML with class names", () => {
      const tokens: TokenList = [
        { content: "test", metadata: { matchType: "word" } },
        { content: "  ", metadata: { matchType: "whitespace" } },
        { content: "line", metadata: { matchType: "word" } },
      ];
      const result = tokensToClassNames(tokens);
      expect(result).toContain("test");
      expect(result).toContain("&nbsp;&nbsp;");
      expect(result).toContain("line");
    });
  });

  describe("Style application functions", () => {
    test("applyColor adds ANSI color codes", () => {
      const result = applyColor("text", "red");
      expect(result).toContain("text");

      expect(typeof result).toBe("string");
      expect(result).toMatch(/text/);
    });

    test("applyBold adds ANSI bold formatting", () => {
      const result = applyBold("text");
      expect(result).toBe("\x1b[1mtext\x1b[22m");
    });

    test("applyItalic adds ANSI italic formatting", () => {
      const result = applyItalic("text");
      expect(result).toBe("\x1b[3mtext\x1b[23m");
    });

    test("applyUnderline adds ANSI underline formatting", () => {
      const result = applyUnderline("text");
      expect(result).toBe("\x1b[4mtext\x1b[24m");
    });

    test("applyDim adds ANSI dim formatting", () => {
      const result = applyDim("text");
      expect(result).toBe("\x1b[2mtext\x1b[22m");
    });

    test("applies the remaining ANSI style codes", () => {
      expect(applyBlink("text")).toBe("\x1b[5mtext\x1b[25m");
      expect(applyReverse("text")).toBe("\x1b[7mtext\x1b[27m");
      expect(applyStrikethrough("text")).toBe("\x1b[9mtext\x1b[29m");
    });

    test("applyBackgroundColor adds ANSI background color", () => {
      const result = applyBackgroundColor("text", "blue");
      expect(result).toContain("text");

      expect(typeof result).toBe("string");
      expect(result).toMatch(/text/);
    });
  });

  describe("edge cases", () => {
    test("handles tokens with trimmed spaces without originalLength", () => {
      const tokens: TokenList = [
        {
          content: "  ",
          metadata: {
            matchType: "spaces",
            trimmed: true,
          },
        },
      ];
      const result = tokensToString(tokens);
      expect(result).toBe("");
    });

    test("handles tokens with trimmed metadata and originalLength", () => {
      const tokens: TokenList = [
        {
          content: "  ",
          metadata: {
            matchType: "spaces",
            trimmed: true,
            originalLength: 2,
          },
        },
      ];
      const result = tokensToString(tokens);
      expect(result).toBe(" ");
    });

    test("handles tokens with all style codes", () => {
      const tokens: TokenList = [
        {
          content: "text",
          metadata: {
            style: {
              color: "#ff0000",
              backgroundColor: "#000000",
              styleCodes: [
                "bold",
                "italic",
                "underline",
                "dim",
                "blink",
                "reverse",
                "strikethrough",
              ],
            },
          },
        },
      ];
      const resultAnsi = tokensToString(tokens, true);
      expect(resultAnsi).toContain("text");

      const resultHtml = tokensToHtml(tokens);
      expect(resultHtml).toContain("text");
      expect(resultHtml).toContain("font-weight: bold");
      expect(resultHtml).toContain("font-style: italic");
      expect(resultHtml).toContain("text-decoration: underline");
      expect(resultHtml).toContain("background-color: #000000");
      expect(resultHtml).toContain("text-decoration: blink");
      expect(resultHtml).toContain("filter: invert(1)");
      expect(resultHtml).toContain("text-decoration: line-through");
      expect(resultAnsi).toContain("\x1b[5m");
      expect(resultAnsi).toContain("\x1b[7m");
      expect(resultAnsi).toContain("\x1b[9m");
      expect(resultAnsi).toContain("\x1b[48;2;0;0;0m");
    });

    test("handles carriage return in HTML", () => {
      const tokens: TokenList = [
        {
          content: "\r",
          metadata: { matchType: "carriage-return" },
        },
      ];
      const result = tokensToHtml(tokens);
      expect(result).toBe("");
    });

    test("handles tab tokens in HTML", () => {
      const tokens: TokenList = [
        {
          content: "\t",
          metadata: { matchType: "tab" },
        },
      ];
      const result = tokensToHtml(tokens);
      expect(result).toContain("&nbsp;");
    });

    test("handles background color in styles", () => {
      const tokens: TokenList = [
        {
          content: "text",
          metadata: {
            style: {
              color: "#ff0000",
              backgroundColor: "#000000",
            },
          },
        },
      ];
      const result = tokensToString(tokens, true);
      expect(result).toContain("text");
    });

    test("handles tokens without style metadata", () => {
      const tokens: TokenList = [
        {
          content: "plain text",
          metadata: {},
        },
      ];
      const result = tokensToString(tokens, true);
      expect(result).toBe("plain text");
    });

    test("handles single space match type", () => {
      const tokens: TokenList = [
        {
          content: " ",
          metadata: {
            matchType: "space",
          },
        },
      ];
      const result = tokensToString(tokens);
      expect(result).toBe(" ");
    });

    test("handles mixed token types", () => {
      const tokens: TokenList = [
        {
          content: "text",
          metadata: { matchType: "word" },
        },
        {
          content: " ",
          metadata: { matchType: "space" },
        },
        {
          content: "more",
          metadata: { matchType: "word" },
        },
      ];
      const result = tokensToString(tokens);
      expect(result).toBe("text more");
    });

    test("handles trimmed spaces in HTML", () => {
      const tokens: TokenList = [
        {
          content: "  ",
          metadata: {
            matchType: "spaces",
            trimmed: true,
          },
        },
      ];
      const result = tokensToHtml(tokens);
      expect(result).toBe("&nbsp;");
    });

    test("handles trimmed token with TRIMMED_SPACE_MATCH_TYPES in HTML", () => {
      const tokens: TokenList = [
        {
          content: "  ",
          metadata: {
            matchType: "spaces",
            trimmed: true,
            originalLength: 2,
          },
        },
      ];
      const result = tokensToHtml(tokens);
      expect(result).toBe("&nbsp;");
    });

    test("handles spaces match type in HTML", () => {
      const tokens: TokenList = [
        {
          content: "   ",
          metadata: {
            matchType: "spaces",
          },
        },
      ];
      const result = tokensToHtml(tokens);
      expect(result).toContain("&nbsp;");
    });
  });
});
