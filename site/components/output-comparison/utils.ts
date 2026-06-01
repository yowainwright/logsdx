import type { Theme } from "logsdx";
import { renderLine } from "logsdx";
import type { GhosttyTheme, ProcessedOutput } from "./types";
import { ANSI_ESCAPE_REPLACEMENTS } from "./constants";

function escapeAnsiForDisplay(ansi: string): string {
  return ANSI_ESCAPE_REPLACEMENTS.reduce(
    (s, [pattern, replacement]) => s.replace(pattern, replacement),
    ansi,
  );
}

export function processLogsWithTheme(
  logs: string[],
  theme: Theme,
): ProcessedOutput[] {
  return logs.map((log) => {
    const ansi = renderLine(log, theme, { outputFormat: "ansi" });
    const html = renderLine(log, theme, {
      outputFormat: "html",
      htmlStyleFormat: "css",
      escapeHtml: true,
    });
    return { ansi, html, ansiVisible: escapeAnsiForDisplay(ansi) };
  });
}

function adjustBrightness(hex: string, percent: number): string {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return hex || "#000000";

  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(
    255,
    Math.max(0, ((num >> 16) & 255) + Math.round((255 * percent) / 100)),
  );
  const g = Math.min(
    255,
    Math.max(0, ((num >> 8) & 255) + Math.round((255 * percent) / 100)),
  );
  const b = Math.min(
    255,
    Math.max(0, (num & 255) + Math.round((255 * percent) / 100)),
  );
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const DARK = {
  bg: "#1e1e1e",
  fg: "#d4d4d4",
  black: "#000000",
  white: "",
  selBrightness: 20,
};
const LIGHT = {
  bg: "#ffffff",
  fg: "#1e1e1e",
  black: "",
  white: "#e5e5e5",
  selBrightness: -15,
};
const ANSI = {
  red: "#cd3131",
  green: "#0dbc79",
  yellow: "#e5e510",
  blue: "#2472c8",
  magenta: "#bc3fbc",
  cyan: "#11a8cd",
  muted: "#666666",
};

function or<T>(a: T | undefined, b: T): T {
  if (a !== undefined) return a;
  return b;
}

function getModeDefaults(theme: Theme) {
  if (theme.mode === "dark" || theme.mode === "auto") return DARK;
  return LIGHT;
}

function getSemanticColors(colors: NonNullable<Theme["colors"]>) {
  const blue = or(colors.primary, or(colors.info, ANSI.blue));
  const cyan = or(colors.info, or(colors.secondary, ANSI.cyan));
  return {
    red: or(colors.error, ANSI.red),
    green: or(colors.success, ANSI.green),
    yellow: or(colors.warning, ANSI.yellow),
    blue,
    magenta: or(colors.debug, ANSI.magenta),
    cyan,
    muted: or(colors.muted, ANSI.muted),
  };
}

function getBrightColors(base: ReturnType<typeof getSemanticColors>) {
  return {
    brightRed: adjustBrightness(base.red, 15),
    brightGreen: adjustBrightness(base.green, 15),
    brightYellow: adjustBrightness(base.yellow, 15),
    brightBlue: adjustBrightness(base.blue, 15),
    brightMagenta: adjustBrightness(base.magenta, 15),
    brightCyan: adjustBrightness(base.cyan, 15),
  };
}

function getDerivedColors(mode: typeof DARK, bg: string, fg: string) {
  const black = mode.black || adjustBrightness(bg, -10);
  const white = mode.white || fg;
  const selection = adjustBrightness(bg, mode.selBrightness);
  return { black, white, selection };
}

export function themeToGhostty(theme: Theme): GhosttyTheme {
  const mode = getModeDefaults(theme);
  const colors = theme.colors || {};
  const bg = or(colors.background, mode.bg);
  const fg = or(colors.text, mode.fg);
  const semantic = getSemanticColors(colors);
  const bright = getBrightColors(semantic);
  const derived = getDerivedColors(mode, bg, fg);

  return {
    background: bg,
    foreground: fg,
    cursor: fg,
    cursorAccent: bg,
    selectionBackground: derived.selection,
    black: derived.black,
    white: derived.white,
    ...semantic,
    brightBlack: semantic.muted,
    ...bright,
    brightWhite: "#ffffff",
  };
}
