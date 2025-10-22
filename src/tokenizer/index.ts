import type { Token, TokenList } from "../schema/types";
import type { Theme } from "../types";
import type { MatcherType } from "./types";
import {
  TIMESTAMP_PATTERN,
  LOG_LEVEL_PATTERN,
  TAB_PATTERN,
  MULTIPLE_SPACES_PATTERN,
  SINGLE_SPACE_PATTERN,
  NEWLINE_PATTERN,
  CARRIAGE_RETURN_PATTERN,
  WHITESPACE_PATTERN,
  TOKEN_TYPE_TAB,
  TOKEN_TYPE_SPACES,
  TOKEN_TYPE_SPACE,
  TOKEN_TYPE_NEWLINE,
  TOKEN_TYPE_CARRIAGE_RETURN,
  TOKEN_TYPE_WHITESPACE,
  TOKEN_TYPE_TIMESTAMP,
  TOKEN_TYPE_LEVEL,
  TOKEN_TYPE_WORD,
  TOKEN_TYPE_REGEX,
  TOKEN_TYPE_DEFAULT,
  TOKEN_TYPE_CHAR,
  MATCH_TYPE_WORD,
  MATCH_TYPE_REGEX,
  MATCH_TYPE_DEFAULT,
  WHITESPACE_TRIM,
  NEWLINE_TRIM,
} from "./constants";
import {
  escapeRegexPattern,
  isObject,
  createWordBoundaryPattern,
  extractStyle,
  extractPattern,
  hasStyleMetadata,
  isTrimmedWhitespace,
  createSafeRegex,
  isValidMatchPatternsArray,
} from "./utils";

export class TokenContext {
  public value?: unknown;
  public ignored?: boolean;

  constructor(
    public text: string,
    public type: string
  ) {}

  accept(type: string, value?: unknown): void {
    this.type = type;
    this.value = value;
  }

  ignore(): void {
    this.ignored = true;
  }
}

export class SimpleLexer {
  private rules: ReadonlyArray<{
    readonly pattern: RegExp;
    readonly action: (ctx: TokenContext) => void;
  }> = [];
  private inputContent: string = "";
  private position: number = 0;

  rule(pattern: RegExp, action: (ctx: TokenContext) => void): void {
    this.rules = [...this.rules, { pattern, action }];
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
    const matchedToken = this.findMatchingToken(slice);

    if (matchedToken) {
      return matchedToken;
    }

    return this.consumeUnmatchedText();
  }

  private findMatchingToken(
    slice: string
  ): { type: string; text: string; value?: unknown } | null {
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

    return null;
  }

  private consumeUnmatchedText(): { type: string; text: string } {
    const start = this.position;
    let end = start;

    while (end < this.inputContent.length) {
      const slice = this.inputContent.slice(end);

      const hasMatch = this.rules.some(({ pattern }) => {
        pattern.lastIndex = 0;
        const match = pattern.exec(slice);
        return match && match.index === 0;
      });

      if (hasMatch) break;
      end++;
    }

    if (end === start) end = start + 1;

    const text = this.inputContent.slice(start, end);
    this.position = end;

    return {
      type: TOKEN_TYPE_CHAR,
      text,
    };
  }

  tokenize(
    input: string
  ): ReadonlyArray<{ type: string; text: string; value?: unknown }> {
    this.input(input);
    const tokens: Array<{ type: string; text: string; value?: unknown }> = [];
    let token;

    while ((token = this.token()) !== null) {
      tokens.push(token);
    }

    return tokens;
  }
}

