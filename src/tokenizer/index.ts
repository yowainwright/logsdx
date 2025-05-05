import { Token, TokenList } from "@/src/schema/types";
import { Theme } from "@/src/types";
import { DEFAULT_RULES } from "@/src/tokenizer/constants";
import { MatcherType } from "@/src/tokenizer/types";

/**
 * Simple token context for rule matching
 */
export class TokenContext {
  constructor(public text: string, public type: string) {}

  accept(type: string, value?: any): void {
    this.type = type;
    this.value = value;
  }

  ignore(): void {
    this.ignored = true;
  }

  value?: any;
  ignored?: boolean;
}

/**
 * Simple lexer implementation
 */
export class SimpleLexer {
  private rules: Array<{
    pattern: RegExp;
    action: (ctx: TokenContext) => void;
  }> = [];
  private inputContent: string = "";
  private position: number = 0;

  rule(pattern: RegExp, action: (ctx: TokenContext) => void): void {
    this.rules.push({ pattern, action });
  }

  input(text: string): void {
    this.inputContent = text;
    this.position = 0;
  }

  token(): { type: string; text: string; value?: any } | null {
    if (this.position >= this.inputContent.length) {
      return null;
    }

    const slice = this.inputContent.slice(this.position);

    for (const { pattern, action } of this.rules) {
      pattern.lastIndex = 0;
      const match = pattern.exec(slice);

      if (match && match.index === 0) {
        const text = match[0];
        const ctx = new TokenContext(text, "");

        action(ctx);

        this.position += text.length;

        if (ctx.ignored) {
          return this.token();
        }

        return {
          type: ctx.type,
          text: ctx.text,
          value: ctx.value,
        };
      }
    }

    // No rule matched, consume one character
    const text = this.inputContent[this.position] || "";
    this.position++;

    return {
      type: "char",
      text,
    };
  }

  tokenize(input: string): Array<{ type: string; text: string; value?: any }> {
    this.input(input);
    const tokens = [];
    let token;

    while ((token = this.token()) !== null) {
      tokens.push(token);
    }

    return tokens;
  }
}

/**
 * Create a lexer with theme-specific rules
 * @param theme - The theme to use for tokenization
 * @returns A lexer with theme-specific rules
 */
export function createLexer(theme?: Theme): SimpleLexer {
  const lexer = new SimpleLexer();

  // Add basic rules for whitespace and newlines
  lexer.rule(/\s+/, (ctx) => {
    ctx.accept("whitespace");
  });

  lexer.rule(/\n/, (ctx) => {
    ctx.accept("newline");
  });

  // Add default rules for common log patterns

  // ISO timestamps: 2023-01-01T12:00:00Z
  lexer.rule(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/,
    (ctx) => {
      ctx.accept("timestamp");
    }
  );

  // Log levels: ERROR, WARN, INFO, DEBUG
  lexer.rule(/\b(ERROR|WARN|INFO|DEBUG)\b/, (ctx) => {
    ctx.accept("level");
  });

  // Add theme-specific rules if a theme is provided
  if (theme?.schema?.matchPatterns) {
    for (const pattern of theme.schema.matchPatterns) {
      try {
        // Validate the regex pattern before creating a rule
        new RegExp(pattern.pattern);

        lexer.rule(new RegExp(pattern.pattern, "g"), (ctx) => {
          ctx.accept("pattern", {
            name: pattern.name,
            pattern: pattern.pattern,
          });
        });
      } catch (error) {
        // Skip invalid patterns
      }
    }
  }

  return lexer;
}

/**
 * Escape special regex characters in a pattern
 * @param pattern - The pattern to escape
 * @returns The escaped pattern
 */
