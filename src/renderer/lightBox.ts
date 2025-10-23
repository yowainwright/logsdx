import type { Theme } from "../types";
import type { LightBoxOptions, BorderChars, BorderStyle } from "./types";
import { stripAnsi, repeatString, calculateCenterPadding } from "./utils";
import { isDarkBackground } from "./detectBackground";

const BORDERS: Readonly<Record<BorderStyle, BorderChars>> = {
  rounded: {
    topLeft: "╭",
    topRight: "╮",
    bottomLeft: "╰",
    bottomRight: "╯",
    horizontal: "─",
    vertical: "│",
  },
  square: {
    topLeft: "┌",
    topRight: "┐",
    bottomLeft: "└",
    bottomRight: "┘",
    horizontal: "─",
    vertical: "│",
  },
  double: {
    topLeft: "╔",
    topRight: "╗",
    bottomLeft: "╚",
    bottomRight: "╝",
    horizontal: "═",
    vertical: "║",
  },
  simple: {
    topLeft: "+",
    topRight: "+",
    bottomLeft: "+",
    bottomRight: "+",
    horizontal: "-",
    vertical: "|",
  },
} as const;

const THEME_BACKGROUNDS: Readonly<Record<string, string>> = {
  "github-light": "\x1b[48;2;255;255;255m",
  "solarized-light": "\x1b[48;2;253;246;227m",
  "one-light": "\x1b[48;2;250;250;250m",
  "atom-one-light": "\x1b[48;2;250;250;250m",
} as const;

const DEFAULT_BACKGROUND = "\x1b[48;5;255m";
const RESET = "\x1b[0m";
const DEFAULT_WIDTH = 80;
const DEFAULT_PADDING = 2;
const DEFAULT_BORDER = true;
const DEFAULT_BORDER_STYLE: BorderStyle = "rounded";

/**
 * Get the background color for a theme
 * @param theme - Theme object or theme name string
 * @returns ANSI background color code
 */
export function getThemeBackground(theme: Theme | string): string {
  const themeName = typeof theme === "string" ? theme : theme.name;
  return THEME_BACKGROUNDS[themeName] || DEFAULT_BACKGROUND;
}

function getBorderChars(borderStyle: BorderStyle): BorderChars {
  return BORDERS[borderStyle];
}

function createTopBorder(
  width: number,
  borderChars: BorderChars,
  title?: string,
): string {
  if (!title) {
    return (
      borderChars.topLeft +
      repeatString(borderChars.horizontal, width - 2) +
      borderChars.topRight
    );
  }

  const paddedTitle = ` ${title} `;
  const [leftPadding, rightPadding] = calculateCenterPadding(
    width - 2,
    paddedTitle.length,
  );

  return (
    borderChars.topLeft +
    repeatString(borderChars.horizontal, leftPadding) +
    paddedTitle +
    repeatString(borderChars.horizontal, rightPadding) +
    borderChars.topRight
  );
}

function createBottomBorder(width: number, borderChars: BorderChars): string {
  return (
    borderChars.bottomLeft +
    repeatString(borderChars.horizontal, width - 2) +
    borderChars.bottomRight
  );
}

function calculateContentWidth(
  width: number,
  hasBorder: boolean,
  padding: number,
): number {
  const borderWidth = hasBorder ? 2 : 0;
  return width - borderWidth - padding * 2;
}

function createPaddedLine(
  line: string,
  contentWidth: number,
  padding: number,
  backgroundColor: string,
  borderChar?: string,
): string {
  const lineLength = stripAnsi(line).length;
  const rightPadding = Math.max(0, contentWidth - lineLength);
  const paddingStr = repeatString(" ", padding);
  const rightPaddingStr = repeatString(" ", rightPadding);

  const content = `${paddingStr}${line}${rightPaddingStr}${paddingStr}`;

  if (borderChar) {
    return `${borderChar}${backgroundColor}${content}${RESET}${borderChar}`;
  }

  return `${backgroundColor}${content}${RESET}`;
}

/**
 * Render a line in a light box
 * @param line - The line to render
 * @param theme - Theme object or theme name string
 * @param options - Light box rendering options
 * @returns Rendered line string
 */
export function renderLightBoxLine(
  line: string,
  theme: Theme | string,
  options: LightBoxOptions = {},
): string {
  const width = options.width ?? DEFAULT_WIDTH;
  const padding = options.padding ?? DEFAULT_PADDING;
  const border = options.border ?? DEFAULT_BORDER;
  const borderStyle = options.borderStyle ?? DEFAULT_BORDER_STYLE;
  const backgroundColor = options.backgroundColor ?? getThemeBackground(theme);

  const borderChars = getBorderChars(borderStyle);
  const contentWidth = calculateContentWidth(width, border, padding);
  const borderChar = border ? borderChars.vertical : undefined;

  return createPaddedLine(
    line,
    contentWidth,
    padding,
    backgroundColor,
    borderChar,
  );
}

/**
 * Render a complete light box with multiple lines
 * @param lines - Array of lines to render
 * @param theme - Theme object or theme name string
 * @param title - Optional title for the box
 * @param options - Light box rendering options
 * @returns Array of rendered line strings
 */
export function renderLightBox(
  lines: ReadonlyArray<string>,
  theme: Theme | string,
  title?: string,
  options: LightBoxOptions = {},
): ReadonlyArray<string> {
  const width = options.width ?? DEFAULT_WIDTH;
  const border = options.border ?? DEFAULT_BORDER;
  const borderStyle = options.borderStyle ?? DEFAULT_BORDER_STYLE;

  const borderChars = getBorderChars(borderStyle);
  const result: string[] = [];

  if (border) {
    result.push(createTopBorder(width, borderChars, title));
  }

  for (const line of lines) {
    result.push(renderLightBoxLine(line, theme, options));
  }

  if (border) {
    result.push(createBottomBorder(width, borderChars));
  }

  return result;
}

/**
 * Check if a theme is a light theme
 * @param theme - Theme object or theme name string
 * @returns True if the theme is a light theme
 */
export function isLightTheme(theme: Theme | string): boolean {
  if (typeof theme === "object" && theme.mode) {
    return theme.mode === "light";
  }

  const themeName = typeof theme === "string" ? theme : theme.name;
  const lowerName = themeName.toLowerCase();

  return lowerName.includes("light") || lowerName.includes("white");
}

/**
 * Check if terminal has dark background
 * @returns True if terminal background is dark
 */
export function isTerminalDark(): boolean {
  return isDarkBackground();
}
