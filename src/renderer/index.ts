import type { TokenList, Token } from "../schema/types";
import type { Theme } from "../types";
import { tokenize, applyTheme } from "../tokenizer";
import {
  BACKGROUND_COLORS,
  TEXT_COLORS,
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
  CSS_BLINK,
  CSS_REVERSE,
  CSS_STRIKETHROUGH,
  CLASS_BOLD,
  CLASS_ITALIC,
  CLASS_UNDERLINE,
  CLASS_DIM,
  CLASS_BLINK,
  CLASS_REVERSE,
  CLASS_STRIKETHROUGH,
} from "./constants";
import type { ColorDepth, RenderOptions, StyleCode, MatchType } from "./types";
import { escapeHtml, getEnv, hasStyleCode } from "./utils";

const DEFAULT_THEME: Theme = {
  name: DEFAULT_THEME_NAME,
  schema: { defaultStyle: { color: DEFAULT_THEME_COLOR } },
};

type Rgb = readonly [number, number, number];
type ResolvedColorDepth = Exclude<ColorDepth, "auto">;

const ANSI16_COLORS: ReadonlyArray<Rgb> = [
  [0, 0, 0],
  [128, 0, 0],
  [0, 128, 0],
  [128, 128, 0],
  [0, 0, 128],
  [128, 0, 128],
  [0, 128, 128],
  [192, 192, 192],
  [128, 128, 128],
  [255, 0, 0],
  [0, 255, 0],
  [255, 255, 0],
  [0, 0, 255],
  [255, 0, 255],
  [0, 255, 255],
  [255, 255, 255],
] as const;

const STYLE_CLASS_NAMES: ReadonlyArray<readonly [StyleCode, string]> = [
  ["bold", CLASS_BOLD],
  ["italic", CLASS_ITALIC],
  ["underline", CLASS_UNDERLINE],
  ["dim", CLASS_DIM],
  ["blink", CLASS_BLINK],
  ["reverse", CLASS_REVERSE],
  ["strikethrough", CLASS_STRIKETHROUGH],
];

function clampChannel(value: number): number {
  return Math.round(Math.min(255, Math.max(0, value)));
}

function parseHexColor(value: string): Rgb | undefined {
  const hex = value.startsWith("#") ? value.slice(1) : value;
  const expanded = hex.length === 3 ? hex.replace(/(.)/g, "$1$1") : hex;
  if (!/^[\da-f]{6}$/i.test(expanded)) return undefined;
  const rgb: Rgb = [
    parseInt(expanded.slice(0, 2), 16),
    parseInt(expanded.slice(2, 4), 16),
    parseInt(expanded.slice(4, 6), 16),
  ];
  return rgb;
}

function parseRgbChannel(value: string, percentage: string): number {
  const number = Number(value);
  const normalized = percentage ? (number / 100) * 255 : number;
  return clampChannel(normalized);
}

