"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useThemeProcessor } from "@/hooks/useThemeProcessor";
import { ThemeSelector } from "./ThemeSelector";
import { OutputPane } from "./OutputPane";
import { DEFAULT_LOGS } from "./constants";
import type { LogPlaygroundProps } from "./types";

export function LogPlayground({
  defaultTheme = "dracula",
  defaultLogs = DEFAULT_LOGS,
}: LogPlaygroundProps) {
  const [inputText, setInputText] = useState(defaultLogs);
  const [selectedTheme, setSelectedTheme] = useState(defaultTheme);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedAnsi, setCopiedAnsi] = useState(false);

  const logs = useMemo(
    () => inputText.split("\n").filter((line) => line.trim()),
    [inputText],
  );

  const { processedLogs, isLoading, theme } = useThemeProcessor(
    selectedTheme,
    logs,
  );

  const handleReset = useCallback(() => {
    setInputText(defaultLogs);
  }, [defaultLogs]);

  const handleCopyHtml = useCallback(async () => {
    const html = processedLogs.map((p) => p.html).join("\n");
    await navigator.clipboard.writeText(html);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  }, [processedLogs]);

  const handleCopyAnsi = useCallback(async () => {
    const ansi = processedLogs.map((p) => p.ansi).join("\n");
    await navigator.clipboard.writeText(ansi);
    setCopiedAnsi(true);
    setTimeout(() => setCopiedAnsi(false), 2000);
  }, [processedLogs]);

  const backgroundColor = theme?.mode === "light" ? "#ffffff" : "#1e1e1e";

  return (
    <section id="playground" className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Live Log Playground</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Paste your logs below and see them transformed in real-time. The
            same output works identically in your terminal and browser.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl">Try It Yourself</CardTitle>
              <div className="flex items-center gap-4">
                <ThemeSelector
                  value={selectedTheme}
                  onChange={setSelectedTheme}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input */}
              <div>
                <label
                  htmlFor="log-input"
                  className="block text-sm font-medium mb-2"
                >
                  Input Logs
                </label>
                <textarea
                  id="log-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full h-48 p-4 font-mono text-sm border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 resize-none"
                  placeholder="Paste your logs here..."
                />
              </div>

              {/* Output Panes */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg overflow-hidden dark:border-slate-700">
                  <OutputPane
                    title="Browser Console"
                    content={processedLogs.map((p) => p.html)}
                    backgroundColor={backgroundColor}
                    isLoading={isLoading}
                    onCopy={handleCopyHtml}
                    isCopied={copiedHtml}
                  />
                </div>
                <div className="border rounded-lg overflow-hidden dark:border-slate-700">
                  <OutputPane
                    title="Terminal"
                    content={processedLogs.map((p) => p.html)}
                    backgroundColor={backgroundColor}
                    isLoading={isLoading}
                    onCopy={handleCopyAnsi}
                    isCopied={copiedAnsi}
                  />
                </div>
              </div>

              {/* Code Example */}
              <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
                <div className="text-xs text-slate-400 mb-2">Usage</div>
                <pre className="text-sm">
                  <code>{`import { getLogsDX } from 'logsdx';

const logsdx = await getLogsDX({ theme: '${selectedTheme}' });
console.log(logsdx.processLine('[INFO] Your log here'));`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export type { LogPlaygroundProps } from "./types";
