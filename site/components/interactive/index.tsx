"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import type { ThemeConfig, ThemePair, ColorMode } from "./types";

// Sample log messages to demonstrate styling
const SAMPLE_LOGS = [
  "[2024-01-15 10:23:45] INFO: Server started on port 3000",
  "GET /api/users 200 OK (123ms)",
  "POST /api/auth/login 401 Unauthorized",
  "WARN: Memory usage high: 85% (1.7GB/2GB)",
  "[ERROR] Database connection failed: ECONNREFUSED 127.0.0.1:5432",
  "DEBUG: SQL Query executed in 45ms",
  "✓ All tests passed (42 tests, 0 failures)",
  "CRITICAL: System shutdown initiated",
  "SUCCESS: Deployment completed to production",
  "TODO: Refactor authentication module",
  "Processing batch job... [████████████████████] 100%",
  "🚀 Application ready at http://localhost:3000",
];

// Theme configurations with light/dark pairs
const THEME_PAIRS: Record<string, ThemePair> = {
  GitHub: { light: "github-light", dark: "github-dark" },
  Solarized: { light: "solarized-light", dark: "solarized-dark" },
  Dracula: { light: "dracula", dark: "dracula" }, // Dracula is dark-only
  Nord: { light: "nord", dark: "nord" }, // Nord is dark-only
  Monokai: { light: "monokai", dark: "monokai" }, // Monokai is dark-only
  "Oh My Zsh": { light: "oh-my-zsh", dark: "oh-my-zsh" }, // OMZ is dark-only
};

// Get theme colors and styling
const getThemeStyles = (themeName: string): ThemeConfig => {
  const themes: Record<string, ThemeConfig> = {
    "github-light": {
      bg: "#ffffff",
      headerBg: "#f6f8fa",
      text: "#1f2328",
      border: "#d1d9e0",
      colors: {
        info: "#0969da",
        warn: "#fb8500",
        error: "#cf222e",
        success: "#1f883d",
        debug: "#8250df",
        critical: "#a40e26",
      },
    },
    "github-dark": {
      bg: "#0d1117",
      headerBg: "#161b22",
      text: "#e6edf3",
      border: "#30363d",
      colors: {
        info: "#58a6ff",
        warn: "#f0883e",
        error: "#f85149",
        success: "#3fb950",
        debug: "#a5a5ff",
        critical: "#ff6b6b",
      },
    },
    "solarized-light": {
      bg: "#fdf6e3",
      headerBg: "#eee8d5",
      text: "#657b83",
      border: "#eee8d5",
      colors: {
        info: "#268bd2",
        warn: "#cb4b16",
        error: "#dc322f",
        success: "#859900",
        debug: "#6c71c4",
        critical: "#d33682",
      },
    },
    "solarized-dark": {
      bg: "#002b36",
      headerBg: "#073642",
      text: "#839496",
      border: "#073642",
      colors: {
        info: "#268bd2",
        warn: "#cb4b16",
        error: "#dc322f",
        success: "#859900",
        debug: "#6c71c4",
        critical: "#d33682",
      },
    },
    dracula: {
      bg: "#282a36",
      headerBg: "#1e1f29",
      text: "#f8f8f2",
      border: "#44475a",
      colors: {
        info: "#8be9fd",
        warn: "#ffb86c",
        error: "#ff5555",
        success: "#50fa7b",
        debug: "#bd93f9",
        critical: "#ff79c6",
      },
    },
    nord: {
      bg: "#2e3440",
      headerBg: "#3b4252",
      text: "#eceff4",
      border: "#4c566a",
      colors: {
        info: "#5e81ac",
        warn: "#d08770",
        error: "#bf616a",
        success: "#a3be8c",
        debug: "#b48ead",
        critical: "#d8dee9",
      },
    },
    monokai: {
      bg: "#272822",
      headerBg: "#3e3d32",
      text: "#f8f8f2",
      border: "#75715e",
      colors: {
        info: "#66d9ef",
        warn: "#fd971f",
        error: "#f92672",
        success: "#a6e22e",
        debug: "#ae81ff",
        critical: "#e6db74",
      },
    },
    "oh-my-zsh": {
      bg: "#2c3e50",
      headerBg: "#34495e",
      text: "#ecf0f1",
      border: "#34495e",
      colors: {
        info: "#3498db",
        warn: "#f39c12",
        error: "#e74c3c",
        success: "#27ae60",
        debug: "#2ecc71",
        critical: "#c0392b",
      },
    },
  };

  return themes[themeName] || themes["github-dark"];
};

