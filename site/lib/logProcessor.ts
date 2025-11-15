import { createSimpleTheme, registerTheme, getLogsDX } from "logsdx";
import type { ThemeColors, SampleLog } from "@/components/themegenerator/types";
import type { LogsDXInstance } from "@/types/logsdx";

const createFallbackLog = (text: string, textColor: string): string =>
  `<span style="color: ${textColor}">${text}</span>`;

const processLogWithLogsDX = async (
  log: SampleLog,
  processor: LogsDXInstance,
  fallbackColor: string,
): Promise<string> => {
  try {
    return processor.processLine(log.text);
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
    const theme = createSimpleTheme(themeName, colors, {
      mode: "dark",
      presets,
    });

    registerTheme(theme);

    const processor = await getLogsDX({
      theme: themeName,
      outputFormat: "html",
      htmlStyleFormat: "css",
      escapeHtml: false,
    });

    return Promise.all(
      logs.map((log) => processLogWithLogsDX(log, processor, colors.text)),
    );
  } catch (error) {
    console.error("Log processing failed:", error);
    return logs.map((log) => createFallbackLog(log.text, colors.text));
  }
}
