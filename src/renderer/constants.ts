import { ColorDefinition } from "./types";
import { Theme } from "../types";

/**
 * Check if the terminal supports colors
 * @returns True if colors are supported
 */
export function supportsColors(): boolean {
  if (process.env.NO_COLOR) {
    return false;
  }

  if (process.env.FORCE_COLOR) {
    return true;
  }

  // Check if stdout exists and has isTTY (Node.js)
  if (process.stdout && process.stdout.isTTY === false) {
    return false;
  }

  const term = process.env.TERM;
  if (!term) {
    // If no TERM but we're in a known runtime that supports colors, assume true
    if (typeof Bun !== "undefined" || (globalThis as any).Deno !== undefined) {
      return true;
    }
    return false;
  }

  if (term === "dumb") {
    return false;
  }

  if (
    term.includes("color") ||
    term.includes("256") ||
    term.includes("ansi") ||
    term === "xterm" ||
    term === "screen" ||
    term === "tmux" ||
    process.env.COLORTERM
  ) {
    return true;
  }

  return false;
}

// Define ANSI color codes for text
export const TEXT_COLORS: Record<string, ColorDefinition> = {
  black: {
    ansi: "\x1b[30m",
    hex: "#000000",
    className: "logsdx__color--black",
  },
  red: { ansi: "\x1b[31m", hex: "#ff0000", className: "logsdx__color--red" },
  green: {
    ansi: "\x1b[32m",
    hex: "#00ff00",
    className: "logsdx__color--green",
  },
  yellow: {
    ansi: "\x1b[33m",
    hex: "#ffff00",
    className: "logsdx__color--yellow",
  },
  blue: { ansi: "\x1b[34m", hex: "#0000ff", className: "logsdx__color--blue" },
  magenta: {
    ansi: "\x1b[35m",
    hex: "#ff00ff",
    className: "logsdx__color--magenta",
  },
  cyan: { ansi: "\x1b[36m", hex: "#00ffff", className: "logsdx__color--cyan" },
  white: {
    ansi: "\x1b[37m",
    hex: "#ffffff",
    className: "logsdx__color--white",
  },
  brightBlack: {
    ansi: "\x1b[90m",
    hex: "#808080",
    className: "logsdx__color--brightBlack",
  },
  brightRed: {
    ansi: "\x1b[91m",
    hex: "#ff5555",
    className: "logsdx__color--brightRed",
  },
  brightGreen: {
    ansi: "\x1b[92m",
    hex: "#55ff55",
    className: "logsdx__color--brightGreen",
  },
  brightYellow: {
    ansi: "\x1b[93m",
    hex: "#ffff55",
    className: "logsdx__color--brightYellow",
  },
  brightBlue: {
    ansi: "\x1b[94m",
    hex: "#5555ff",
    className: "logsdx__color--brightBlue",
  },
  brightMagenta: {
    ansi: "\x1b[95m",
    hex: "#ff55ff",
    className: "logsdx__color--brightMagenta",
  },
  brightCyan: {
    ansi: "\x1b[96m",
    hex: "#55ffff",
    className: "logsdx__color--brightCyan",
  },
  brightWhite: {
    ansi: "\x1b[97m",
    hex: "#ffffff",
    className: "logsdx__color--brightWhite",
  },
};

/**
 * Get color definition with theme-aware fallback
 * @param colorName - The color name from the theme
 * @param theme - Optional theme for theme-specific colors
 * @returns ColorDefinition or undefined if not found
 */