// Style individual log lines based on content
const styleLogLine = (log: string, theme: ThemeConfig) => {
  const { colors } = theme;

  // Determine log type and apply color
  if (log.includes("CRITICAL")) {
    return `<span style="color: ${colors.critical}; font-weight: bold;">${log}</span>`;
  } else if (
    log.includes("ERROR") ||
    log.includes("failed") ||
    log.includes("401") ||
    log.includes("Unauthorized")
  ) {
    return `<span style="color: ${colors.error}; font-weight: bold;">${log}</span>`;
  } else if (log.includes("WARN") || log.includes("Memory usage")) {
    return `<span style="color: ${colors.warn}; font-weight: bold;">${log}</span>`;
  } else if (
    log.includes("SUCCESS") ||
    log.includes("✓") ||
    log.includes("🚀") ||
    log.includes("200 OK")
  ) {
    return `<span style="color: ${colors.success};">${log}</span>`;
  } else if (log.includes("DEBUG")) {
    return `<span style="color: ${colors.debug};">${log}</span>`;
  } else if (log.includes("INFO")) {
    return `<span style="color: ${colors.info};">${log}</span>`;
  } else if (log.includes("TODO")) {
    return `<span style="color: ${colors.debug}; text-decoration: underline;">${log}</span>`;
  } else {
    return `<span style="color: ${theme.text};">${log}</span>`;
  }
};

// Code block component with syntax highlighting
function CodeBlock({ children, theme, className = "" }: { children: string; theme: string; className?: string }) {
  const themeStyle = getThemeStyles(theme);

  // Simple syntax highlighting for JavaScript
  const highlightCode = (code: string) => {
    const keywords = ['import', 'from', 'const', 'let', 'var', 'function', 'return', 'export', 'default', 'true', 'false', 'new'];
    const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
    const comments = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)/gm;

    let highlighted = code
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Highlight strings
      .replace(strings, `<span style="color: ${themeStyle.colors.success}">$&</span>`)
      // Highlight comments
      .replace(comments, `<span style="color: ${themeStyle.border}; font-style: italic">$&</span>`);

    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span style="color: ${themeStyle.colors.info}; font-weight: bold">${keyword}</span>`);
    });

    // Highlight function names and properties
    highlighted = highlighted
      .replace(/(\w+)(?=\()/g, `<span style="color: ${themeStyle.colors.warn}">$1</span>`)
      .replace(/\.(\w+)/g, `.<span style="color: ${themeStyle.colors.debug}">$1</span>`);

    return highlighted;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${themeStyle.border}44;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${themeStyle.border}88;
          }
        `
      }} />
      <div
        className={`p-4 font-mono text-sm overflow-auto custom-scrollbar ${className}`}
        style={{
          backgroundColor: themeStyle.bg,
          color: themeStyle.text,
          minHeight: '280px',
        }}
      >
        <pre dangerouslySetInnerHTML={{ __html: highlightCode(children) }} />
      </div>
    </>
  );
}

