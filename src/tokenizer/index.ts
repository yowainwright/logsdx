import { Token, TokenList } from "../schema/types";
import { Theme } from "../types";
import { MatcherType } from "./types";

/**
 * Simple token context for rule matching
 */
export class TokenContext {
  constructor(
    public text: string,
    public type: string,
  ) {}

  accept(type: string, value?: unknown): void {
    this.type = type;
    this.value = value;
  }

  ignore(): void {
    this.ignored = true;
  }

  value?: unknown;
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

  token(): { type: string; text: string; value?: unknown } | null {
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

  tokenize(
    input: string,
  ): Array<{ type: string; text: string; value?: unknown }> {
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

  // Add enhanced rules for whitespace and newlines
  // Handle tabs specifically
  lexer.rule(/\t+/, (ctx) => {
    ctx.accept("tab");
  });

  // Handle multiple spaces
  lexer.rule(/ {2,}/, (ctx) => {
    ctx.accept("spaces");
  });

  // Handle single spaces
  lexer.rule(/ /, (ctx) => {
    ctx.accept("space");
  });

  // Handle newlines
  lexer.rule(/\n/, (ctx) => {
    ctx.accept("newline");
  });

  // Handle carriage returns
  lexer.rule(/\r/, (ctx) => {
    ctx.accept("carriage-return");
  });

  // Handle other whitespace
  lexer.rule(/\s/, (ctx) => {
    ctx.accept("whitespace");
  });

  // Add default rules for common log patterns

  // ISO timestamps: 2023-01-01T12:00:00Z
  lexer.rule(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/,
    (ctx) => {
      ctx.accept("timestamp");
    },
  );

  // Log levels: ERROR, WARN, INFO, DEBUG
  lexer.rule(/\b(ERROR|WARN|INFO|DEBUG)\b/, (ctx) => {
    ctx.accept("level");
  });

  // Add theme-specific rules if a theme is provided
  if (theme) {
    addThemeRules(lexer, theme);
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
 * Add theme-specific tokenization rules
 */
function addThemeRules(lexer: SimpleLexer, theme: Theme): void {
  if (theme.schema?.whiteSpace === "trim") {
    lexer.rule(/\t+/, (ctx) => {
      ctx.ignore();
    });
    lexer.rule(/ {2,}/, (ctx) => {
      ctx.accept("spaces", { trimmed: true, originalLength: ctx.text.length });
    });
    lexer.rule(/ /, (ctx) => {
      ctx.accept("space", { trimmed: true });
    });
  }

  if (theme.schema?.newLine === "trim") {
    lexer.rule(/\n/, (ctx) => {
      ctx.ignore();
    });
    lexer.rule(/\r/, (ctx) => {
      ctx.ignore();
    });
  }

  if (theme.schema?.matchWords) {
    Object.keys(theme.schema.matchWords).forEach((word) => {
      const escapedWord = escapeRegexPattern(word);
      lexer.rule(new RegExp(`\\b${escapedWord}\\b`, "i"), (ctx) => {
        ctx.accept("word", {
          matchType: "word",
          pattern: word,
          style: theme.schema?.matchWords?.[word],
        });
      });
    });
  }

  if (theme.schema?.matchPatterns) {
    if (Array.isArray(theme.schema.matchPatterns)) {
      theme.schema.matchPatterns.forEach((patternObj, index: number) => {
        try {
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
        } catch {
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
    if (
      theme &&
      (!theme.schema ||
        (theme.schema.matchPatterns &&
          !Array.isArray(theme.schema.matchPatterns)))
    ) {
      return [
        {
          content: line,
          metadata: {
            matchType: "default",
          },
        },
      ];
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
          matchPattern: (token.value &&
          typeof token.value === "object" &&
          "pattern" in token.value
            ? (token.value as Record<string, unknown>).pattern
            : token.type) as string,
        },
      };

      if (token.value && typeof token.value === "object") {
        const tokenValue = token.value as Record<string, unknown>;
        if (tokenValue.style) {
          (newToken.metadata as Record<string, unknown>).style =
            tokenValue.style;
        }

        if (tokenValue.pattern) {
          (newToken.metadata as Record<string, unknown>).pattern =
            tokenValue.pattern;
        }

        if (tokenValue.name) {
          (newToken.metadata as Record<string, unknown>).name = tokenValue.name;
        }

        if (tokenValue.index !== undefined) {
          (newToken.metadata as Record<string, unknown>).index =
            tokenValue.index;
        }

        if (tokenValue.trimmed) {
          (newToken.metadata as Record<string, unknown>).trimmed =
            tokenValue.trimmed;
        }
      }

      tokens.push(newToken);
    }

    return tokens;
  } catch (error) {
    console.warn("Tokenization failed:", error);

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
      typeof metadata.pattern === "string" &&
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
        ? theme.schema.matchPatterns.find(
            (p) => p?.name === (metadata as Record<string, unknown>).name,
          )
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
      typeof (metadata as Record<string, unknown>).index === "number" &&
      theme.schema?.matchPatterns &&
      Array.isArray(theme.schema.matchPatterns)
    ) {
      const pattern =
        theme.schema.matchPatterns[
          (metadata as Record<string, unknown>).index as number
        ];
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
