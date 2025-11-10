import type { TokenList, Token } from "../schema/types";
import type { Theme } from "../types";
import { tokenize, applyTheme } from "../tokenizer";
import {
  BACKGROUND_COLORS,
  STYLE_CODES,
  getColorDefinition,
  supportsColors,
  DEFAULT_THEME_NAME,
  DEFAULT_THEME_COLOR,
  TAB_SIZE,
  NBSP,
  BR,
  EMPTY_STRING,
  LINE_HIGHLIGHT_BG,
  RESET,
  WHITESPACE_MATCH_TYPES,
  TRIMMED_SPACE_MATCH_TYPES,
  CSS_BOLD,
  CSS_ITALIC,
  CSS_UNDERLINE,
  CSS_DIM,
  CLASS_BOLD,
  CLASS_ITALIC,
  CLASS_UNDERLINE,
  CLASS_DIM,
} from "./constants";
import type { RenderOptions, StyleCode, MatchType } from "./types";
import { escapeHtml, hasStyleCode } from "./utils";

const DEFAULT_THEME: Theme = {
  name: DEFAULT_THEME_NAME,
  schema: { defaultStyle: { color: DEFAULT_THEME_COLOR } },
};

export function isWhitespaceToken(token: Token): boolean {
  const matchType = token.metadata?.matchType as MatchType | undefined;
  return Boolean(matchType && WHITESPACE_MATCH_TYPES.has(matchType));
}

export function shouldTrimToken(token: Token): boolean {
  return Boolean(token.metadata?.trimmed);
}

export function handleTrimmedSpaces(token: Token): string {
  const matchType = token.metadata?.matchType;

  if (matchType === "spaces" && token.metadata?.originalLength) {
    return " ";
  }

  if (matchType === "space") {
    return token.content;
  }

  return EMPTY_STRING;
}

export function applyStyleCodes(
  text: string,
  styleCodes: ReadonlyArray<StyleCode> | undefined,
): string {
  let result = text;

  if (hasStyleCode(styleCodes, "bold")) {
    result = applyBold(result);
  }

  if (hasStyleCode(styleCodes, "italic")) {
    result = applyItalic(result);
  }

  if (hasStyleCode(styleCodes, "underline")) {
    result = applyUnderline(result);
  }

  if (hasStyleCode(styleCodes, "dim")) {
    result = applyDim(result);
  }

  return result;
}

export function tokenToString(token: Token, colorSupport: boolean): string {
  if (isWhitespaceToken(token)) {
    if (shouldTrimToken(token)) {
      return handleTrimmedSpaces(token);
    }
    return token.content;
  }

  const style = token.metadata?.style;
  if (!style || !colorSupport) {
    return token.content;
  }

  let result = token.content;

  if (style.color) {
    result = applyColor(result, style.color);
  }

  result = applyStyleCodes(result, style.styleCodes);

  if ("backgroundColor" in style && typeof style.backgroundColor === "string") {
    result = applyBackgroundColor(result, style.backgroundColor);
  }

  return result;
}

/**
 * Convert tokens to a styled string
 * @param tokens - The tokens to convert
 * @param forceColors - Force color output regardless of terminal detection
 * @returns A string with ANSI escape codes for styling
 */
export function tokensToString(
  tokens: TokenList,
  forceColors?: boolean,
): string {
  const colorSupport = forceColors ?? supportsColors();
  return tokens
    .map((token) => tokenToString(token, colorSupport))
    .join(EMPTY_STRING);
}

export function handleWhitespaceHtml(token: Token): string {
  if (shouldTrimToken(token)) {
    const matchType = token.metadata?.matchType as MatchType | undefined;
    if (matchType && TRIMMED_SPACE_MATCH_TYPES.has(matchType)) {
      return NBSP;
    }
    return EMPTY_STRING;
  }

  const matchType = token.metadata?.matchType;

  if (matchType === "tab") {
    return NBSP.repeat(TAB_SIZE * token.content.length);
  }

  if (matchType === "spaces") {
    return NBSP.repeat(token.content.length);
  }

  if (matchType === "space") {
    return NBSP;
  }

  return token.content
    .replace(/ /g, NBSP)
    .replace(/\t/g, NBSP.repeat(TAB_SIZE));
}

