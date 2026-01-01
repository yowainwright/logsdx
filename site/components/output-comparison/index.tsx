"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { getTheme, renderLine } from "logsdx";
import { SAMPLE_LOGS, OUTPUT_TABS, THEME_OPTIONS } from "./constants";
import type { OutputTab, ProcessedOutput } from "./types";

const GhosttyTerminal = dynamic(
  () => import("./GhosttyTerminal").then((mod) => mod.GhosttyTerminal),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Loading terminal...
      </div>
    ),
  }
);

function escapeAnsiForDisplay(ansi: string): string {
  return ansi
    .replace(/\x1b/g, "\\x1b")
    .replace(/\[/g, "[");
}

function escapeHtmlForDisplay(html: string): string {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function OutputComparison() {
  const [theme, setTheme] = useState("dracula");
  const [activeTab, setActiveTab] = useState<OutputTab>("ansi-raw");
  const [outputs, setOutputs] = useState<ProcessedOutput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customLog, setCustomLog] = useState("");

  const logs = useMemo(() => {
    if (customLog.trim()) {
      return customLog.split("\n").filter(Boolean);
    }
    return SAMPLE_LOGS;
  }, [customLog]);

  useEffect(() => {
    let cancelled = false;

    async function processLogs() {
      setIsLoading(true);
      try {
        const loadedTheme = await getTheme(theme);

        if (cancelled) return;

        const results: ProcessedOutput[] = logs.map((log) => {
          const ansi = renderLine(log, loadedTheme, {
            outputFormat: "ansi",
          });

          const html = renderLine(log, loadedTheme, {
            outputFormat: "html",
            htmlStyleFormat: "css",
            escapeHtml: true,
          });

          return {
            ansi,
            html,
            ansiVisible: escapeAnsiForDisplay(ansi),
          };
        });

        if (!cancelled) {
          setOutputs(results);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to process logs:", err);
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
  }, [theme, logs]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64 text-slate-500">
          Processing...
        </div>
      );
    }

    switch (activeTab) {
      case "ansi-raw":
        return (
          <div className="space-y-1">
            {outputs.map((output, i) => (
              <div key={i} className="font-mono text-sm text-amber-400 break-all">
                {output.ansiVisible}
              </div>
            ))}
          </div>
        );

      case "ansi-rendered":
        return (
          <GhosttyTerminal
            ansiOutputs={outputs.map((o) => o.ansi)}
            isLoading={isLoading}
          />
        );

      case "html-raw":
        return (
          <div className="space-y-2">
            {outputs.map((output, i) => (
              <div key={i} className="font-mono text-xs text-emerald-400 break-all">
                {escapeHtmlForDisplay(output.html)}
              </div>
            ))}
          </div>
        );

      case "html-rendered":
        return (
          <div className="space-y-1">
            {outputs.map((output, i) => (
              <div
                key={i}
                className="font-mono text-sm"
                dangerouslySetInnerHTML={{ __html: output.html }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <section id="output-comparison" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-5xl lg:text-6xl font-bold">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Real
            </span>{" "}
            Output Comparison
          </h2>
          <p className="mb-12 text-center text-xl text-slate-600 dark:text-slate-400">
            See exactly what logsDX outputs for terminal vs browser
          </p>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {THEME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Custom Log (optional)
                </label>
                <textarea
                  value={customLog}
                  onChange={(e) => setCustomLog(e.target.value)}
                  placeholder="Paste your own logs here..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm h-32 resize-none"
                />
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">
                  Output Formats
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-orange-500 font-bold">ANSI:</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Escape codes for terminals
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-500 font-bold">HTML:</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Styled spans for browsers
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {OUTPUT_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-orange-500 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {OUTPUT_TABS.find((t) => t.id === activeTab)?.description}
              </p>

              <div className="rounded-lg overflow-hidden border border-slate-700">
                <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-white/60 ml-2">
                    {activeTab.includes("ansi") ? "Terminal" : "Browser"}
                  </span>
                </div>
                <div
                  className="p-4 min-h-[300px] overflow-auto"
                  style={{ backgroundColor: "#1e1e1e" }}
                >
                  {renderContent()}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                  <h5 className="text-sm font-semibold mb-2 text-orange-500">
                    Terminal Output
                  </h5>
                  <code className="text-xs text-slate-600 dark:text-slate-400 block">
                    logsdx.processLine(log)
                  </code>
                  <p className="text-xs text-slate-500 mt-2">
                    outputFormat: &quot;ansi&quot;
                  </p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                  <h5 className="text-sm font-semibold mb-2 text-emerald-500">
                    Browser Output
                  </h5>
                  <code className="text-xs text-slate-600 dark:text-slate-400 block">
                    logsdx.processLine(log)
                  </code>
                  <p className="text-xs text-slate-500 mt-2">
                    outputFormat: &quot;html&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { GhosttyTerminal } from "./GhosttyTerminal";
export type { OutputComparisonProps, OutputTab, GhosttyTerminalProps } from "./types";
