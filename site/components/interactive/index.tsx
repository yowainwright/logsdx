"use client";

import React, { useState, useEffect } from "react";
import { CodeBlock } from "../codeblock";
import { Card, CardContent } from "@/components/ui/card";
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

export function InteractiveExamplesSection() {
  const [selectedTheme, setSelectedTheme] = useState("GitHub");
  const [colorMode, setColorMode] = useState<ColorMode>("system");
  const [effectiveMode, setEffectiveMode] = useState<"light" | "dark">("dark");

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
          <h2 className="mb-12 text-center text-4xl font-bold">
            Interactive Theme Preview
          </h2>

          {/* Theme Controls */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Theme Selector */}
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

            {/* Color Mode Toggle */}
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

          {/* Live Preview */}
          <Card className="mb-12 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Terminal Preview */}
                <div className="border-b lg:border-b-0 lg:border-r">
                  <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-gray-400 text-sm ml-2">Terminal</span>
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
                </div>

                {/* Browser Console Preview */}
                <div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Browser Console
                    </span>
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Examples */}
          <div className="space-y-12">
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-center">
                Quick Integration
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 font-medium">Basic Usage</h4>
                  <CodeBlock theme={currentThemeName} language="javascript">
                    {`import { getLogsDX } from 'logsdx'

// Initialize with selected theme
const logger = getLogsDX('${currentThemeName}')

// Process your logs
console.log(logger.processLine('[INFO] Server started'))
console.log(logger.processLine('[ERROR] Connection failed'))
console.log(logger.processLine('[SUCCESS] Deploy complete'))`}
                  </CodeBlock>
                </div>

                <div>
                  <h4 className="mb-3 font-medium">Auto Theme Detection</h4>
                  <CodeBlock theme={currentThemeName} language="javascript">
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
                </div>
              </div>
            </div>

            {/* Popular Logger Integration */}
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-center">
                Logger Integration Examples
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h4 className="mb-2 font-medium">Winston</h4>
                  <CodeBlock theme={currentThemeName} language="javascript">
                    {`import winston from 'winston'
import { getLogsDX } from 'logsdx'

const logsDX = getLogsDX('${currentThemeName}')

const logger = winston.createLogger({
  format: winston.format.printf(info => {
    return logsDX.processLine(info.message)
  })
})`}
                  </CodeBlock>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Pino</h4>
                  <CodeBlock theme={currentThemeName} language="javascript">
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
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Console Override</h4>
                  <CodeBlock theme={currentThemeName} language="javascript">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