function escapeRegexPattern(pattern: string): string {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Add default tokenization rules
 */
function addDefaultRules(lexer: SimpleLexer): void {
  // Add a rule for newlines
  lexer.rule(/\n/, (ctx) => {
    ctx.accept("newline");
  });

  // Add a rule for whitespace
  lexer.rule(/\s+/, (ctx) => {
    if (ctx.text !== "\n") {
      // Don't match newlines as whitespace
      ctx.accept("whitespace");
    }
  });

  // Add the rest of the default rules
  DEFAULT_RULES.forEach((rule) => {
    lexer.rule(rule.pattern, (ctx) => {
      if ("ignore" in rule && rule.ignore) {
        ctx.ignore();
      } else {
        ctx.accept(rule.type || "default");
      }
    });
  });
}

/**
 * Add theme-specific tokenization rules
 */
function addThemeRules(lexer: SimpleLexer, theme: Theme): void {
  // Handle whitespace according to theme preferences
  if (theme.schema?.whiteSpace === "trim") {
    // Override the default whitespace rule
    lexer.rule(/\s+/, (ctx) => {
      if (ctx.text !== "\n") {
        // Don't match newlines as whitespace
        ctx.accept("whitespace", { trimmed: true });
      }
    });
  }

  // Handle newlines according to theme preferences
  if (theme.schema?.newLine === "trim") {
    // Override the default newline rule
    lexer.rule(/\n/, (ctx) => {
      ctx.ignore(); // Completely ignore newlines
    });
  }

  // Add word matchers from the schema structure
  if (theme.schema?.matchWords) {
    Object.keys(theme.schema.matchWords).forEach((word) => {
      // Escape special regex characters in the word
      const escapedWord = escapeRegexPattern(word);
      // Always use case-insensitive matching for words
      lexer.rule(new RegExp(`\\b${escapedWord}\\b`, "i"), (ctx) => {
        ctx.accept("word", {
          matchType: "word",
          pattern: word,
          style: theme.schema?.matchWords?.[word],
        });
      });
    });
  }

  // Add pattern matchers from the schema structure
  if (theme.schema?.matchPatterns) {
    // Check if matchPatterns is an array before using forEach
    if (Array.isArray(theme.schema.matchPatterns)) {
      theme.schema.matchPatterns.forEach((patternObj: any, index: number) => {
        try {
          // Use the escaped pattern to create a safe regex
          const safePattern = patternObj.pattern;
          const regex = new RegExp(safePattern);
          lexer.rule(regex, (ctx) => {
            ctx.accept("regex", {
              matchType: "regex",
              pattern: patternObj.pattern,
              name: patternObj.name,
              index,
              style: patternObj.options,
            });
          });
        } catch (error) {
          console.warn(`Invalid regex pattern in theme: ${patternObj.pattern}`);
        }
      });
    } else {
      console.warn("matchPatterns is not an array in theme schema");
    }
  }
}

/**
 * Tokenize a log line using theme-specific patterns
 *
 * @param line - The log line to tokenize
 * @param theme - Optional theme to use for tokenization
 * @returns A list of tokens
 */
export function tokenize(line: string, theme?: Theme): TokenList {
  try {
    // Check if the theme is problematic before proceeding
    if (
      theme &&
      (!theme.schema ||
        (theme.schema.matchPatterns &&
          !Array.isArray(theme.schema.matchPatterns)))
    ) {
      throw new Error("Invalid theme schema");
    }

    const lexer = createLexer(theme);
    const lexerTokens = lexer.tokenize(line);

    const tokens: TokenList = [];

    // Convert lexer tokens to our token format
    for (const token of lexerTokens) {
      const matchType = token.type as MatcherType;

      // Create the token with basic information
      const newToken: Token = {
        content: token.text,
        metadata: {
          matchType: matchType,
          matchPattern: token.value?.pattern || token.type,
        },
      };

      // Add any additional metadata from the token
      if (token.value) {
        if (token.value.style) {
          newToken.metadata.style = token.value.style;
        }

        if (token.value.pattern) {
          newToken.metadata.pattern = token.value.pattern;
        }

        if (token.value.name) {
          newToken.metadata.name = token.value.name;
        }

        if (token.value.index !== undefined) {
          newToken.metadata.index = token.value.index;
        }

        if (token.value.trimmed) {
          newToken.metadata.trimmed = token.value.trimmed;
        }
      }

      tokens.push(newToken);
    }

    return tokens;
  } catch (error) {
    console.warn("Tokenization failed:", error);

    // If tokenization fails, return the whole line as a single token
    return [
      {
        content: line,
        metadata: {
          matchType: "default" as MatcherType,
          matchPattern: "default",
        },
      },
    ];
  }
}

/**
 * Apply theme styling to tokens
 * @param tokens - The tokens to style
 * @param theme - The theme to apply
 * @returns The styled tokens
 */
export function applyTheme(tokens: TokenList, theme: Theme): TokenList {
  if (!theme || !theme.schema) {
    return tokens;
  }

  return tokens.map((token) => {
    const { metadata } = token;

    // Skip tokens without metadata
    if (!metadata) {
      return token;
    }

    // If the token already has style, keep it
    if (metadata.style) {
      return token;
    }

    // Apply word matching
    if (
      metadata.matchType === "word" &&
      metadata.pattern &&
      theme.schema?.matchWords
    ) {
      const wordStyle = theme.schema.matchWords[metadata.pattern];
      if (wordStyle) {
        return {
          ...token,
          metadata: {
            ...metadata,
            style: wordStyle,
          },
        };
      }
    }

    // Apply pattern matching by name
    if (
      metadata.matchType === "regex" &&
      metadata.name &&
      theme.schema?.matchPatterns
    ) {
      const pattern = Array.isArray(theme.schema.matchPatterns)
        ? theme.schema.matchPatterns.find((p) => p.name === metadata.name)
        : undefined;

      if (pattern && pattern.options) {
        return {
          ...token,
          metadata: {
            ...metadata,
            style: pattern.options,
          },
        };
      }
    }

    // Apply pattern matching by index
    if (
      metadata.matchType === "regex" &&
      metadata.index !== undefined &&
      theme.schema?.matchPatterns &&
      Array.isArray(theme.schema.matchPatterns)
    ) {
      const pattern = theme.schema.matchPatterns[metadata.index];
      if (pattern && pattern.options) {
        return {
          ...token,
          metadata: {
            ...metadata,
            style: pattern.options,
          },
        };
      }
    }

    // Apply default style if no specific style was found
    if (theme.schema?.defaultStyle) {
      return {
        ...token,
        metadata: {
          ...metadata,
          style: theme.schema.defaultStyle,
        },
      };
    }

    return token;
  });
}

export default {
  tokenize,
  applyTheme,
  createLexer,
};