export function addWhitespaceRules(lexer: SimpleLexer): void {
  lexer.rule(TAB_PATTERN, (ctx) => {
    ctx.accept(TOKEN_TYPE_TAB);
  });

  lexer.rule(MULTIPLE_SPACES_PATTERN, (ctx) => {
    ctx.accept(TOKEN_TYPE_SPACES);
  });

  lexer.rule(SINGLE_SPACE_PATTERN, (ctx) => {
    ctx.accept(TOKEN_TYPE_SPACE);
  });

  lexer.rule(NEWLINE_PATTERN, (ctx) => {
    ctx.accept(TOKEN_TYPE_NEWLINE);
  });

  lexer.rule(CARRIAGE_RETURN_PATTERN, (ctx) => {
    ctx.accept(TOKEN_TYPE_CARRIAGE_RETURN);
  });

  lexer.rule(WHITESPACE_PATTERN, (ctx) => {
    ctx.accept(TOKEN_TYPE_WHITESPACE);
  });
}

export function addDefaultLogRules(lexer: SimpleLexer): void {
  lexer.rule(TIMESTAMP_PATTERN, (ctx) => {
    ctx.accept(TOKEN_TYPE_TIMESTAMP);
  });

  lexer.rule(LOG_LEVEL_PATTERN, (ctx) => {
    ctx.accept(TOKEN_TYPE_LEVEL);
  });
}

export function addTrimWhitespaceRules(lexer: SimpleLexer): void {
  lexer.rule(TAB_PATTERN, (ctx) => {
    ctx.ignore();
  });

  lexer.rule(MULTIPLE_SPACES_PATTERN, (ctx) => {
    ctx.accept(TOKEN_TYPE_SPACES, {
      trimmed: true,
      originalLength: ctx.text.length,
    });
  });

  lexer.rule(SINGLE_SPACE_PATTERN, (ctx) => {
    ctx.accept(TOKEN_TYPE_SPACE, { trimmed: true });
  });
}

export function addTrimNewlineRules(lexer: SimpleLexer): void {
  lexer.rule(NEWLINE_PATTERN, (ctx) => {
    ctx.ignore();
  });

  lexer.rule(CARRIAGE_RETURN_PATTERN, (ctx) => {
    ctx.ignore();
  });
}

export function addWordMatchRules(
  lexer: SimpleLexer,
  matchWords: Record<string, unknown>
): void {
  const wordEntries = Object.entries(matchWords);

  for (const [word, style] of wordEntries) {
    const pattern = createWordBoundaryPattern(word);
    lexer.rule(pattern, (ctx) => {
      ctx.accept(TOKEN_TYPE_WORD, {
        matchType: MATCH_TYPE_WORD,
        pattern: word,
        style,
      });
    });
  }
}

function createIdentifierPattern(identifier: string): RegExp {
  return new RegExp(escapeRegexPattern(identifier), 'gi');
}

function validatePatternMatch(
  ctx: TokenContext,
  fullPattern: string | RegExp
): boolean {
  const fullRegex = typeof fullPattern === 'string'
    ? createSafeRegex(fullPattern)
    : fullPattern;

  if (!fullRegex) return false;

  fullRegex.lastIndex = 0;
  const fullMatch = fullRegex.exec(ctx.text);
  return fullMatch !== null && fullMatch[0] === ctx.text;
}

export function addPatternMatchRules(
  lexer: SimpleLexer,
  matchPatterns: ReadonlyArray<{
    pattern: string | RegExp;
    name?: string;
    identifier?: string;
    options?: unknown;
  }>
): void {
  for (let index = 0; index < matchPatterns.length; index++) {
    const patternObj = matchPatterns[index];

    if (patternObj.identifier && typeof patternObj.identifier === 'string') {
      const identifierRegex = createIdentifierPattern(patternObj.identifier);

      lexer.rule(identifierRegex, (ctx) => {
        if (!validatePatternMatch(ctx, patternObj.pattern)) {
          ctx.ignore();
          return;
        }

        ctx.accept(TOKEN_TYPE_REGEX, {
          matchType: MATCH_TYPE_REGEX,
          pattern: patternObj.pattern,
          name: patternObj.name,
          index,
          style: patternObj.options,
        });
      });

      continue;
    }

    const regex = typeof patternObj.pattern === 'string'
      ? createSafeRegex(patternObj.pattern)
      : patternObj.pattern;

    if (!regex) {
      console.warn(`Invalid regex pattern in theme: ${patternObj.pattern}`);
      continue;
    }

    lexer.rule(regex, (ctx) => {
      ctx.accept(TOKEN_TYPE_REGEX, {
        matchType: MATCH_TYPE_REGEX,
        pattern: patternObj.pattern,
        name: patternObj.name,
        index,
        style: patternObj.options,
      });
    });
  }
}

