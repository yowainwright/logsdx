"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { GhosttyTerminalProps } from "./types";
import { TERMINAL } from "./constants";

export function GhosttyTerminal({
  ansiOutputs,
  isLoading,
  theme,
}: GhosttyTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<unknown>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const initTerminal = useCallback(
    async (mounted: { current: boolean }) => {
      if (!containerRef.current) return;

      setError(null);

      try {
        const initPromise = (async () => {
          const ghostty = await import("ghostty-web");
          await ghostty.init();
          return ghostty;
        })();

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Terminal initialization timed out")),
            TERMINAL.initTimeoutMs,
          );
        });

        const ghostty = (await Promise.race([
          initPromise,
          timeoutPromise,
        ])) as typeof import("ghostty-web");

        if (!mounted.current || !containerRef.current) return;

        containerRef.current.innerHTML = "";

        const term = new ghostty.Terminal({
          fontSize: TERMINAL.fontSize,
          fontFamily: TERMINAL.fontFamily,
          theme,
        });

        term.open(containerRef.current);
        terminalRef.current = term;
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize Ghostty terminal:", err);
        if (mounted.current) {
          setError(
            err instanceof Error ? err.message : "Failed to load terminal",
          );
        }
      }
    },
    [theme],
  );

  const handleRetry = useCallback(() => {
    setRetryCount((c) => c + 1);
    setError(null);
    setIsInitialized(false);
  }, []);

  useEffect(() => {
    const mounted = { current: true };

    initTerminal(mounted);

    return () => {
      mounted.current = false;
      if (
        terminalRef.current &&
        typeof (terminalRef.current as { dispose?: () => void }).dispose ===
          "function"
      ) {
        (terminalRef.current as { dispose: () => void }).dispose();
      }
    };
  }, [initTerminal, retryCount]);

  useEffect(() => {
    if (!isInitialized || !terminalRef.current || isLoading) return;

    const term = terminalRef.current as {
      write: (data: string) => void;
      clear: () => void;
    };

    term.clear();

    for (const output of ansiOutputs) {
      term.write(output + "\r\n");
    }
  }, [ansiOutputs, isInitialized, isLoading]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        <div className="text-center">
          <p className="mb-2">Terminal failed to load</p>
          <p className="text-xs text-slate-500 mb-3">{error}</p>
          <button
            onClick={handleRetry}
            className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const showLoading = isLoading || !isInitialized;
  const containerClassName = showLoading
    ? `${TERMINAL.minHeight} invisible`
    : TERMINAL.minHeight;

  const loadingOverlay = (
    <div className="absolute inset-0 flex items-center justify-center text-slate-500 z-10">
      <div className="text-center">
        <div className="animate-pulse mb-2">Loading terminal...</div>
        <p className="text-xs">Powered by Ghostty WASM</p>
      </div>
    </div>
  );

  return (
    <div
      className={`relative ${TERMINAL.minHeight}`}
      style={{ backgroundColor: theme.background }}
    >
      {showLoading && loadingOverlay}
      <div ref={containerRef} className={containerClassName} />
    </div>
  );
}
