"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { GhosttyTerminalProps, GhosttyTheme } from "./types";
import { TERMINAL } from "./constants";

type ThemedTerminal = { options: { theme: GhosttyTheme } };

type GhosttyModule = typeof import("ghostty-web");

async function loadGhostty(): Promise<GhosttyModule> {
  const initPromise = (async () => {
    const ghostty = await import("ghostty-web");
    await ghostty.init();
    return ghostty;
  })();
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error("Terminal initialization timed out")),
      TERMINAL.initTimeoutMs,
    );
  });

  return Promise.race([initPromise, timeoutPromise]);
}

function createTerminal(
  ghostty: GhosttyModule,
  container: HTMLDivElement,
  theme: GhosttyTheme,
) {
  const terminal = new ghostty.Terminal({
    fontSize: TERMINAL.fontSize,
    fontFamily: TERMINAL.fontFamily,
    theme,
  });
  terminal.open(container);
  return terminal;
}

interface TerminalInitialization {
  containerRef: React.RefObject<HTMLDivElement | null>;
  error: string | null;
  handleRetry: () => void;
  isInitialized: boolean;
  terminalRef: React.MutableRefObject<unknown>;
}

interface InitializeTerminalOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  terminalRef: React.MutableRefObject<unknown>;
  themeRef: React.MutableRefObject<GhosttyTheme>;
}

async function initializeTerminal(
  mounted: { current: boolean },
  options: InitializeTerminalOptions,
) {
  const { containerRef, setError, setIsInitialized, terminalRef, themeRef } =
    options;
  const hasContainer = Boolean(containerRef.current);
  if (!hasContainer) return;

  setError(null);
  try {
    const ghostty = await loadGhostty();
    const canOpenTerminal = mounted.current && Boolean(containerRef.current);
    if (!canOpenTerminal) return;

    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";
    const terminal = createTerminal(ghostty, container, themeRef.current);
    terminalRef.current = terminal;
    setIsInitialized(true);
  } catch (caughtError) {
    console.error("Failed to initialize Ghostty terminal:", caughtError);
    if (!mounted.current) return;
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Failed to load terminal";
    setError(message);
  }
}

function disposeTerminal(terminalRef: React.MutableRefObject<unknown>) {
  const terminal = terminalRef.current as { dispose?: () => void };
  const canDispose = typeof terminal.dispose === "function";
  if (canDispose) terminal.dispose?.();
}

function useTerminalRetry(
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const [retryCount, setRetryCount] = useState(0);
  const handleRetry = useCallback(() => {
    setRetryCount((count) => count + 1);
    setError(null);
    setIsInitialized(false);
  }, [setError, setIsInitialized]);

  return { handleRetry, retryCount };
}

function useTerminalInitialization(
  theme: GhosttyTheme,
): TerminalInitialization {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<unknown>(null);
  const themeRef = useRef<GhosttyTheme>(theme);
  themeRef.current = theme;
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleRetry, retryCount } = useTerminalRetry(
    setError,
    setIsInitialized,
  );

  const initTerminal = useCallback(
    (mounted: { current: boolean }) =>
      initializeTerminal(mounted, {
        containerRef,
        setError,
        setIsInitialized,
        terminalRef,
        themeRef,
      }),
    [],
  );

  useEffect(() => {
    const mounted = { current: true };
    void initTerminal(mounted);

    return () => {
      mounted.current = false;
      disposeTerminal(terminalRef);
    };
  }, [initTerminal, retryCount]);

  return {
    containerRef,
    error,
    handleRetry,
    isInitialized,
    terminalRef,
  };
}

function useTerminalTheme(
  terminalRef: React.MutableRefObject<unknown>,
  theme: GhosttyTheme,
  isInitialized: boolean,
) {
  useEffect(() => {
    const hasTerminal = Boolean(terminalRef.current);
    const shouldUpdateTheme = isInitialized && hasTerminal;
    if (!shouldUpdateTheme) return;

    (terminalRef.current as ThemedTerminal).options.theme = theme;
  }, [theme, isInitialized, terminalRef]);
}

function useTerminalOutput(
  terminalRef: React.MutableRefObject<unknown>,
  ansiOutputs: string[],
  isInitialized: boolean,
  isLoading: boolean,
) {
  useEffect(() => {
    const hasTerminal = Boolean(terminalRef.current);
    const shouldWriteOutput = isInitialized && hasTerminal && !isLoading;
    if (!shouldWriteOutput) return;

    const terminal = terminalRef.current as {
      write: (data: string) => void;
      clear: () => void;
    };
    terminal.clear();
    ansiOutputs.forEach((output) => terminal.write(`${output}\r\n`));
  }, [ansiOutputs, isInitialized, isLoading, terminalRef]);
}

function TerminalError({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-64 text-red-400">
      <div className="text-center">
        <p className="mb-2">Terminal failed to load</p>
        <p className="text-xs text-slate-500 mb-3">{error}</p>
        <button
          onClick={onRetry}
          className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function TerminalLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-slate-500 z-10">
      <div className="text-center">
        <div className="animate-pulse mb-2">Loading terminal...</div>
        <p className="text-xs">Powered by Ghostty WASM</p>
      </div>
    </div>
  );
}

export function GhosttyTerminal({
  ansiOutputs,
  isLoading,
  theme,
}: GhosttyTerminalProps) {
  const { containerRef, error, handleRetry, isInitialized, terminalRef } =
    useTerminalInitialization(theme);
  useTerminalTheme(terminalRef, theme, isInitialized);
  useTerminalOutput(terminalRef, ansiOutputs, isInitialized, isLoading);

  if (error) return <TerminalError error={error} onRetry={handleRetry} />;

  const showLoading = isLoading || !isInitialized;
  const containerClassName = showLoading
    ? `${TERMINAL.minHeight} invisible`
    : TERMINAL.minHeight;

  return (
    <div
      className={`relative ${TERMINAL.minHeight}`}
      style={{ backgroundColor: theme.background }}
    >
      {showLoading && <TerminalLoading />}
      <div ref={containerRef} className={containerClassName} />
    </div>
  );
}