export function addThemeRules(lexer: SimpleLexer, theme: Theme): void {
  const schema = theme.schema;

  if (!schema) {
    return;
  }

  if (schema.whiteSpace === WHITESPACE_TRIM) {
    addTrimWhitespaceRules(lexer);
  }

  if (schema.newLine === NEWLINE_TRIM) {
    addTrimNewlineRules(lexer);
  }

  if (schema.matchWords) {
    addWordMatchRules(lexer, schema.matchWords);
  }

  if (schema.matchPatterns && isValidMatchPatternsArray(schema.matchPatterns)) {
    addPatternMatchRules(lexer, schema.matchPatterns as ReadonlyArray<{
      pattern: string | RegExp;
      name?: string;
      identifier?: string;
      options?: unknown;
    }>);
  } else if (schema.matchPatterns) {
    console.warn("matchPatterns is not an array in theme schema");
  }
}

/**
 * Create a lexer with theme-specific rules
 * @param theme - The theme to use for tokenization
 * @returns A lexer with theme-specific rules
 */
export function createLexer(theme?: Theme): SimpleLexer {
  const lexer = new SimpleLexer();

  addWhitespaceRules(lexer);
  addDefaultLogRules(lexer);

  if (theme) {
    addThemeRules(lexer, theme);
  }

  return lexer;
}

export function createDefaultToken(line: string): Token {
  return {
    content: line,
    metadata: {
      matchType: TOKEN_TYPE_DEFAULT as MatcherType,
      matchPattern: TOKEN_TYPE_DEFAULT,
    },
  };
}

export function shouldUseDefaultToken(theme?: Theme): boolean {
  if (!theme) {
    return false;
  }

  if (!theme.schema) {
    return true;
  }

  if (theme.schema.matchPatterns && !isValidMatchPatternsArray(theme.schema.matchPatterns)) {
    return true;
  }

  return false;
}

export function createTokenMetadata(
  matchType: MatcherType,
  tokenType: string,
  tokenValue: unknown
): Token["metadata"] {
  const pattern = extractPattern(tokenValue);

  const metadata: Token["metadata"] = {
    matchType,
    matchPattern: pattern || tokenType,
  };

  if (!isObject(tokenValue)) {
    return metadata;
  }

  const style = extractStyle(tokenValue);
  if (style) {
    (metadata as Record<string, unknown>).style = style;
  }

  if (pattern) {
    (metadata as Record<string, unknown>).pattern = pattern;
  }

  if (tokenValue.name) {
    (metadata as Record<string, unknown>).name = tokenValue.name;
  }

  if (tokenValue.index !== undefined) {
    (metadata as Record<string, unknown>).index = tokenValue.index;
  }

  if (tokenValue.trimmed) {
    (metadata as Record<string, unknown>).trimmed = tokenValue.trimmed;
  }

  return metadata;
}

export function convertLexerToken(lexerToken: {
  type: string;
  text: string;
  value?: unknown;
}): Token {
  const matchType = lexerToken.type as MatcherType;
  const metadata = createTokenMetadata(matchType, lexerToken.type, lexerToken.value);

  return {
    content: lexerToken.text,
    metadata,
  };
}

export function convertLexerTokens(
  lexerTokens: ReadonlyArray<{ type: string; text: string; value?: unknown }>
): TokenList {
  return lexerTokens.map(convertLexerToken);
}

/**
 * Tokenize a log line using theme-specific patterns
 * @param line - The log line to tokenize
 * @param theme - Optional theme to use for tokenization
 * @returns A list of tokens
 */
