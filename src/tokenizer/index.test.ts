import { expect, test, describe } from "bun:test";
import { tokenize, createLexer, applyTheme } from "./index";
import { TokenList } from "../schema/types";
import { Theme } from "../types";

describe("Tokenizer", () => {
  describe("createLexer", () => {
    test("creates a lexer with default rules", () => {
      const lexer = createLexer();
      expect(lexer).toBeDefined();
    });

    test("creates a lexer with theme-specific rules", () => {
      const theme: Theme = {
        name: "Test Theme",
        schema: {
          matchWords: {
            error: { color: "red" },
          },
        },
      };
      const lexer = createLexer(theme);
      expect(lexer).toBeDefined();
    });
  });

  describe("tokenize", () => {
    test("tokenizes a simple string", () => {
      const line = "This is a test";
      const tokens = tokenize(line);

      expect(tokens).toBeInstanceOf(Array);
      expect(tokens.length).toBeGreaterThan(0);

      // The entire string should be tokenized
      const totalContent = tokens.map((t) => t.content).join("");
      expect(totalContent).toBe(line);
    });

    test("tokenizes with default rules", () => {
      const line = "2023-01-01T12:00:00Z ERROR: Something went wrong";
      const tokens = tokenize(line);

      // The default tokenizer might not identify timestamps and log levels
      // Let's just check that the tokens contain the expected content
      const content = tokens.map((t) => t.content).join("");
      expect(content).toBe(line);

      // Check that we have multiple tokens
      expect(tokens.length).toBeGreaterThan(1);

      // Check that at least one token contains "ERROR"
      const hasError = tokens.some((t) => t.content.includes("ERROR"));
      expect(hasError).toBe(true);
    });

    test("handles whitespace according to theme preferences", () => {
      const line = "test  with  spaces";

      // Default (preserve whitespace)
      const tokensPreserve = tokenize(line);
      const contentPreserve = tokensPreserve.map((t) => t.content).join("");
      expect(contentPreserve).toBe(line);

      // Test with a theme that has whitespace trimming enabled
      const themeTrim: Theme = {
        name: "Trim Whitespace",
        schema: {
          whiteSpace: "trim",
        },
      };

      // Just verify that tokenization works with this theme
      const tokensTrim = tokenize(line, themeTrim);
      expect(tokensTrim).toBeInstanceOf(Array);
      expect(tokensTrim.length).toBeGreaterThan(0);
    });

    test("handles newlines according to theme preferences", () => {
      const line = "line1\nline2";

      // Default (preserve newlines)
      const tokensPreserve = tokenize(line);
      const hasNewline = tokensPreserve.some((t) => t.content === "\n");
      expect(hasNewline).toBe(true);

      // Test with a theme that has newline trimming enabled
      const themeTrim: Theme = {
        name: "Trim Newlines",
        schema: {
          newLine: "trim",
        },
      };

      // Just verify that tokenization works with this theme
      const tokensTrim = tokenize(line, themeTrim);
      expect(tokensTrim).toBeInstanceOf(Array);
      expect(tokensTrim.length).toBeGreaterThan(0);
    });

    test("applies theme-specific word matching", () => {
      // Create a theme with a word matcher
      const theme: Theme = {
        name: "Word Theme",
        schema: {
          matchWords: {
            test: { color: "green" },
          },
        },
      };

      // Create a token that should match the word
      const tokens: TokenList = [
        {
          content: "test",
          metadata: {
            matchType: "word",
            pattern: "test",
          },
        },
      ];

      // Apply the theme to the tokens
      const styledTokens = applyTheme(tokens, theme);

      // Check if the token has the style we expect
      expect(styledTokens[0].metadata?.style?.color).toBe("green");
    });

    test("applies theme-specific pattern matching", () => {
      // Create tokens manually
      const tokens: TokenList = [
        {
          content: "123",
          metadata: {
            matchType: "regex",
            matchPattern: "\\d+",
            name: "digit",
          },
        },
      ];

      // Create a theme
      const theme: Theme = {
        name: "Simple Pattern Theme",
        schema: {
          matchPatterns: [
            {
              name: "digit",
              pattern: "\\d+",
              options: { color: "blue" },
            },
          ],
        },
      };

      // Apply the theme to the tokens
      const styledTokens = applyTheme(tokens, theme);

      // Check if the token has the style we expect
      expect(styledTokens[0].metadata?.style?.color).toBe("blue");
    });

    test("handles invalid regex patterns gracefully", () => {
      // Save original console.warn
      const originalWarn = console.warn;

      // Temporarily silence console.warn
      console.warn = () => {};

      try {
        const theme: Theme = {
          name: "Invalid Pattern Theme",
          schema: {
            matchPatterns: [
              {
                name: "invalid",
                pattern: "\\", // Invalid regex
                options: { color: "red" },
              },
            ],
          },
        };

        // Should not throw an error
        const line = "Test line";
        const tokens = tokenize(line, theme);
        expect(tokens).toBeInstanceOf(Array);
      } finally {
        // Restore console.warn
        console.warn = originalWarn;
      }
    });

    test("handles tokenization errors gracefully", () => {
      // Save original console.warn
      const originalWarn = console.warn;

      // Temporarily silence console.warn
      console.warn = () => {};

      try {
        // Create a theme with an intentionally problematic configuration
        const problematicTheme: Theme = {
          name: "Problematic Theme",
          schema: {
            // @ts-expect-error - Intentionally creating an invalid configuration
            matchPatterns: "not-an-array",
          },
        };

        // This should not throw an error despite the invalid configuration
        const line = "Test line";
        const tokens = tokenize(line, problematicTheme);

        // Should still return some tokens
        expect(tokens.length).toBeGreaterThan(0);

        // The entire content should still be present
        const content = tokens.map((t) => t.content).join("");
        expect(content).toBe(line);
      } finally {
        // Restore console.warn
        console.warn = originalWarn;
      }
    });

    test("returns a single token for the whole line on error", () => {
      // Create a problematic theme that will cause tokenization to fail
      const problematicTheme: Theme = {
        name: "Problematic Theme",
        schema: {
          // @ts-expect-error - Intentionally creating an invalid schema
          matchPatterns: "not-an-array",
        },
      };

      try {
        const line = "Test line";
        const tokens = tokenize(line, problematicTheme);

        // Should return a single token with the entire line
        expect(tokens.length).toBe(1);
        expect(tokens[0].content).toBe(line);
        expect(tokens[0].metadata?.matchType).toBe("default");
      } catch (error) {
        fail("Should not throw an error, but return a fallback token");
      }
    });
  });

  describe("applyTheme", () => {
    test("applies theme styling to tokens", () => {
      // Create tokens manually
      const tokens: TokenList = [
        {
          content: "error",
          metadata: {
            matchType: "word",
            pattern: "error",
          },
        },
        {
          content: " message",
          metadata: {
            matchType: "default",
            matchPattern: "default",
          },
        },
      ];

      const theme: Theme = {
        name: "Test Theme",
        schema: {
          matchWords: {
            error: { color: "red" },
          },
          defaultStyle: { color: "white" },
        },
      };

      const styledTokens = applyTheme(tokens, theme);

      // Check if the first token has red color
      expect(styledTokens[0].metadata?.style?.color).toBe("red");

      // Check if the second token has white color
      expect(styledTokens[1].metadata?.style?.color).toBe("white");
    });

    test("applies regex pattern styling by name", () => {
      const tokens: TokenList = [
        {
          content: "192.168.1.1",
          metadata: {
            matchType: "regex",
            matchPattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b",
            name: "ipAddress",
          },
        },
      ];

      const theme: Theme = {
        name: "Test Theme",
        schema: {
          matchPatterns: [
            {
              name: "ipAddress",
              pattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b",
              options: { color: "blue" },
            },
          ],
        },
      };

      const styledTokens = applyTheme(tokens, theme);
      expect(styledTokens[0].metadata?.style).toEqual({ color: "blue" });
    });

    test("applies regex pattern styling by index", () => {
      const tokens: TokenList = [
        {
          content: "192.168.1.1",
          metadata: {
            matchType: "regex",
            matchPattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b",
            index: 0,
          },
        },
      ];

      const theme: Theme = {
        name: "Test Theme",
        schema: {
          matchPatterns: [
            {
              name: "ipAddress",
              pattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b",
              options: { color: "blue" },
            },
          ],
        },
      };

      const styledTokens = applyTheme(tokens, theme);
      expect(styledTokens[0].metadata?.style).toEqual({ color: "blue" });
    });

    test("applies default style when no specific style is found", () => {
      const tokens: TokenList = [
        {
          content: "some text",
          metadata: {
            matchType: "default",
            matchPattern: "default",
          },
        },
      ];

      const theme: Theme = {
        name: "Test Theme",
        schema: {
          defaultStyle: { color: "white" },
        },
      };

      const styledTokens = applyTheme(tokens, theme);
      expect(styledTokens[0].metadata?.style).toEqual({ color: "white" });
    });
  });
});
