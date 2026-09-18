import { createSimpleTheme, styleLine, tokensToHtml } from "logsdx";
import type { ThemeColors, SampleLog } from "@/components/themegenerator/types";

type ColorPalette = ThemeColors & { [key: string]: string | undefined };

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const createFallbackLog = (text: string, textColor: string): string => {
  const safeText = escapeHtml(text);
  const safeTextColor = escapeHtml(textColor);
  return `<span style="color: ${safeTextColor}">${safeText}</span>`;
};

const processLogWithLogsDX = (
  log: SampleLog,
  theme: ReturnType<typeof createSimpleTheme>,
  fallbackColor: string,
): string => {
  try {
    const tokens = styleLine(log.text, theme);
    return tokensToHtml(tokens, { theme, escapeHtml: true });
  } catch {
    return createFallbackLog(log.text, fallbackColor);
  }
};

export async function processLogs(
  colors: ThemeColors,
  presets: string[],
  logs: SampleLog[],
): Promise<string[]> {
  try {
    const themeName = `preview-${Date.now()}`;
    const theme = createSimpleTheme(themeName, colors as ColorPalette, {
      mode: "dark",
      presets,
    });

    return logs.map((log) => processLogWithLogsDX(log, theme, colors.text));
  } catch (error) {
    console.error("Log processing failed:", error);
    return logs.map((log) => createFallbackLog(log.text, colors.text));
  }
}
