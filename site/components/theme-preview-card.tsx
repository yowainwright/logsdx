"use client";

import React, { useEffect, useState } from "react";
import { getAllThemes, styleLine, tokensToHtml, tokensToString } from "logsdx";
import type { Theme } from "logsdx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// @ts-ignore - ansi-to-html does not publish TypeScript declarations.
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
  const background = themeBackgrounds[themeName]?.[type];
  if (background) return background;
  const fallbackBackground = type === "terminal" ? "#1a1a1a" : "#ffffff";
  return fallbackBackground;
};

const getThemeTextColor = (themeName: string) => {
  return themeBackgrounds[themeName]?.text || "#000000";
};

const getThemeBorderColor = (themeName: string) => {
  return themeBackgrounds[themeName]?.border || "#e5e5e5";
};

interface ThemePreviewData {
  terminalOutput: string[];
  browserOutput: string[];
}

function buildThemePreview(themeName: string): ThemePreviewData | undefined {
  const theme = getAllThemes()[themeName] as Theme | undefined;
  if (!theme) return undefined;

  const styledLogs = sampleLogs.map((log) => styleLine(log, theme));
  const htmlOptions = { theme, escapeHtml: true } as const;
  const ansiLogs = styledLogs.map((tokens) =>
    tokensToString(tokens, true, "truecolor", theme),
  );
  const converter = new AnsiToHtml({
    fg: theme.colors?.text || "#c9d1d9",
    bg: theme.colors?.background || "#0d1117",
  });
  const terminalOutput = ansiLogs.map((ansi) => converter.toHtml(ansi));
  const browserOutput = styledLogs.map((tokens) =>
    tokensToHtml(tokens, htmlOptions),
  );

  return { terminalOutput, browserOutput };
}

function formatThemeName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface PreviewLineProps {
  line: string;
  index: number;
  backgroundColor: string;
}

function PreviewLine({ line, index, backgroundColor }: PreviewLineProps) {
  const animationDelay = `${index * 0.5}s`;
  const animationDuration = `${10 + index * 0.2}s`;
  return (
    <div
      className="animate-scroll-up px-2 py-0.5 rounded"
      style={{ animationDelay, animationDuration, backgroundColor }}
      dangerouslySetInnerHTML={{ __html: line }}
    />
  );
}

interface LogPreviewProps {
  title: string;
  titleClassName: string;
  className: string;
  output: string[];
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  lineBackground: string;
}

function LogPreview({
  title,
  titleClassName,
  className,
  output,
  backgroundColor,
  textColor,
  borderColor,
  lineBackground,
}: LogPreviewProps) {
  const previewStyle = borderColor
    ? { backgroundColor, color: textColor, borderColor }
    : { backgroundColor, color: textColor };

  return (
    <div className="relative overflow-hidden">
      <div className={className} style={previewStyle}>
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/20 to-transparent z-10 flex items-center justify-center">
          <span className={titleClassName}>{title}</span>
        </div>
        <div className="pt-8 space-y-1 overflow-hidden h-64 relative">
          {output.map((line, index) => (
            <PreviewLine
              key={index}
              line={line}
              index={index}
              backgroundColor={lineBackground}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingThemePreview({ themeName }: ThemePreviewCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">{formatThemeName(themeName)}</CardTitle>
        <CardDescription>Loading theme...</CardDescription>
      </CardHeader>
    </Card>
  );
}

interface ThemePreviewLayoutProps {
  themeName: string;
  terminalOutput: string[];
  browserOutput: string[];
}

function ThemePreviewLayout({
  themeName,
  terminalOutput,
  browserOutput,
}: ThemePreviewLayoutProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{formatThemeName(themeName)}</CardTitle>
        <CardDescription>Click to copy theme name</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LogPreview
          title="Terminal"
          titleClassName="text-sm font-medium text-white/60 uppercase tracking-wider"
          className="terminal-preview rounded-md border border-slate-700 p-4 font-mono text-xs relative"
          output={terminalOutput}
          backgroundColor={getThemeBackground(themeName, "terminal")}
          textColor={getThemeTextColor(themeName)}
          lineBackground="rgba(0,0,0,0.2)"
        />
        <LogPreview
          title="Browser"
          titleClassName="text-sm font-medium opacity-60 uppercase tracking-wider"
          className="browser-preview rounded-md border p-4 font-mono text-xs relative"
          output={browserOutput}
          backgroundColor={getThemeBackground(themeName, "browser")}
          textColor={getThemeTextColor(themeName)}
          borderColor={getThemeBorderColor(themeName)}
          lineBackground="rgba(0,0,0,0.05)"
        />
      </CardContent>
    </Card>
  );
}

export function ThemePreviewCard({ themeName }: ThemePreviewCardProps) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [browserOutput, setBrowserOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    try {
      const preview = buildThemePreview(themeName);
      if (!preview) {
        console.error(`Theme "${themeName}" not found`);
        setIsLoading(false);
        return;
      }

      setTerminalOutput(preview.terminalOutput);
      setBrowserOutput(preview.browserOutput);
    } catch (error) {
      console.error(`Error loading theme ${themeName}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [themeName]);

  if (isLoading) {
    return <LoadingThemePreview themeName={themeName} />;
  }

  return (
    <ThemePreviewLayout
      themeName={themeName}
      terminalOutput={terminalOutput}
      browserOutput={browserOutput}
    />
  );
}
