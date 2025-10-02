import stripAnsiLib from "strip-ansi";
import type { StyleCode } from "./types";

/**
 * Escape HTML special characters
 * @param text - The text to escape
 * @returns Escaped HTML string
 */
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
    text
  );
}

/**
 * Convert hex color to RGB values
 * @param hex - Hex color string (e.g., "#ff0000")
 * @returns RGB array [r, g, b]
 */
export function hexToRgb(hex: string): readonly [number, number, number] {
  const HEX_PATTERN = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
  const DEFAULT_RGB: readonly [number, number, number] = [0, 0, 0] as const;

  const result = HEX_PATTERN.exec(hex);

  if (!result) {
    return DEFAULT_RGB;
  }

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] as const;
}

/**
 * Strip ANSI codes from a string for length calculation
 * @param str - The string to strip
 * @returns String without ANSI codes
 */
export function stripAnsi(str: string): string {
  return stripAnsiLib(str);
}

/**
 * Check if a style code is present in an array of style codes
 * @param styleCodes - Array of style codes
 * @param code - The code to check for
 * @returns True if the code is present
 */
export function hasStyleCode(
  styleCodes: ReadonlyArray<StyleCode> | undefined,
  code: StyleCode
): boolean {
  if (!styleCodes) {
    return false;
  }
  return styleCodes.includes(code);
}

/**
 * Parse COLORFGBG environment variable
 * @param colorFgBg - The COLORFGBG environment variable value
 * @returns Background color code or undefined
 */
export function parseColorFgBg(colorFgBg: string): number | undefined {
  const parts = colorFgBg.split(";");

  if (parts.length < 2) {
    return undefined;
  }

  const bgColor = parseInt(parts[1], 10);

  return isNaN(bgColor) ? undefined : bgColor;
}

/**
 * Check if a background color is light
 * @param bgColor - Background color code
 * @returns True if the color is light
 */
export function isLightBgColor(bgColor: number): boolean {
  const LIGHT_BG_COLORS: ReadonlyArray<number> = [7, 15];
  return LIGHT_BG_COLORS.includes(bgColor);
}

/**
 * Repeat a string n times
 * @param str - The string to repeat
 * @param count - Number of times to repeat
 * @returns Repeated string
 */
export function repeatString(str: string, count: number): string {
  return str.repeat(Math.max(0, count));
}

/**
 * Calculate padding for centering text
 * @param totalWidth - Total width available
 * @param textLength - Length of the text
 * @returns Tuple of [left padding, right padding]
 */
export function calculateCenterPadding(
  totalWidth: number,
  textLength: number
): readonly [number, number] {
  const remainingSpace = Math.max(0, totalWidth - textLength);
  const leftPadding = Math.floor(remainingSpace / 2);
  const rightPadding = remainingSpace - leftPadding;

  return [leftPadding, rightPadding] as const;
}

/**
 * Check if window is defined (browser environment)
 * @returns True if in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Check if window.matchMedia is available
 * @returns True if matchMedia is available
 */
export function hasMatchMedia(): boolean {
  return isBrowser() && typeof window.matchMedia === "function";
}