export function handleSpecialHtmlTokens(token: Token): string | null {
  const matchType = token.metadata?.matchType;

  if (matchType === "newline") {
    return BR;
  }

  if (matchType === "carriage-return") {
    return EMPTY_STRING;
  }

  return null;
}

export function buildCssStyles(
  style: NonNullable<Token["metadata"]>["style"],
  styleCodes: ReadonlyArray<StyleCode> | undefined,
): ReadonlyArray<string> {
  const css: string[] = [];

  if (style?.color) {
    const colorDef = getColorDefinition(style.color);
    css.push(`color: ${colorDef?.hex || style.color}`);
  }

  if (hasStyleCode(styleCodes, "bold")) {
    css.push(CSS_BOLD);
  }

  if (hasStyleCode(styleCodes, "italic")) {
    css.push(CSS_ITALIC);
  }

  if (hasStyleCode(styleCodes, "underline")) {
    css.push(CSS_UNDERLINE);
  }

  if (hasStyleCode(styleCodes, "dim")) {
    css.push(CSS_DIM);
  }

  return css;
}

export function wrapInSpan(
  content: string,
  styles: ReadonlyArray<string>,
): string {
  if (styles.length === 0) {
    return content;
  }
  return `<span style="${styles.join("; ")}">${content}</span>`;
}

export function tokenToHtml(token: Token, options: RenderOptions): string {
  const specialResult = handleSpecialHtmlTokens(token);
  if (specialResult !== null) {
    return specialResult;
  }

  if (isWhitespaceToken(token)) {
    return handleWhitespaceHtml(token);
  }

  const style = token.metadata?.style;
  const content =
    options.escapeHtml !== false ? escapeHtml(token.content) : token.content;

  if (!style) {
    return content;
  }

  const css = buildCssStyles(style, style.styleCodes);
  return wrapInSpan(content, css);
}

/**
 * Convert tokens to HTML with inline CSS styles
 * @param tokens - The tokens to convert
 * @param options - Render options
 * @returns HTML string with inline CSS styles
 */
export function tokensToHtml(
  tokens: TokenList,
  options: RenderOptions = {},
): string {
  return tokens.map((token) => tokenToHtml(token, options)).join(EMPTY_STRING);
}

export function buildCssClasses(
  style: NonNullable<Token["metadata"]>["style"],
  styleCodes: ReadonlyArray<StyleCode> | undefined,
): ReadonlyArray<string> {
  const classes: string[] = [];

  if (style?.color) {
    const colorDef = getColorDefinition(style.color);
    if (colorDef?.className) {
      classes.push(colorDef.className);
    }
  }

  if (hasStyleCode(styleCodes, "bold")) {
    classes.push(CLASS_BOLD);
  }

  if (hasStyleCode(styleCodes, "italic")) {
    classes.push(CLASS_ITALIC);
  }

  if (hasStyleCode(styleCodes, "underline")) {
    classes.push(CLASS_UNDERLINE);
  }

  if (hasStyleCode(styleCodes, "dim")) {
    classes.push(CLASS_DIM);
  }

  return classes;
}

export function wrapInSpanWithClass(
  content: string,
  classes: ReadonlyArray<string>,
): string {
  if (classes.length === 0) {
    return content;
  }
  return `<span class="${classes.join(" ")}">${content}</span>`;
}

export function tokenToClassName(token: Token, options: RenderOptions): string {
  const specialResult = handleSpecialHtmlTokens(token);
  if (specialResult !== null) {
    return specialResult;
  }

  if (isWhitespaceToken(token)) {
    return handleWhitespaceHtml(token);
  }

  const style = token.metadata?.style;
  const content =
    options.escapeHtml !== false ? escapeHtml(token.content) : token.content;

  if (!style) {
    return content;
  }

  const classes = buildCssClasses(style, style.styleCodes);
  return wrapInSpanWithClass(content, classes);
}

/**
 * Convert tokens to HTML with CSS class names
 * @param tokens - The tokens to convert
 * @param options - Render options
 * @returns HTML with CSS class names for styling
 */
