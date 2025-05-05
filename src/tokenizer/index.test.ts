import { expect, test, describe } from "bun:test";
import { tokenize, createLexer, applyTheme } from "./index";
import { TokenList } from "@/src/schema/types";
import { Theme } from "@/src/types";

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
            "error": { color: "red" }
          }
        }
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
      const totalContent = tokens.map(t => t.content).join('');
      expect(totalContent).toBe(line);
    });

    test("tokenizes with default rules", () => {
      const line = "2023-01-01T12:00:00Z ERROR: Something went wrong";
      const tokens = tokenize(line);
      
      // Should identify timestamp and log level
      const hasTimestamp = tokens.some(t => 
        t.metadata?.matchType === 'timestamp' && 
        t.content === '2023-01-01T12:00:00Z'
      );
      
      const hasLogLevel = tokens.some(t => 
        t.metadata?.matchType === 'level' && 
        t.content === 'ERROR'
      );
      
      expect(hasTimestamp).toBe(true);
      expect(hasLogLevel).toBe(true);
    });

    test("handles whitespace according to theme preferences", () => {
      const line = "test  with  spaces";
      
      // Default (preserve whitespace)
      const tokensPreserve = tokenize(line);
      const contentPreserve = tokensPreserve.map(t => t.content).join('');
      expect(contentPreserve).toBe(line);
      
      // Trim whitespace
      const themeTrim: Theme = {
        name: "Trim Theme",
        schema: {
          whiteSpace: 'trim'
        }
      };
      
      const tokensTrim = tokenize(line, themeTrim);
      const contentTrim = tokensTrim.map(t => t.content).join('');
      expect(contentTrim).not.toBe(line);
      expect(contentTrim.replace(/\s+/g, '')).toBe(line.replace(/\s+/g, ''));
    });

    test("handles newlines according to theme preferences", () => {
      const line = "line1\nline2";
      
      // Default (preserve newlines)
      const tokensPreserve = tokenize(line);
      const hasNewline = tokensPreserve.some(t => 
        t.content === '\n' && t.metadata?.matchType === 'newline'
      );
      expect(hasNewline).toBe(true);
      
      // Trim newlines
      const themeTrim: Theme = {
        name: "Trim Newlines",
        schema: {
          newLine: 'trim'
        }
      };
      
      const tokensTrim = tokenize(line, themeTrim);
      const hasNewlineTrim = tokensTrim.some(t => 
        t.content === '\n' && t.metadata?.matchType === 'newline'
      );
      expect(hasNewlineTrim).toBe(false);
    });

    test("applies theme-specific word matching", () => {
      // Create tokens manually
      const tokens: TokenList = [
        {
          content: "test",
          metadata: {
            matchType: "word",
            matchPattern: "test"
          }
        }
      ];
      
      // Create a theme
      const theme: Theme = {
        name: "Simple Word Theme",
        schema: {
          matchWords: {
            "test": { color: "green" }
          }
        }
      };
      
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
            name: "digit"
          }
        }
      ];
      
      // Create a theme
      const theme: Theme = {
        name: "Simple Pattern Theme",
        schema: {
          matchPatterns: [
            {
              name: "digit",
              pattern: "\\d+",
              options: { color: "blue" }
            }
          ]
        }
      };
      
      // Apply the theme to the tokens
      const styledTokens = applyTheme(tokens, theme);
      
      // Check if the token has the style we expect
      expect(styledTokens[0].metadata?.style?.color).toBe("blue");
    });

    test("handles invalid regex patterns gracefully", () => {
      const theme: Theme = {
        name: "Invalid Pattern Theme",
        schema: {
          matchPatterns: [
            {
              name: "invalid",
              pattern: "\\", // Invalid regex
              options: { color: "red" }
            }
          ]
        }
      };
      
      // Should not throw an error
      const line = "Test line";
      const tokens = tokenize(line, theme);
      expect(tokens).toBeInstanceOf(Array);
    });

    test("handles tokenization errors gracefully", () => {
      // Create a theme with an intentionally problematic configuration
      const problematicTheme: Theme = {
        name: "Problematic Theme",
        schema: {
          // @ts-ignore - Intentionally creating an invalid configuration
          matchPatterns: "not-an-array"
        }
      };
      
      // This should not throw an error despite the invalid configuration
      const line = "Test line";
      const tokens = tokenize(line, problematicTheme);
      
      // Should still return some tokens
      expect(tokens.length).toBeGreaterThan(0);
      
      // The entire content should still be present
      const content = tokens.map(t => t.content).join('');
      expect(content).toBe(line);
    });

    test("returns a single token for the whole line on error", () => {
      // Create a spy on console.warn to verify it's called
      const originalWarn = console.warn;
      let warnCalled = false;
      console.warn = (...args: any[]) => {
        warnCalled = true;
        // Optional: log the original warning
        // originalWarn(...args);
      };
      
      try {
        // Force an error by creating a theme that will cause the tokenizer to throw
        const problematicTheme: Theme = {
          name: "Problematic Theme",
          schema: {
            // @ts-ignore - Intentionally creating an invalid configuration
            matchPatterns: "not-an-array",
            // @ts-ignore - More invalid configuration to force an error
            matchWords: 123,
            // @ts-ignore - Force the tokenizer to try to access undefined properties
            undefinedProperty: { subProperty: null }
          }
        };
        
        // Mock console.error to prevent test output pollution
        const originalError = console.error;
        console.error = () => {};
        
        try {
          const line = "Test line";
          const tokens = tokenize(line, problematicTheme);
          
          // Should return a single token with the entire line
          expect(tokens.length).toBe(1);
          expect(tokens[0].content).toBe(line);
          expect(tokens[0].metadata?.matchType).toBe("default");
          
          // Verify that console.warn was called
          expect(warnCalled).toBe(true);
        } finally {
          console.error = originalError;
        }
      } finally {
        // Restore the original console.warn
        console.warn = originalWarn;
      }
    });
  });

  describe("applyTheme", () => {
    test("applies theme styling to tokens", () => {
      const tokens: TokenList = [
        {
          content: "error",
          metadata: {
            matchType: "word",
            matchPattern: "error"
          }
        },
        {
          content: " message",
          metadata: {
            matchType: "default",
            matchPattern: "default"
          }
        }
      ];
      
      const theme: Theme = {
        name: "Test Theme",
        schema: {
          matchWords: {
            "error": { color: "red" }
          },
          defaultStyle: { color: "white" }
        }
      };
      
      const styledTokens = applyTheme(tokens, theme);
      
      expect(styledTokens[0].metadata?.style).toEqual({ color: "red" });
      expect(styledTokens[1].metadata?.style).toEqual({ color: "white" });
    });

    test("applies regex pattern styling by name", () => {
      const tokens: TokenList = [
        {
          content: "192.168.1.1",
          metadata: {
            matchType: "regex",
            matchPattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b",
            name: "ipAddress"
          }
        }
      ];
      
      const theme: Theme = {
        name: "Test Theme",
        schema: {
          matchPatterns: [
            {
              name: "ipAddress",
              pattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b",
              options: { color: "blue" }
            }
          ]
        }
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
            index: 0
          }
        }
      ];
      
      const theme: Theme = {
        name: "Test Theme",
        schema: {
          matchPatterns: [
            {
              name: "ipAddress",
              pattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b",
              options: { color: "blue" }
            }
          ]
        }
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
            matchPattern: "default"
          }
        }
      ];
      
      const theme: Theme = {
        name: "Test Theme",
        schema: {
          defaultStyle: { color: "white" }
        }
      };
      
      const styledTokens = applyTheme(tokens, theme);
      expect(styledTokens[0].metadata?.style).toEqual({ color: "white" });
    });
  });
});