export function InteractiveExamplesSection() {
  const [selectedTheme, setSelectedTheme] = useState("GitHub");
  const [colorMode, setColorMode] = useState<ColorMode>("system");
  const [effectiveMode, setEffectiveMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const themes = Object.keys(THEME_PAIRS);
    const interval = setInterval(() => {
      setSelectedTheme(current => {
        const currentIndex = themes.indexOf(current);
        return themes[(currentIndex + 1) % themes.length];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Detect system preference
  useEffect(() => {
    const detectMode = () => {
      if (colorMode === "system") {
        const isDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        setEffectiveMode(isDark ? "dark" : "light");
      } else {
        setEffectiveMode(colorMode as "light" | "dark");
      }
    };

    detectMode();

    if (colorMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        setEffectiveMode(e.matches ? "dark" : "light");
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [colorMode]);

  const currentThemePair =
    THEME_PAIRS[selectedTheme as keyof typeof THEME_PAIRS];
  const currentThemeName = currentThemePair[effectiveMode];
  const currentTheme = getThemeStyles(currentThemeName);

  // Check if theme only has dark mode
  const isDarkOnly = currentThemePair.light === currentThemePair.dark;

  return (
    <section id="examples" className="bg-slate-50 dark:bg-slate-900 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-5xl lg:text-6xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Interactive
            </span>{" "}
            Theme Preview
          </h2>
        </div>
      </div>

      <div className="sticky top-16 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-y border-slate-200 dark:border-slate-700 py-4 mb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              {Object.keys(THEME_PAIRS).map((theme) => (
                <Button
                  key={theme}
                  variant={selectedTheme === theme ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTheme(theme)}
                >
                  {theme}
                </Button>
              ))}
            </div>

            {!isDarkOnly && (
              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  variant={colorMode === "light" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setColorMode("light")}
                  className="h-8 w-8"
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={colorMode === "system" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setColorMode("system")}
                  className="h-8 w-8"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={colorMode === "dark" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setColorMode("dark")}
                  className="h-8 w-8"
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Terminal Preview */}
              <div className="overflow-hidden rounded-lg border border-slate-700">
                <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: currentTheme.headerBg }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.7 }}>Terminal</span>
                </div>
                <div
                  className="p-4 font-mono text-sm overflow-auto h-96"
                  style={{
                    backgroundColor: currentTheme.bg,
                    color: currentTheme.text,
                  }}
                >
                  {SAMPLE_LOGS.map((log, i) => (
                    <div
                      key={i}
                      className="leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: styleLogLine(log, currentTheme),
                      }}
                    />
                  ))}
                </div>
                <div className="px-4 py-2 border-t" style={{ backgroundColor: currentTheme.headerBg, borderColor: currentTheme.border }}>
                  <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.6 }}>Theme: {currentThemeName}</span>
                </div>
              </div>

              {/* Browser Console Preview */}
              <div className="overflow-hidden rounded-lg border border-slate-700">
                <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: currentTheme.headerBg }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.7 }}>Browser Console</span>
                </div>
                <div
                  className="p-4 font-mono text-sm overflow-auto h-96"
                  style={{
                    backgroundColor: currentTheme.bg,
                    color: currentTheme.text,
                  }}
                >
                  {SAMPLE_LOGS.map((log, i) => (
                    <div
                      key={i}
                      className="leading-relaxed border-b"
                      style={{ borderColor: currentTheme.border }}
                      dangerouslySetInnerHTML={{
                        __html: styleLogLine(log, currentTheme),
                      }}
                    />
                  ))}
                </div>
                <div className="px-4 py-2 border-t" style={{ backgroundColor: currentTheme.headerBg, borderColor: currentTheme.border }}>
                  <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.6 }}>Theme: {currentThemeName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Examples */}
          <div className="space-y-12">
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-center">
                Quick Integration
              </h3>
              <div className="grid gap-6 md:grid-cols-2 items-stretch">
                <div className="overflow-hidden rounded-lg border border-slate-700 flex flex-col">
                  <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: currentTheme.headerBg }}>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.7 }}>Basic Usage</span>
                  </div>
                  <CodeBlock theme={currentThemeName} className="flex-1">
                    {`import { getLogsDX } from 'logsdx'

// Initialize with selected theme
const logger = getLogsDX('${currentThemeName}')

// Process your logs
console.log(logger.processLine('[INFO] Server started'))
console.log(logger.processLine('[ERROR] Connection failed'))
console.log(logger.processLine('[SUCCESS] Deploy complete'))`}
                  </CodeBlock>
                  <div className="px-4 py-2 border-t" style={{ backgroundColor: currentTheme.headerBg, borderColor: currentTheme.border }}>
                    <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.6 }}>Theme: {currentThemeName}</span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-700 flex flex-col">
                  <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: currentTheme.headerBg }}>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.7 }}>Auto Theme Detection</span>
                  </div>
                  <CodeBlock theme={currentThemeName} className="flex-1">
                    {`import { getLogsDX } from 'logsdx'

// Auto-detect light/dark mode
const logger = getLogsDX({
  theme: '${selectedTheme.toLowerCase()}',
  autoDetect: true, // Uses system preference
  outputFormat: 'ansi' // or 'html' for browser
})

// Your logs will adapt to user's theme preference
logger.log('INFO', 'Adaptive theming enabled')`}
                  </CodeBlock>
                  <div className="px-4 py-2 border-t" style={{ backgroundColor: currentTheme.headerBg, borderColor: currentTheme.border }}>
                    <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.6 }}>Theme: {currentThemeName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Logger Integration */}
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-center">
                Logger Integration Examples
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                <div className="overflow-hidden rounded-lg border border-slate-700 flex flex-col">
                  <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: currentTheme.headerBg }}>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.7 }}>Winston</span>
                  </div>
                  <CodeBlock theme={currentThemeName} className="flex-1">
                    {`import winston from 'winston'
import { getLogsDX } from 'logsdx'

const logsDX = getLogsDX('${currentThemeName}')

const logger = winston.createLogger({
  format: winston.format.printf(info => {
    return logsDX.processLine(info.message)
  })
})`}
                  </CodeBlock>
                  <div className="px-4 py-2 border-t" style={{ backgroundColor: currentTheme.headerBg, borderColor: currentTheme.border }}>
                    <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.6 }}>Theme: {currentThemeName}</span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-700 flex flex-col">
                  <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: currentTheme.headerBg }}>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.7 }}>Pino</span>
                  </div>
                  <CodeBlock theme={currentThemeName} className="flex-1">
                    {`import pino from 'pino'
import { getLogsDX } from 'logsdx'

const logsDX = getLogsDX('${currentThemeName}')

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      customPrettifiers: {
        log: msg => logsDX.processLine(msg)
      }
    }
  }
})`}
                  </CodeBlock>
                  <div className="px-4 py-2 border-t" style={{ backgroundColor: currentTheme.headerBg, borderColor: currentTheme.border }}>
                    <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.6 }}>Theme: {currentThemeName}</span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-700 flex flex-col">
                  <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: currentTheme.headerBg }}>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.7 }}>Console Override</span>
                  </div>
                  <CodeBlock theme={currentThemeName} className="flex-1">
                    {`import { getLogsDX } from 'logsdx'

const logsDX = getLogsDX('${currentThemeName}')

// Override console methods
const originalLog = console.log
console.log = (...args) => {
  const styled = args.map(arg =>
    typeof arg === 'string'
      ? logsDX.processLine(arg)
      : arg
  )
  originalLog(...styled)
}`}
                  </CodeBlock>
                  <div className="px-4 py-2 border-t" style={{ backgroundColor: currentTheme.headerBg, borderColor: currentTheme.border }}>
                    <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.6 }}>Theme: {currentThemeName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}