export function tokensToClassNames(
  tokens: TokenList,
  options: RenderOptions = {},
): string {
  return tokens
    .map((token) => tokenToClassName(token, options))
    .join(EMPTY_STRING);
}

/**
 * Render a line with the specified options
 * @param line - The line to render
 * @param theme - The theme to use
 * @param options - Rendering options
 * @returns The rendered line
 */
export function renderLine(
  line: string,
  theme?: Theme,
  options: RenderOptions = {},
): string {
  const tokens = tokenize(line, theme);
  const styledTokens = applyTheme(tokens, theme || DEFAULT_THEME);

  if (options.outputFormat === "html") {
    if (options.htmlStyleFormat === "className") {
      return tokensToClassNames(styledTokens, options);
    }
    return tokensToHtml(styledTokens, options);
  }

  return tokensToString(styledTokens);
}

/**
 * Highlight a line (for line highlighting)
 * @param line - The line to highlight
 * @returns The highlighted line
 */
export function highlightLine(line: string): string {
  return `${LINE_HIGHLIGHT_BG}${line}${RESET}`;
}

/**
 * Apply color to text using ANSI escape codes
 * @param text - The text to color
 * @param color - The color to apply
 * @returns The colored text
 */
export function applyColor(text: string, color: string): string {
  const colorDef = getColorDefinition(color);
  if (!colorDef) {
    return text;
  }
  return `${colorDef.ansi}${text}${STYLE_CODES.resetColor}`;
}

/**
 * Apply bold style to text using ANSI escape codes
 * @param text - The text to style
 * @returns The styled text
 */
export function applyBold(text: string): string {
  return `${STYLE_CODES.bold}${text}${STYLE_CODES.resetBold}`;
}

/**
 * Apply italic style to text using ANSI escape codes
 * @param text - The text to style
 * @returns The styled text
 */
export function applyItalic(text: string): string {
  return `${STYLE_CODES.italic}${text}${STYLE_CODES.resetItalic}`;
}

/**
 * Apply underline style to text using ANSI escape codes
 * @param text - The text to style
 * @returns The styled text
 */
export function applyUnderline(text: string): string {
  return `${STYLE_CODES.underline}${text}${STYLE_CODES.resetUnderline}`;
}

/**
 * Apply dim style to text using ANSI escape codes
 * @param text - The text to style
 * @returns The styled text
 */
export function applyDim(text: string): string {
  return `${STYLE_CODES.dim}${text}${STYLE_CODES.resetDim}`;
}

/**
 * Apply background color to text using ANSI escape codes
 * @param text - The text to color
 * @param color - The color to apply
 * @returns The colored text
 */
export function applyBackgroundColor(text: string, color: string): string {
  const colorDef = BACKGROUND_COLORS[color];
  if (!colorDef) {
    return text;
  }
  return `${colorDef.ansi}${text}${STYLE_CODES.resetBackground}`;
}

/**
 * Creates a 256-color foreground color code
 * @param code Color code (0-255)
 * @returns ANSI color code string
 */
export function fg256(code: number): string {
  return `\x1b[38;5;${code}m`;
}

/**
 * Creates a 24-bit RGB foreground color code
 * @param r Red (0-255)
 * @param g Green (0-255)
 * @param b Blue (0-255)
 * @returns ANSI color code string
 */
export function fgRGB(r: number, g: number, b: number): string {
  return `\x1b[38;2;${r};${g};${b}m`;
}

/**
 * Render multiple lines with the specified options
 * @param lines - The lines to render
 * @param theme - The theme to use
 * @param options - Rendering options
 * @returns The rendered lines
 */
export function renderLines(
  lines: ReadonlyArray<string>,
  theme?: Theme,
  options: RenderOptions = {},
): ReadonlyArray<string> {
  return lines.map((line) => renderLine(line, theme, options));
}

export { renderLightBox, renderLightBoxLine, isLightTheme } from "./lightBox";

export {
  detectBackground,
  detectTerminalBackground,
  detectBrowserBackground,
  detectSystemBackground,
  isDarkBackground,
  isLightBackground,
  getRecommendedThemeMode,
  watchBackgroundChanges,
} from "./detectBackground";

export type { BackgroundInfo, ColorScheme } from "./types";

export default {
  renderLine,
  renderLines,
};
