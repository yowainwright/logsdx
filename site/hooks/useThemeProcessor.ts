import { useState, useEffect, useCallback } from "react";
import { getTheme, renderLine } from "logsdx";
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

const LOG_CACHE_MAX_ENTRIES = 100;
const LOG_CACHE = new Map<string, CachedProcessedLogs>();

function setCacheEntry(key: string, value: CachedProcessedLogs): void {
  LOG_CACHE.set(key, value);
  const hasOverflowed = LOG_CACHE.size > LOG_CACHE_MAX_ENTRIES;
  if (!hasOverflowed) return;
  const oldestKey = LOG_CACHE.keys().next().value;
  if (oldestKey !== undefined) LOG_CACHE.delete(oldestKey);
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

    async function processLogs() {
      const cacheKey = JSON.stringify([themeName, logs]);

      setIsLoading(true);
      setError(null);

      if (LOG_CACHE.has(cacheKey)) {
        const cached = LOG_CACHE.get(cacheKey)!;
        setProcessedLogs(cached.processedLogs);
        setTheme(cached.theme);
        setIsLoading(false);
        return;
      }

      try {
        const loadedTheme = await getTheme(themeName);

        if (cancelled) return;
        setTheme(loadedTheme);

        const results: ProcessedLog[] = [];

        for (const log of logs) {
          if (cancelled) return;

          const html = renderLine(log, loadedTheme, {
            outputFormat: "html",
            htmlStyleFormat: "css",
            escapeHtml: true,
          });

          const ansi = renderLine(log, loadedTheme, {
            outputFormat: "ansi",
          });

          results.push({ html, ansi });
        }

        setCacheEntry(cacheKey, { processedLogs: results, theme: loadedTheme });
        setProcessedLogs(results);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to process logs",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    processLogs();

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
        return renderLine(log, theme, {
          outputFormat: format,
          htmlStyleFormat: "css",
          escapeHtml: true,
        });
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
        return logs.map((log) =>
          renderLine(log, theme, {
            outputFormat: format,
            htmlStyleFormat: "css",
            escapeHtml: true,
          }),
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  return { processLog, processLogs, isProcessing };
}