export function getColorDefinition(
  colorName: string,
  theme?: Theme,
): ColorDefinition | undefined {
  // First check base colors
  if (TEXT_COLORS[colorName]) {
    return TEXT_COLORS[colorName];
  }

  // If theme has custom color definitions, check those
  if (
    theme &&
    "colorDefinitions" in theme &&
    typeof theme.colorDefinitions === "object" &&
    theme.colorDefinitions &&
    colorName in theme.colorDefinitions
  ) {
    return (theme.colorDefinitions as Record<string, ColorDefinition>)[
      colorName
    ];
  }

  // If it's a hex color (starts with #), create a definition
  if (colorName.startsWith("#")) {
    return {
      ansi: `\x1b[38;2;${hexToRgb(colorName).join(";")}m`,
      hex: colorName,
      className: `logsdx__color--custom-${colorName.slice(1)}`,
    };
  }

  // Fallback to basic color mapping for unknown theme colors
  const fallbackMap: Record<string, string> = {
    lightGray: "white",
    darkGray: "brightBlack",
    gray: "brightBlack",
    orange: "yellow",
    purple: "magenta",
    pink: "brightMagenta",
    lightGreen: "brightGreen",
    lightBlue: "brightCyan",
    forestGreen: "green",
    base00: "black",
    base0: "white",
    violet: "magenta",
  };

  const fallbackColor = fallbackMap[colorName];
  if (fallbackColor && TEXT_COLORS[fallbackColor]) {
    return TEXT_COLORS[fallbackColor];
  }

  return undefined;
}

/**
 * Convert hex color to RGB values
 * @param hex - Hex color string (e.g., "#ff0000")
 * @returns RGB array [r, g, b]
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

// Define ANSI color codes for background
export const BACKGROUND_COLORS: Record<string, ColorDefinition> = {
  black: { ansi: "\x1b[40m", hex: "#000000", className: "logsdx__bg--black" },
  red: { ansi: "\x1b[41m", hex: "#ff0000", className: "logsdx__bg--red" },
  green: { ansi: "\x1b[42m", hex: "#00ff00", className: "logsdx__bg--green" },
  yellow: { ansi: "\x1b[43m", hex: "#ffff00", className: "logsdx__bg--yellow" },
  blue: { ansi: "\x1b[44m", hex: "#0000ff", className: "logsdx__bg--blue" },
  magenta: {
    ansi: "\x1b[45m",
    hex: "#ff00ff",
    className: "logsdx__bg--magenta",
  },
  cyan: { ansi: "\x1b[46m", hex: "#00ffff", className: "logsdx__bg--cyan" },
  white: { ansi: "\x1b[47m", hex: "#ffffff", className: "logsdx__bg--white" },
  brightBlack: {
    ansi: "\x1b[100m",
    hex: "#808080",
    className: "logsdx__bg--brightBlack",
  },
  brightRed: {
    ansi: "\x1b[101m",
    hex: "#ff5555",
    className: "logsdx__bg--brightRed",
  },
  brightGreen: {
    ansi: "\x1b[102m",
    hex: "#55ff55",
    className: "logsdx__bg--brightGreen",
  },
  brightYellow: {
    ansi: "\x1b[103m",
    hex: "#ffff55",
    className: "logsdx__bg--brightYellow",
  },
  brightBlue: {
    ansi: "\x1b[104m",
    hex: "#5555ff",
    className: "logsdx__bg--brightBlue",
  },
  brightMagenta: {
    ansi: "\x1b[105m",
    hex: "#ff55ff",
    className: "logsdx__bg--brightMagenta",
  },
  brightCyan: {
    ansi: "\x1b[106m",
    hex: "#55ffff",
    className: "logsdx__bg--brightCyan",
  },
  brightWhite: {
    ansi: "\x1b[107m",
    hex: "#ffffff",
    className: "logsdx__bg--brightWhite",
  },
};

// Define ANSI style codes
export const STYLE_CODES = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  blink: "\x1b[5m",
  inverse: "\x1b[7m",
  hidden: "\x1b[8m",
  strikethrough: "\x1b[9m",
  resetBold: "\x1b[22m",
  resetDim: "\x1b[22m",
  resetItalic: "\x1b[23m",
  resetUnderline: "\x1b[24m",
  resetBlink: "\x1b[25m",
  resetInverse: "\x1b[27m",
  resetHidden: "\x1b[28m",
  resetStrikethrough: "\x1b[29m",
  resetColor: "\x1b[39m",
  resetBackground: "\x1b[49m",
};