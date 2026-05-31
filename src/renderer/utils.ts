import { stripAnsi as stripAnsiLib } from "../utils/stripAnsi";
import type { Theme } from "../types";
import type {
  StyleCode,
  BackgroundInfo,
  ColorScheme,
  ConfidenceLevel,
  LightBoxOptions,
  BorderChars,
  BorderStyle,
} from "./types";
import {
  HEX_COLOR_PATTERN,
  DARK_TERMINALS,
  LIGHT_TERMINALS,
  DEFAULT_DARK_BACKGROUND,
  DEFAULT_AUTO_BACKGROUND,
  CONFIDENCE_ORDER,
  FAST_MODE_COLORS,
  FAST_LOG_LEVELS,
  FAST_LOG_LEVEL_HTML_COLORS,
  FAST_REGEX,
  LIGHTBOX_BORDERS,
  LIGHTBOX_THEME_BACKGROUNDS,
  LIGHTBOX_DEFAULT_BACKGROUND,
  LIGHTBOX_DEFAULT_WIDTH,
  LIGHTBOX_DEFAULT_PADDING,
  LIGHTBOX_DEFAULT_BORDER,
  LIGHTBOX_DEFAULT_BORDER_STYLE,
  RESET,
} from "./constants";

export function escapeHtml(text: string): string {
  const replacements: ReadonlyArray<readonly [RegExp, string]> = [
    [/&/g, "&amp;"],
    [/</g, "&lt;"],
    [/>/g, "&gt;"],
    [/"/g, "&quot;"],
    [/'/g, "&#039;"],
  ] as const;

  return replacements.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    text,
  );
}

export function hexToRgb(hex: string): readonly [number, number, number] {
  const DEFAULT_RGB: readonly [number, number, number] = [0, 0, 0] as const;
  const result = HEX_COLOR_PATTERN.exec(hex);

  if (!result) {
    return DEFAULT_RGB;
  }

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] as const;
}

export const stripAnsi = stripAnsiLib;

export function hasStyleCode(
  styleCodes: ReadonlyArray<StyleCode> | undefined,
  code: StyleCode,
): boolean {
  if (!styleCodes) {
    return false;
  }
  return styleCodes.includes(code);
}

export function parseColorFgBg(colorFgBg: string): number | undefined {
  const parts = colorFgBg.split(";");

  if (parts.length < 2) {
    return undefined;
  }

  const bgColor = parseInt(parts[1], 10);

  return isNaN(bgColor) ? undefined : bgColor;
}

export function isLightBgColor(bgColor: number): boolean {
  const LIGHT_BG_COLORS: ReadonlyArray<number> = [7, 15];
  return LIGHT_BG_COLORS.includes(bgColor);
}

export function repeatString(str: string, count: number): string {
  return str.repeat(Math.max(0, count));
}