export function tokenize(line: string, theme?: Theme): TokenList {
  try {
    if (shouldUseDefaultToken(theme)) {
      return [createDefaultToken(line)];
    }

    const lexer = createLexer(theme);
    const lexerTokens = lexer.tokenize(line);
    return convertLexerTokens(lexerTokens);
  } catch (error) {
    console.warn("Tokenization failed:", error);
    return [createDefaultToken(line)];
  }
}

export function findPatternByName(
  matchPatterns: unknown,
  name: unknown
): { options?: unknown } | undefined {
  if (!isValidMatchPatternsArray(matchPatterns)) {
    return undefined;
  }

  const pattern = matchPatterns.find(
    (p) => isObject(p) && p.name === name
  );

  return isObject(pattern) ? pattern : undefined;
}

export function findPatternByIndex(
  matchPatterns: unknown,
  index: number
): { options?: unknown } | undefined {
  if (!isValidMatchPatternsArray(matchPatterns)) {
    return undefined;
  }

  const pattern = matchPatterns[index];
  return isObject(pattern) ? pattern : undefined;
}

export function applyWordStyle(
  token: Token,
  theme: Theme
): Token | undefined {
  const metadata = token.metadata;

  if (!metadata || metadata.matchType !== MATCH_TYPE_WORD) {
    return undefined;
  }

  const pattern = metadata.pattern;
  if (typeof pattern !== "string") {
    return undefined;
  }

  const matchWords = theme.schema?.matchWords;
  if (!matchWords) {
    return undefined;
  }

  const wordStyle = matchWords[pattern];
  if (!wordStyle) {
    return undefined;
  }

  return {
    ...token,
    metadata: {
      ...metadata,
      style: wordStyle,
    },
  };
}

export function applyPatternStyleByName(
  token: Token,
  theme: Theme
): Token | undefined {
  const metadata = token.metadata;

  if (!metadata || metadata.matchType !== MATCH_TYPE_REGEX) {
    return undefined;
  }

  const name = (metadata as Record<string, unknown>).name;
  if (!name) {
    return undefined;
  }

  const pattern = findPatternByName(theme.schema?.matchPatterns, name);
  if (!pattern || !pattern.options) {
    return undefined;
  }

  return {
    content: token.content,
    metadata: {
      ...metadata,
      style: pattern.options as unknown,
    } as Token["metadata"],
  };
}

export function applyPatternStyleByIndex(
  token: Token,
  theme: Theme
): Token | undefined {
  const metadata = token.metadata;

  if (!metadata || metadata.matchType !== MATCH_TYPE_REGEX) {
    return undefined;
  }

  const index = (metadata as Record<string, unknown>).index;
  if (typeof index !== "number") {
    return undefined;
  }

  const pattern = findPatternByIndex(theme.schema?.matchPatterns, index);
  if (!pattern || !pattern.options) {
    return undefined;
  }

  return {
    content: token.content,
    metadata: {
      ...metadata,
      style: pattern.options as unknown,
    } as Token["metadata"],
  };
}

export function applyDefaultStyle(token: Token, theme: Theme): Token {
  const defaultStyle = theme.schema?.defaultStyle;

  if (!defaultStyle) {
    return token;
  }

  return {
    ...token,
    metadata: {
      ...token.metadata,
      style: defaultStyle,
    },
  };
}

export function applyTokenStyle(token: Token, theme: Theme): Token {
  if (!token.metadata) {
    return token;
  }

  if (hasStyleMetadata(token)) {
    return token;
  }

  const withWordStyle = applyWordStyle(token, theme);
  if (withWordStyle) {
    return withWordStyle;
  }

  const withPatternNameStyle = applyPatternStyleByName(token, theme);
  if (withPatternNameStyle) {
    return withPatternNameStyle;
  }

  const withPatternIndexStyle = applyPatternStyleByIndex(token, theme);
  if (withPatternIndexStyle) {
    return withPatternIndexStyle;
  }

  return applyDefaultStyle(token, theme);
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

  return tokens.map((token) => applyTokenStyle(token, theme));
}

export default {
  tokenize,
  applyTheme,
  createLexer,
};
