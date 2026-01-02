"use client";

import React, { useEffect, useRef, useState } from "react";
import type { GhosttyTerminalProps } from "./types";

export function GhosttyTerminal({
  ansiOutputs,
  isLoading,
}: GhosttyTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<unknown>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initTerminal() {
      if (!containerRef.current) return;

      try {
        const ghostty = await import("ghostty-web");
        await ghostty.init();

        if (!mounted || !containerRef.current) return;

        containerRef.current.innerHTML = "";

        const term = new ghostty.Terminal({
          fontSize: 14,
          fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, monospace",
          theme: {
            background: "#1e1e1e",
            foreground: "#d4d4d4",
            cursor: "#d4d4d4",
            cursorAccent: "#1e1e1e",
            selectionBackground: "#264f78",
            black: "#000000",
            red: "#cd3131",
            green: "#0dbc79",
            yellow: "#e5e510",
            blue: "#2472c8",
            magenta: "#bc3fbc",
            cyan: "#11a8cd",
            white: "#e5e5e5",
            brightBlack: "#666666",
            brightRed: "#f14c4c",
            brightGreen: "#23d18b",
            brightYellow: "#f5f543",
            brightBlue: "#3b8eea",
            brightMagenta: "#d670d6",
            brightCyan: "#29b8db",
            brightWhite: "#ffffff",
          },
        });

        term.open(containerRef.current);
        terminalRef.current = term;
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize Ghostty terminal:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load terminal",
        );
      }
    }

    initTerminal();

    return () => {
      mounted = false;
      if (
        terminalRef.current &&
        typeof (terminalRef.current as { dispose?: () => void }).dispose ===
          "function"
      ) {
        (terminalRef.current as { dispose: () => void }).dispose();
      }
    };
  }, []);

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
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="text-center">
          <div className="animate-pulse mb-2">Loading terminal...</div>
          <p className="text-xs">Powered by Ghostty WASM</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-[300px]"
      style={{ backgroundColor: "#1e1e1e" }}
    />
  );
}