export function calculateCenterPadding(
  totalWidth: number,
  textLength: number,
): readonly [number, number] {
  const remainingSpace = Math.max(0, totalWidth - textLength);
  const leftPadding = Math.floor(remainingSpace / 2);
  const rightPadding = remainingSpace - leftPadding;

  return [leftPadding, rightPadding] as const;
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function hasMatchMedia(): boolean {
  return isBrowser() && typeof window.matchMedia === "function";
}

export function getEnv(key: string): string | undefined {
  const hasProcess = typeof process !== "undefined" && process.env;
  return hasProcess ? process.env[key] : undefined;
}

export function getPlatform(): string | undefined {
  const hasProcess = typeof process !== "undefined";
  return hasProcess ? process.platform : undefined;
}

function createBackgroundInfo(
  scheme: ColorScheme,
  confidence: ConfidenceLevel,
  source: BackgroundInfo["source"],
  details?: BackgroundInfo["details"],
): BackgroundInfo {
  return { scheme, confidence, source, ...(details && { details }) } as const;
}

function getSchemeFromBgColor(bgColor: number): ColorScheme {
  if (isLightBgColor(bgColor)) return "light";
  return "dark";
}

function detectFromColorFgBg(): BackgroundInfo | undefined {
  const colorFgBg = getEnv("COLORFGBG");
  if (!colorFgBg) return undefined;

  const bgColor = parseColorFgBg(colorFgBg);
  if (bgColor === undefined) return undefined;

  const scheme = getSchemeFromBgColor(bgColor);
  return createBackgroundInfo(scheme, "high", "terminal", { colorFgBg });
}

function detectFromTermProgram(): BackgroundInfo | undefined {
  const termProgram = getEnv("TERM_PROGRAM");
  if (!termProgram) return undefined;

  if (DARK_TERMINALS.includes(termProgram)) {
    return createBackgroundInfo("dark", "medium", "terminal", { termProgram });
  }
  if (LIGHT_TERMINALS.includes(termProgram)) {
    return createBackgroundInfo("light", "medium", "terminal", { termProgram });
  }
  return undefined;
}

function isVSCode(): boolean {
  const hasVscodePid = Boolean(getEnv("VSCODE_PID"));
  const versionStr = getEnv("TERM_PROGRAM_VERSION") || "";
  return hasVscodePid || versionStr.includes("vscode");
}

function detectFromVSCode(): BackgroundInfo | undefined {
  if (!isVSCode()) return undefined;
  return createBackgroundInfo("auto", "low", "terminal", {
    termProgram: "vscode",
  });
}

export function detectTerminalBackground(): BackgroundInfo {
  const fromColorFgBg = detectFromColorFgBg();
  if (fromColorFgBg) return fromColorFgBg;

  const fromTermProgram = detectFromTermProgram();
  if (fromTermProgram) return fromTermProgram;

  const fromVSCode = detectFromVSCode();
  if (fromVSCode) return fromVSCode;

  return DEFAULT_DARK_BACKGROUND;
}

function matchesColorScheme(scheme: "dark" | "light"): boolean {
  if (!hasMatchMedia()) {
    return false;
  }

  const query = window.matchMedia(`(prefers-color-scheme: ${scheme})`);
  return query.matches;
}

function createDarkBrowserBackground(): BackgroundInfo {
  return createBackgroundInfo("dark", "high", "browser", {
    mediaQuery: true,
    systemPreference: "dark",
  });
}

function createLightBrowserBackground(): BackgroundInfo {
  return createBackgroundInfo("light", "high", "browser", {
    mediaQuery: true,
    systemPreference: "light",
  });
}

function createAutoBrowserBackground(): BackgroundInfo {
  return createBackgroundInfo("auto", "medium", "browser", {
    mediaQuery: false,
  });
}

export function detectBrowserBackground(): BackgroundInfo {
  if (!hasMatchMedia()) {
    return DEFAULT_AUTO_BACKGROUND;
  }

  if (matchesColorScheme("dark")) {
    return createDarkBrowserBackground();
  }

  if (matchesColorScheme("light")) {
    return createLightBrowserBackground();
  }

  return createAutoBrowserBackground();
}

function getSchemeFromAppleInterface(appleInterfaceStyle: string): ColorScheme {
  if (appleInterfaceStyle.toLowerCase() === "dark") return "dark";
  return "light";
}

function detectFromMacOS(): BackgroundInfo | undefined {
  if (getPlatform() !== "darwin") return undefined;

  const appleInterfaceStyle = getEnv("APPLE_INTERFACE_STYLE");
  if (!appleInterfaceStyle) return undefined;

  const scheme = getSchemeFromAppleInterface(appleInterfaceStyle);
  return createBackgroundInfo(scheme, "high", "system", {
    systemPreference: appleInterfaceStyle,
  });
}

function detectFromWindows(): BackgroundInfo | undefined {
  if (getPlatform() !== "win32") return undefined;
  return createBackgroundInfo("auto", "low", "system");
}

function detectFromLinux(): BackgroundInfo | undefined {
  const desktopSession = getEnv("DESKTOP_SESSION");
  const xdgCurrentDesktop = getEnv("XDG_CURRENT_DESKTOP");

  if (!desktopSession && !xdgCurrentDesktop) return undefined;
  return createBackgroundInfo("auto", "medium", "system", {
    systemPreference: desktopSession || xdgCurrentDesktop,
  });
}

export function detectSystemBackground(): BackgroundInfo {
  const fromMacOS = detectFromMacOS();
  if (fromMacOS) return fromMacOS;

  const fromWindows = detectFromWindows();
  if (fromWindows) return fromWindows;

  const fromLinux = detectFromLinux();
  if (fromLinux) return fromLinux;

  return DEFAULT_AUTO_BACKGROUND;
}

function hasHigherConfidence(a: ConfidenceLevel, b: ConfidenceLevel): boolean {
  return CONFIDENCE_ORDER[a] >= CONFIDENCE_ORDER[b];
}

function selectBestBackground(
  terminalInfo: BackgroundInfo,
  systemInfo: BackgroundInfo,
): BackgroundInfo {
  const terminalIsHigher = hasHigherConfidence(
    terminalInfo.confidence,
    systemInfo.confidence,
  );
  if (terminalIsHigher) {
    return terminalInfo;
  }
  return systemInfo;
}

function isTerminalReliable(info: BackgroundInfo): boolean {
  return info.confidence === "high" || info.confidence === "medium";
}

function tryBrowserBackground(): BackgroundInfo | undefined {
  if (!isBrowser()) return undefined;
  const browserInfo = detectBrowserBackground();
  if (browserInfo.confidence === "high") return browserInfo;
  return undefined;
}

export function detectBackground(): BackgroundInfo {
  const browserResult = tryBrowserBackground();
  if (browserResult) return browserResult;

  const terminalInfo = detectTerminalBackground();
  if (isTerminalReliable(terminalInfo)) return terminalInfo;

  const systemInfo = detectSystemBackground();
  if (systemInfo.confidence === "high") return systemInfo;

  return selectBestBackground(terminalInfo, systemInfo);
}

export function isDarkBackground(): boolean {
  const info = detectBackground();
  const isDefaultAuto = info.scheme === "auto" && info.source === "default";

  return info.scheme === "dark" || isDefaultAuto;
}

export function isLightBackground(): boolean {
  const info = detectBackground();
  return info.scheme === "light";
}

export function getRecommendedThemeMode(): "light" | "dark" {
  if (isDarkBackground()) {
    return "dark";
  }
  return "light";
}

function addModernListeners(
  darkModeQuery: MediaQueryList,
  lightModeQuery: MediaQueryList,
  handleChange: () => void,
): () => void {
  darkModeQuery.addEventListener("change", handleChange);
  lightModeQuery.addEventListener("change", handleChange);

  return () => {
    darkModeQuery.removeEventListener("change", handleChange);
    lightModeQuery.removeEventListener("change", handleChange);
  };
}

function addLegacyListeners(
  darkModeQuery: MediaQueryList,
  lightModeQuery: MediaQueryList,
  handleChange: () => void,
): () => void {
  darkModeQuery.addListener(handleChange);
  lightModeQuery.addListener(handleChange);

  return () => {
    darkModeQuery.removeListener(handleChange);
    lightModeQuery.removeListener(handleChange);
  };
}

function getMediaQueries(): { dark: MediaQueryList; light: MediaQueryList } {
  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  const light = window.matchMedia("(prefers-color-scheme: light)");
  return { dark, light };
}

function setupMediaQueryListeners(
  callback: (info: BackgroundInfo) => void,
): () => void {
  if (!hasMatchMedia()) return () => {};

  const queries = getMediaQueries();
  const handleChange = (): void => callback(detectBrowserBackground());
  const darkQuery = queries.dark as MediaQueryList & {
    addEventListener?: MediaQueryList["addEventListener"];
    addListener?: MediaQueryList["addListener"];
  };

  if (typeof darkQuery.addEventListener === "function") {
    return addModernListeners(queries.dark, queries.light, handleChange);
  }
  if (typeof darkQuery.addListener === "function") {
    return addLegacyListeners(queries.dark, queries.light, handleChange);
  }
  return () => {};
}

export function watchBackgroundChanges(
  callback: (info: BackgroundInfo) => void,
): () => void {
  return setupMediaQueryListeners(callback);
}

export function processFast(line: string): string {
  return line.replace(FAST_REGEX, (match) => {
    const level = match.toUpperCase() as keyof typeof FAST_LOG_LEVELS;
    const color = FAST_LOG_LEVELS[level];
    if (!color) return match;
    return `${color}${match}${FAST_MODE_COLORS.reset}`;
  });
}

export function processFastHtml(line: string): string {
  return line.replace(FAST_REGEX, (match) => {
    const level = match.toUpperCase() as keyof typeof FAST_LOG_LEVELS;
    const color = FAST_LOG_LEVEL_HTML_COLORS[level];
    if (!color) return match;
    return `<span style="color:${color};font-weight:bold">${match}</span>`;
  });
}

export function isFastModeEnabled(options?: { fast?: boolean }): boolean {
  return options?.fast === true;
}

function getThemeName(theme: Theme | string): string {
  if (typeof theme === "string") return theme;
  return theme.name;
}

export function getThemeBackground(theme: Theme | string): string {
  const themeName = getThemeName(theme);
  return LIGHTBOX_THEME_BACKGROUNDS[themeName] || LIGHTBOX_DEFAULT_BACKGROUND;
}

function getBorderChars(borderStyle: BorderStyle): BorderChars {
  return LIGHTBOX_BORDERS[borderStyle];
}

function createTopBorderNoTitle(
  width: number,
  borderChars: BorderChars,
): string {
  const middle = repeatString(borderChars.horizontal, width - 2);
  return borderChars.topLeft + middle + borderChars.topRight;
}

function createTopBorderWithTitle(
  width: number,
  borderChars: BorderChars,
  title: string,
): string {
  const paddedTitle = ` ${title} `;
  const [leftPad, rightPad] = calculateCenterPadding(
    width - 2,
    paddedTitle.length,
  );
  const left = repeatString(borderChars.horizontal, leftPad);
  const right = repeatString(borderChars.horizontal, rightPad);
  return (
    borderChars.topLeft + left + paddedTitle + right + borderChars.topRight
  );
}

function createTopBorder(
  width: number,
  borderChars: BorderChars,
  title?: string,
): string {
  if (!title) return createTopBorderNoTitle(width, borderChars);
  return createTopBorderWithTitle(width, borderChars, title);
}

function createBottomBorder(width: number, borderChars: BorderChars): string {
  const middle = repeatString(borderChars.horizontal, width - 2);
  return borderChars.bottomLeft + middle + borderChars.bottomRight;
}

function getBorderWidth(hasBorder: boolean): number {
  if (hasBorder) return 2;
  return 0;
}

function calculateContentWidth(
  width: number,
  hasBorder: boolean,
  padding: number,
): number {
  const borderWidth = getBorderWidth(hasBorder);
  const paddingWidth = padding * 2;
  return width - borderWidth - paddingWidth;
}

function createPaddedLine(
  line: string,
  contentWidth: number,
  padding: number,
  backgroundColor: string,
  borderChar?: string,
): string {
  const lineLength = stripAnsi(line).length;
  const rightPad = Math.max(0, contentWidth - lineLength);
  const padStr = repeatString(" ", padding);
  const rightPadStr = repeatString(" ", rightPad);
  const content = `${padStr}${line}${rightPadStr}${padStr}`;

  if (!borderChar) return `${backgroundColor}${content}${RESET}`;
  return `${borderChar}${backgroundColor}${content}${RESET}${borderChar}`;
}

function getBorderChar(
  hasBorder: boolean,
  borderChars: BorderChars,
): string | undefined {
  if (!hasBorder) return undefined;
  return borderChars.vertical;
}

export function renderLightBoxLine(
  line: string,
  theme: Theme | string,
  options: LightBoxOptions = {},
): string {
  const width = options.width ?? LIGHTBOX_DEFAULT_WIDTH;
  const padding = options.padding ?? LIGHTBOX_DEFAULT_PADDING;
  const border = options.border ?? LIGHTBOX_DEFAULT_BORDER;
  const borderStyle = options.borderStyle ?? LIGHTBOX_DEFAULT_BORDER_STYLE;
  const backgroundColor = options.backgroundColor ?? getThemeBackground(theme);

  const borderChars = getBorderChars(borderStyle);
  const contentWidth = calculateContentWidth(width, border, padding);
  const borderChar = getBorderChar(border, borderChars);

  return createPaddedLine(
    line,
    contentWidth,
    padding,
    backgroundColor,
    borderChar,
  );
}

function renderContentLines(
  lines: ReadonlyArray<string>,
  theme: Theme | string,
  options: LightBoxOptions,
): string[] {
  return lines.map((line) => renderLightBoxLine(line, theme, options));
}

function getLightBoxOptions(options: LightBoxOptions): {
  width: number;
  border: boolean;
  borderStyle: BorderStyle;
} {
  return {
    width: options.width ?? LIGHTBOX_DEFAULT_WIDTH,
    border: options.border ?? LIGHTBOX_DEFAULT_BORDER,
    borderStyle: options.borderStyle ?? LIGHTBOX_DEFAULT_BORDER_STYLE,
  };
}

export function renderLightBox(
  lines: ReadonlyArray<string>,
  theme: Theme | string,
  title?: string,
  options: LightBoxOptions = {},
): ReadonlyArray<string> {
  const opts = getLightBoxOptions(options);
  const borderChars = getBorderChars(opts.borderStyle);
  const contentLines = renderContentLines(lines, theme, options);

  if (!opts.border) return contentLines;

  const top = createTopBorder(opts.width, borderChars, title);
  const bottom = createBottomBorder(opts.width, borderChars);
  return [top, ...contentLines, bottom];
}

export function isLightTheme(theme: Theme | string): boolean {
  if (typeof theme === "object" && theme.mode) {
    return theme.mode === "light";
  }

  const themeName = getThemeName(theme);
  const lowerName = themeName.toLowerCase();
  const hasLightInName =
    lowerName.includes("light") || lowerName.includes("white");

  return hasLightInName;
}

export function isTerminalDark(): boolean {
  return isDarkBackground();
}
