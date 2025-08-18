import { Theme } from "../types";
import { isDarkBackground } from "./detect-background";

export interface LightBoxOptions {
  /** Width of the box (default: 80) */
  width?: number;
  /** Padding inside the box (default: 2) */
  padding?: number;
  /** Show border (default: true) */
  border?: boolean;
  /** Border style (default: 'rounded') */
  borderStyle?: "rounded" | "square" | "double" | "simple";
  /** Background color override */
  backgroundColor?: string;
}

// Border characters for different styles
const BORDERS = {
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
};

// Theme-specific background colors
const THEME_BACKGROUNDS: Record<string, string> = {
  "github-light": "\x1b[48;2;255;255;255m", // Pure white
  "solarized-light": "\x1b[48;2;253;246;227m", // Solarized base3
  "one-light": "\x1b[48;2;250;250;250m", // One Light bg
  "atom-one-light": "\x1b[48;2;250;250;250m", // Atom One Light
};

/**
 * Get the background color for a theme
 */
export function getThemeBackground(theme: Theme | string): string {
  const themeName = typeof theme === "string" ? theme : theme.name;
  return THEME_BACKGROUNDS[themeName] || "\x1b[48;5;255m"; // Default to light gray
}

/**
 * Strip ANSI codes from a string for length calculation
 */
export function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

/**
 * Render a line in a light box
 */
export function renderLightBoxLine(
  line: string,
  theme: Theme | string,
  options: LightBoxOptions = {},
): string {
  const {
    width = 80,
    padding = 2,
    border = true,
    borderStyle = "rounded",
    backgroundColor,
  } = options;

  const bg = backgroundColor || getThemeBackground(theme);
  const reset = "\x1b[0m";
  const borders = BORDERS[borderStyle];

  const paddingStr = " ".repeat(padding);
  const contentWidth = width - (border ? 2 : 0) - padding * 2;
  const lineLength = stripAnsi(line).length;
  const rightPadding = Math.max(0, contentWidth - lineLength);

  if (border) {
    return `${borders.vertical}${bg}${paddingStr}${line}${" ".repeat(rightPadding)}${paddingStr}${reset}${borders.vertical}`;
  } else {
    return `${bg}${paddingStr}${line}${" ".repeat(rightPadding)}${paddingStr}${reset}`;
  }
}

/**
 * Render a complete light box with multiple lines
 */
export function renderLightBox(
  lines: string[],
  theme: Theme | string,
  title?: string,
  options: LightBoxOptions = {},
): string[] {
  const { width = 80, border = true, borderStyle = "rounded" } = options;

  const borders = BORDERS[borderStyle];
  const result: string[] = [];

  if (border) {
    // Top border with optional title
    if (title) {
      const paddedTitle = ` ${title} `;
      const leftPadding = Math.floor((width - paddedTitle.length - 2) / 2);
      const rightPadding = width - leftPadding - paddedTitle.length - 2;
      result.push(
        borders.topLeft +
          borders.horizontal.repeat(leftPadding) +
          paddedTitle +
          borders.horizontal.repeat(rightPadding) +
          borders.topRight,
      );
    } else {
      result.push(
        borders.topLeft +
          borders.horizontal.repeat(width - 2) +
          borders.topRight,
      );
    }
  }

  // Content lines
  lines.forEach((line) => {
    result.push(renderLightBoxLine(line, theme, options));
  });

  if (border) {
    // Bottom border
    result.push(
      borders.bottomLeft +
        borders.horizontal.repeat(width - 2) +
        borders.bottomRight,
    );
  }

  return result;
}

/**
 * Check if a theme is a light theme
 */
export function isLightTheme(theme: Theme | string): boolean {
  if (typeof theme === "object" && theme.mode) {
    return theme.mode === "light";
  }

  // Fallback to name-based detection if mode is not specified
  const themeName = typeof theme === "string" ? theme : theme.name;
  return (
    themeName.toLowerCase().includes("light") ||
    themeName.toLowerCase().includes("white")
  );
}

export function isTerminalDark(): boolean {
  return isDarkBackground();
}
