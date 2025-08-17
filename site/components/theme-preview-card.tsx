"use client";

import React, { useEffect, useState } from "react";
import { getLogsDX, getAllThemes } from "logsdx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// @ts-ignore
import AnsiToHtml from "ansi-to-html";

interface ThemePreviewCardProps {
  themeName: string;
}

// More diverse log examples to showcase theme capabilities
const sampleLogs = [
  "[2024-01-15 10:23:45] INFO: Server started on port 3000",
  "GET /api/users 200 OK (123ms)",
  "WARN: Memory usage high: 85% (1.7GB/2GB)",
  "[ERROR] Database connection failed: ECONNREFUSED 127.0.0.1:5432",
  "✓ All tests passed (42 tests, 0 failures)",
  "Processing batch job... [████████████████████] 100%",
  "User authentication successful for admin@example.com",
  "Cache hit ratio: 92.5% | Requests: 10,543 | Hits: 9,752",
  "🚀 Deployment completed to production environment",
  "DEBUG: SQL Query: SELECT * FROM users WHERE active = true",
];

// Theme background configurations
const themeBackgrounds: Record<
  string,
  { terminal: string; browser: string; text: string; border: string }
> = {
  "oh-my-zsh": {
    terminal: "#2c3e50",
    browser: "#2c3e50",
    text: "#ecf0f1",
    border: "#34495e",
  },
  dracula: {
    terminal: "#282a36",
    browser: "#282a36",
    text: "#f8f8f2",
    border: "#44475a",
  },
  "github-light": {
    terminal: "#ffffff",
    browser: "#ffffff",
    text: "#1f2328",
    border: "#d1d9e0",
  },
  "github-dark": {
    terminal: "#0d1117",
    browser: "#0d1117",
    text: "#e6edf3",
    border: "#30363d",
  },
  "solarized-light": {
    terminal: "#fdf6e3",
    browser: "#fdf6e3",
    text: "#657b83",
    border: "#eee8d5",
  },
  "solarized-dark": {
    terminal: "#002b36",
    browser: "#002b36",
    text: "#839496",
    border: "#073642",
  },
};

const getThemeBackground = (
  themeName: string,
  type: "terminal" | "browser",
) => {
  return (
    themeBackgrounds[themeName]?.[type] ||
    (type === "terminal" ? "#1a1a1a" : "#ffffff")
  );
};

const getThemeTextColor = (themeName: string) => {
  return themeBackgrounds[themeName]?.text || "#000000";
};

const getThemeBorderColor = (themeName: string) => {
  return themeBackgrounds[themeName]?.border || "#e5e5e5";
};

export function ThemePreviewCard({ themeName }: ThemePreviewCardProps) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [browserOutput, setBrowserOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    try {
      // Get all themes
      const themes = getAllThemes();
      const theme = themes[themeName as keyof typeof themes];

      if (!theme) {
        console.error(`Theme "${themeName}" not found`);
        setIsLoading(false);
        return;
      }

      // Create logsDx instances for terminal and browser
      const terminalLogger = getLogsDX({
        theme: themeName,
        outputFormat: "ansi",
      });
      const browserLogger = getLogsDX({
        theme: themeName,
        outputFormat: "html",
      });
      const convert = new AnsiToHtml({ fg: "#c9d1d9", bg: "#0d1117" });

      // Generate terminal output
      const terminalLogs = sampleLogs.map((log) => {
        try {
          // @ts-ignore
          const ansiLog = terminalLogger.processLine(log);
          // Convert ANSI codes to HTML for display
          return convert.toHtml(ansiLog);
        } catch (e) {
          console.error(`Error styling log for terminal: ${e}`);
          return log;
        }
      });
      setTerminalOutput(terminalLogs);

      // Generate browser output
      const browserLogs = sampleLogs.map((log) => {
        try {
          // @ts-ignore
          return browserLogger.processLine(log);
        } catch (e) {
          console.error(`Error styling log for browser: ${e}`);
          return log;
        }
      });
      setBrowserOutput(browserLogs);
    } catch (error) {
      console.error(`Error loading theme ${themeName}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [themeName]);

  const formatThemeName = (name: string) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">
            {formatThemeName(themeName)}
          </CardTitle>
          <CardDescription>Loading theme...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{formatThemeName(themeName)}</CardTitle>
        <CardDescription>Click to copy theme name</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Terminal Preview */}
        <div className="relative overflow-hidden">
          <div
            className="terminal-preview rounded-md border border-slate-700 p-4 font-mono text-xs relative"
            style={{
              backgroundColor: getThemeBackground(themeName, "terminal"),
              color: getThemeTextColor(themeName),
            }}
          >
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/20 to-transparent z-10 flex items-center justify-center">
              <span className="text-sm font-medium text-white/60 uppercase tracking-wider">
                Terminal
              </span>
            </div>
            <div className="pt-8 space-y-1 overflow-hidden h-64 relative">
              {terminalOutput.map((line, i) => (
                <div
                  key={i}
                  className="animate-scroll-up px-2 py-0.5 rounded"
                  style={{
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${10 + i * 0.2}s`,
                    backgroundColor: "rgba(0,0,0,0.2)",
                  }}
                  dangerouslySetInnerHTML={{ __html: line }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Browser Preview */}
        <div className="relative overflow-hidden">
          <div
            className="browser-preview rounded-md border p-4 font-mono text-xs relative"
            style={{
              backgroundColor: getThemeBackground(themeName, "browser"),
              color: getThemeTextColor(themeName),
              borderColor: getThemeBorderColor(themeName),
            }}
          >
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/10 to-transparent z-10 flex items-center justify-center">
              <span className="text-sm font-medium opacity-60 uppercase tracking-wider">
                Browser
              </span>
            </div>
            <div className="pt-8 space-y-1 overflow-hidden h-64 relative">
              {browserOutput.map((line, i) => (
                <div
                  key={i}
                  className="animate-scroll-up px-2 py-0.5 rounded"
                  style={{
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${10 + i * 0.2}s`,
                    backgroundColor: "rgba(0,0,0,0.05)",
                  }}
                  dangerouslySetInnerHTML={{ __html: line }}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
