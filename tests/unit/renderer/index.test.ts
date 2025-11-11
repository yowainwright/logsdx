import { expect, test, describe } from "bun:test";
import {
  renderLine,
  tokensToString,
  tokensToHtml,
  tokensToClassNames,
  applyColor,
  applyBold,
  applyItalic,
  applyUnderline,
  applyDim,
  applyBackgroundColor,
} from "../../../src/renderer/index";
import { TokenList } from "../../../src/schema/types";

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

    test("applyBackgroundColor adds ANSI background color", () => {
      const result = applyBackgroundColor("text", "blue");
      expect(result).toContain("text");

      expect(typeof result).toBe("string");
      expect(result).toMatch(/text/);
    });
  });

  describe("edge cases", () => {
    test("handles tokens with trimmed metadata", () => {
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
              styleCodes: ["bold", "italic", "underline", "dim"],
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
  });
});
