import { stripAnsi as stripAnsiLib } from "../utils/strip-ansi";
import type { StyleCode } from "./types";

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
