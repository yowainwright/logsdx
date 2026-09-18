import { useState, useEffect, useCallback } from "react";
import { getTheme, styleLine, tokensToHtml, tokensToString } from "logsdx";
import type { Theme } from "logsdx";

interface ProcessedLog {
  html: string;
  ansi: string;
}

interface ThemeProcessorResult {
  processedLogs: ProcessedLog[];
  isLoading: boolean;
  error: string | null;
  theme: Theme | null;
}

interface CachedProcessedLogs {
  processedLogs: ProcessedLog[];
  theme: Theme;
}

function processLog(log: string, theme: Theme): ProcessedLog {
  const tokens = styleLine(log, theme);
  const html = tokensToHtml(tokens, {
    theme,
    htmlStyleFormat: "css",
    escapeHtml: true,
  });
  const ansi = tokensToString(tokens, true, "truecolor", theme);
  return { html, ansi };
}

function renderLog(log: string, theme: Theme, format: "html" | "ansi"): string {
  const tokens = styleLine(log, theme);
  if (format === "html") {
    return tokensToHtml(tokens, {
      theme,
      htmlStyleFormat: "css",
      escapeHtml: true,
    });
  }
  return tokensToString(tokens, true, "truecolor", theme);
}

const LOG_CACHE_MAX_ENTRIES = 100;
const LOG_CACHE = new Map<string, CachedProcessedLogs>();

function setCacheEntry(key: string, value: CachedProcessedLogs): void {
  LOG_CACHE.set(key, value);
  const hasOverflowed = LOG_CACHE.size > LOG_CACHE_MAX_ENTRIES;
  if (!hasOverflowed) return;
  const oldestKey = LOG_CACHE.keys().next().value;
  if (oldestKey !== undefined) LOG_CACHE.delete(oldestKey);
}

interface ThemeProcessingState {
  isCancelled: () => boolean;
  setProcessedLogs: (value: ProcessedLog[]) => void;
  setTheme: (value: Theme) => void;
  setIsLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
}

async function processThemeLogs(
  themeName: string,
  logs: string[],
  state: ThemeProcessingState,
): Promise<void> {
  const cacheKey = JSON.stringify([themeName, logs]);
  state.setIsLoading(true);
  state.setError(null);

  const cached = LOG_CACHE.get(cacheKey);
  if (cached) {
    state.setProcessedLogs(cached.processedLogs);
    state.setTheme(cached.theme);
    state.setIsLoading(false);
    return;
  }

  try {
    const loadedTheme = await getTheme(themeName);
    if (state.isCancelled()) return;
    state.setTheme(loadedTheme);

    const results = logs.map((log) => processLog(log, loadedTheme));
    if (state.isCancelled()) return;
    setCacheEntry(cacheKey, { processedLogs: results, theme: loadedTheme });
    state.setProcessedLogs(results);
  } catch (error) {
    if (!state.isCancelled()) {
      const message =
        error instanceof Error ? error.message : "Failed to process logs";
      state.setError(message);
    }
  } finally {
    if (!state.isCancelled()) state.setIsLoading(false);
  }
}

export function useThemeProcessor(
  themeName: string,
  logs: string[],
): ThemeProcessorResult {
  const logsKey = JSON.stringify(logs);
  const [processedLogs, setProcessedLogs] = useState<ProcessedLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    let cancelled = false;
    void processThemeLogs(themeName, logs, {
      isCancelled: () => cancelled,
      setProcessedLogs,
      setTheme,
      setIsLoading,
      setError,
    });

    return () => {
      cancelled = true;
    };
  }, [themeName, logsKey]);

  return { processedLogs, isLoading, error, theme };
}

export function useLogProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processLog = useCallback(
    async (
      log: string,
      themeName: string,
      format: "html" | "ansi" = "html",
    ): Promise<string> => {
      setIsProcessing(true);
      try {
        const theme = await getTheme(themeName);
        return renderLog(log, theme, format);
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  const processLogs = useCallback(
    async (
      logs: string[],
      themeName: string,
      format: "html" | "ansi" = "html",
    ): Promise<string[]> => {
      setIsProcessing(true);
      try {
        const theme = await getTheme(themeName);
        return logs.map((log) => renderLog(log, theme, format));
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  return { processLog, processLogs, isProcessing };
}