function parseRgbColor(value: string): Rgb | undefined {
  const match =
    /^rgba?\(\s*([\d.]+)(%?)\s*,\s*([\d.]+)(%?)\s*,\s*([\d.]+)(%?)/i.exec(
      value,
    );
  if (!match) return undefined;
  const rgb: Rgb = [
    parseRgbChannel(match[1], match[2]),
    parseRgbChannel(match[3], match[4]),
    parseRgbChannel(match[5], match[6]),
  ];
  return rgb;
}

function hueToRgb(p: number, q: number, hue: number): number {
  let normalized = hue;
  if (hue < 0) normalized += 1;
  if (hue > 1) normalized -= 1;
  if (normalized < 1 / 6) {
    const result = p + (q - p) * 6 * normalized;
    return result;
  }
  if (normalized < 1 / 2) return q;
  if (normalized < 2 / 3) {
    const result = p + (q - p) * (2 / 3 - normalized) * 6;
    return result;
  }
  return p;
}

function parseHslColor(value: string): Rgb | undefined {
  const match =
    /^hsla?\(\s*([\d.-]+)(?:deg)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/i.exec(value);
  if (!match) return undefined;
  const hue = ((((Number(match[1]) % 360) + 360) % 360) / 360) as number;
  const saturation = Number(match[2]) / 100;
  const lightness = Number(match[3]) / 100;
  if (saturation === 0) {
    const channel = clampChannel(lightness * 255);
    return [channel, channel, channel];
  }
  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  return [
    clampChannel(hueToRgb(p, q, hue + 1 / 3) * 255),
    clampChannel(hueToRgb(p, q, hue) * 255),
    clampChannel(hueToRgb(p, q, hue - 1 / 3) * 255),
  ];
}

function resolveColorReference(color: string, theme?: Theme): string {
  return theme?.colors?.[color] || color;
}

function colorToRgb(color: string, theme?: Theme): Rgb | undefined {
  const resolved = resolveColorReference(color, theme);
  const definition = getColorDefinition(resolved, theme);
  const definedColor = definition?.hex || resolved;
  const rgb =
    parseHexColor(definedColor) ||
    parseRgbColor(resolved) ||
    parseHslColor(resolved);
  return rgb;
}

function colorDistance(left: Rgb, right: Rgb): number {
  return left.reduce(
    (distance, channel, index) => distance + (channel - right[index]) ** 2,
    0,
  );
}

function rgbToAnsi16(rgb: Rgb): number {
  const closest = ANSI16_COLORS.reduce(
    (result, color, index) => {
      const distance = colorDistance(rgb, color);
      const nextResult =
        distance < result.distance ? { distance, index } : result;
      return nextResult;
    },
    { distance: Number.POSITIVE_INFINITY, index: 0 },
  );
  return closest.index;
}

function rgbToAnsi256(rgb: Rgb): number {
  const [red, green, blue] = rgb;
  const sameChannels = red === green && green === blue;
  const isVeryDark = sameChannels && red < 8;
  const isVeryLight = sameChannels && red > 248;
  if (isVeryDark) return 16;
  if (isVeryLight) return 231;
  if (sameChannels) {
    const grayscaleCode = Math.round(((red - 8) / 247) * 24) + 232;
    return grayscaleCode;
  }
  const channels = rgb.map((channel) => Math.round((channel / 255) * 5));
  const colorCode = 16 + 36 * channels[0] + 6 * channels[1] + channels[2];
  return colorCode;
}

function ansi16Code(rgb: Rgb, background: boolean): string {
  const index = rgbToAnsi16(rgb);
  const regularBase = background ? 40 : 30;
  const brightBase = background ? 100 : 90;
  const base = index < 8 ? regularBase : brightBase;
  const code = base + (index % 8);
  return `\x1b[${code}m`;
}

function ansiColorCode(
  color: string,
  depth: ResolvedColorDepth,
  background: boolean,
  theme?: Theme,
): string | undefined {
  if (depth === "none") return undefined;
  const resolved = resolveColorReference(color, theme);
  const definition = background
    ? BACKGROUND_COLORS[resolved] || getColorDefinition(resolved, theme)
    : getColorDefinition(resolved, theme);
  const rgb = colorToRgb(resolved, theme);
  const hasNamedColor = background
    ? Boolean(BACKGROUND_COLORS[resolved])
    : Boolean(TEXT_COLORS[resolved]);
  if (depth === "16") {
    if (hasNamedColor) return definition?.ansi;
    return rgb ? ansi16Code(rgb, background) : definition?.ansi;
  }
  if (!rgb) return definition?.ansi;
  if (depth === "256") {
    const code = rgbToAnsi256(rgb);
    return `\x1b[${background ? 48 : 38};5;${code}m`;
  }
  return `\x1b[${background ? 48 : 38};2;${rgb.join(";")}m`;
}

function detectColorDepth(): ResolvedColorDepth {
  if (!supportsColors()) return "none";
  const colorTerm = (getEnv("COLORTERM") || "").toLowerCase();
  const isTrueColor = colorTerm === "truecolor" || colorTerm === "24bit";
  if (isTrueColor) return "truecolor";
  const has256Colors = (getEnv("TERM") || "").includes("256");
  if (has256Colors) return "256";
  return "16";
}

export function resolveColorDepth(
  requested: ColorDepth = "auto",
  forceColors?: boolean,
): ResolvedColorDepth {
  const colorsDisabled = forceColors !== undefined && !forceColors;
  if (colorsDisabled) return "none";
  if (requested !== "auto") return requested;
  const colorsForced = forceColors ?? false;
  if (colorsForced) return "truecolor";
  return detectColorDepth();
}

export function isWhitespaceToken(token: Token): boolean {
  const matchType = token.metadata?.matchType as MatchType | undefined;
  return Boolean(matchType && WHITESPACE_MATCH_TYPES.has(matchType));
}

export function shouldTrimToken(token: Token): boolean {
  return Boolean(token.metadata?.trimmed);
}

export function handleTrimmedSpaces(token: Token): string {
  const matchType = token.metadata?.matchType;
  const hasOriginalLength = Boolean(token.metadata?.originalLength);
  const isTrimmedSpaces = matchType === "spaces" && hasOriginalLength;

  if (isTrimmedSpaces) {
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

  if (hasStyleCode(styleCodes, "blink")) {
    result = applyBlink(result);
  }

  if (hasStyleCode(styleCodes, "reverse")) {
    result = applyReverse(result);
  }

  if (hasStyleCode(styleCodes, "strikethrough")) {
    result = applyStrikethrough(result);
  }

  return result;
}

export function tokenToString(
  token: Token,
  colorSupport: boolean,
  colorDepth?: ResolvedColorDepth,
  theme?: Theme,
): string {
  if (isWhitespaceToken(token)) {
    if (shouldTrimToken(token)) {
      return handleTrimmedSpaces(token);
    }
    return token.content;
  }

  const style = token.metadata?.style;
  if (!style) return token.content;
  if (!colorSupport) return token.content;

  let result = token.content;

  if (style.color) {
    result = applyColor(result, style.color, colorDepth, theme);
  }

  result = applyStyleCodes(result, style.styleCodes);

  if (!("backgroundColor" in style)) return result;
  const { backgroundColor } = style;
  if (typeof backgroundColor !== "string") return result;
  result = applyBackgroundColor(result, backgroundColor, colorDepth, theme);

  return result;
}

export function tokensToString(
  tokens: TokenList,
  forceColors?: boolean,
  colorDepth?: ColorDepth,
  theme?: Theme,
): string {
  const resolvedDepth =
    colorDepth === undefined
      ? undefined
      : resolveColorDepth(colorDepth, forceColors);
  const hasResolvedDepth = resolvedDepth !== undefined;
  let colorSupport = forceColors ?? supportsColors();
  if (hasResolvedDepth) {
    colorSupport = resolvedDepth !== "none";
  }
  return tokens
    .map((token) => tokenToString(token, colorSupport, resolvedDepth, theme))
    .join(EMPTY_STRING);
}

export function handleWhitespaceHtml(token: Token): string {
  if (shouldTrimToken(token)) {
    const matchType = token.metadata?.matchType as MatchType | undefined;
    const isTrimmedSpace =
      matchType !== undefined && TRIMMED_SPACE_MATCH_TYPES.has(matchType);
    if (isTrimmedSpace) {
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
  theme?: Theme,
): ReadonlyArray<string> {
  const css: string[] = [];

  if (style?.color) {
    const color = resolveColorReference(style.color, theme);
    const colorDef = getColorDefinition(color, theme);
    css.push(`color: ${colorDef?.hex || color}`);
  }

  if (style?.backgroundColor) {
    const background = resolveColorReference(style.backgroundColor, theme);
    const colorDef =
      BACKGROUND_COLORS[background] || getColorDefinition(background, theme);
    css.push(`background-color: ${colorDef?.hex || background}`);
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

  if (hasStyleCode(styleCodes, "blink")) {
    css.push(CSS_BLINK);
  }

  if (hasStyleCode(styleCodes, "reverse")) {
    css.push(CSS_REVERSE);
  }

  if (hasStyleCode(styleCodes, "strikethrough")) {
    css.push(CSS_STRIKETHROUGH);
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
  const shouldEscapeHtml = options.escapeHtml ?? true;
  const content = shouldEscapeHtml ? escapeHtml(token.content) : token.content;

  if (!style) {
    return content;
  }

  const css = buildCssStyles(style, style.styleCodes, options.theme);
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
  theme?: Theme,
): ReadonlyArray<string> {
  const classes: string[] = [];

  if (style?.color) {
    const color = resolveColorReference(style.color, theme);
    const colorDef = getColorDefinition(color, theme);
    if (colorDef?.className) {
      classes.push(colorDef.className);
    }
  }

  if (style?.backgroundColor) {
    const background = resolveColorReference(style.backgroundColor, theme);
    const colorDef = BACKGROUND_COLORS[background];
    if (colorDef?.className) classes.push(colorDef.className);
  }

  const styleClasses = STYLE_CLASS_NAMES.filter(([styleCode]) =>
    hasStyleCode(styleCodes, styleCode),
  ).map(([, className]) => className);
  classes.push(...styleClasses);

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
  const shouldEscapeHtml = options.escapeHtml ?? true;
  const content = shouldEscapeHtml ? escapeHtml(token.content) : token.content;

  if (!style) {
    return content;
  }

  const classes = buildCssClasses(style, style.styleCodes, options.theme);
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

export function styleLine(line: string, theme?: Theme): TokenList {
  const activeTheme = theme || DEFAULT_THEME;
  const tokens = tokenize(line, theme);
  return applyTheme(tokens, activeTheme);
}

export function renderAnsi(line: string, options: RenderOptions = {}): string {
  const colorDepth = resolveColorDepth(options.colorDepth, options.forceColors);
  return tokensToString(
    styleLine(line, options.theme),
    colorDepth !== "none",
    colorDepth,
    options.theme,
  );
}

export function renderHtml(line: string, options: RenderOptions = {}): string {
  const styledTokens = styleLine(line, options.theme);
  if (options.htmlStyleFormat === "className") {
    return tokensToClassNames(styledTokens, options);
  }
  return tokensToHtml(styledTokens, options);
}

export function renderLine(
  line: string,
  theme?: Theme,
  options: RenderOptions = {},
): string {
  const renderOptions = { ...options, theme: theme || options.theme };

  if (renderOptions.outputFormat === "html") {
    return renderHtml(line, renderOptions);
  }

  return renderAnsi(line, renderOptions);
}

export function highlightLine(line: string): string {
  return `${LINE_HIGHLIGHT_BG}${line}${RESET}`;
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

export function applyBlink(text: string): string {
  return `${STYLE_CODES.blink}${text}${STYLE_CODES.resetBlink}`;
}

export function applyReverse(text: string): string {
  return `${STYLE_CODES.inverse}${text}${STYLE_CODES.resetInverse}`;
}

export function applyStrikethrough(text: string): string {
  return `${STYLE_CODES.strikethrough}${text}${STYLE_CODES.resetStrikethrough}`;
}

export function applyColor(
  text: string,
  color: string,
  colorDepth?: ResolvedColorDepth,
  theme?: Theme,
): string {
  const resolved = resolveColorReference(color, theme);
  const ansi =
    colorDepth === undefined
      ? getColorDefinition(resolved, theme)?.ansi
      : ansiColorCode(resolved, colorDepth, false, theme);
  if (!ansi) return text;
  return `${ansi}${text}${STYLE_CODES.resetColor}`;
}

export function applyBackgroundColor(
  text: string,
  color: string,
  colorDepth?: ResolvedColorDepth,
  theme?: Theme,
): string {
  const resolved = resolveColorReference(color, theme);
  let ansi: string | undefined;
  if (colorDepth === undefined) {
    const namedAnsi = BACKGROUND_COLORS[resolved]?.ansi;
    ansi = namedAnsi || ansiColorCode(resolved, "truecolor", true, theme);
  } else {
    ansi = ansiColorCode(resolved, colorDepth, true, theme);
  }
  if (!ansi) return text;
  return `${ansi}${text}${STYLE_CODES.resetBackground}`;
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

export {
  renderLightBox,
  renderLightBoxLine,
  isLightTheme,
  detectBackground,
  detectTerminalBackground,
  detectBrowserBackground,
  detectSystemBackground,
  isDarkBackground,
  isLightBackground,
  getRecommendedThemeMode,
  watchBackgroundChanges,
} from "./utils";

export type { BackgroundInfo, ColorScheme } from "./types";

export default {
  renderAnsi,
  renderHtml,
  renderLine,
  renderLines,
};
