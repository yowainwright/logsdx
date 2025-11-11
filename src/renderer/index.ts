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







export function tokensToClassNames(
  tokens: TokenList,
  options: RenderOptions = {},
): string {
  return tokens
    .map((token) => tokenToClassName(token, options))
    .join(EMPTY_STRING);
}








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






export function highlightLine(line: string): string {
  return `${LINE_HIGHLIGHT_BG}${line}${RESET}`;
}







export function applyColor(text: string, color: string): string {
  const colorDef = getColorDefinition(color);
  if (!colorDef) {
    return text;
  }
  return `${colorDef.ansi}${text}${STYLE_CODES.resetColor}`;
}






export function applyBold(text: string): string {
  return `${STYLE_CODES.bold}${text}${STYLE_CODES.resetBold}`;
}






export function applyItalic(text: string): string {
  return `${STYLE_CODES.italic}${text}${STYLE_CODES.resetItalic}`;
}






export function applyUnderline(text: string): string {
  return `${STYLE_CODES.underline}${text}${STYLE_CODES.resetUnderline}`;
}






export function applyDim(text: string): string {
  return `${STYLE_CODES.dim}${text}${STYLE_CODES.resetDim}`;
}







export function applyBackgroundColor(text: string, color: string): string {
  const colorDef = BACKGROUND_COLORS[color];
  if (!colorDef) {
    return text;
  }
  return `${colorDef.ansi}${text}${STYLE_CODES.resetBackground}`;
}






export function fg256(code: number): string {
  return `\x1b[38;5;${code}m`;
}








export function fgRGB(r: number, g: number, b: number): string {
  return `\x1b[38;2;${r};${g};${b}m`;
}








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
