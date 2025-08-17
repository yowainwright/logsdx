"use client";

import React, { useState, useEffect } from "react";
import {
  getLogsDX,
  getAllThemes,
  getTheme,
  detectColorScheme,
  detectHighContrast,
  detectReducedMotion,
} from "logsdx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const THEME_PAIRS = {
  GitHub: { light: "github-light", dark: "github-dark" },
  Solarized: { light: "solarized-light", dark: "solarized-dark" },
  Dracula: { light: "github-light", dark: "dracula" },
  Nord: { light: "solarized-light", dark: "nord" },
  Monokai: { light: "github-light", dark: "monokai" },
  "Terminal Classic": { light: "solarized-light", dark: "oh-my-zsh" },
  "High Contrast": { light: "github-light", dark: "dracula" },
  Minimal: { light: "solarized-light", dark: "github-dark" },
};

// Enhanced sample logs with more realistic examples
const sampleLogs = [
  "INFO: Application started successfully on port 3000",
  "WARN: Memory usage at 85% - consider scaling",
  "ERROR: Database connection failed: ECONNREFUSED localhost:5432",
  "DEBUG: Processing user request id=abc123 method=POST /api/users",
  "SUCCESS: All tests passed ✓ (127 tests, 0 failures)",
  "[2024-01-15 10:23:45.123] GET /api/users 200 OK (123ms)",
  '{"level":"error","message":"Authentication failed","user":"john.doe@example.com","timestamp":"2024-01-15T10:23:45Z","trace_id":"abc-123-def"}',
  "PERFORMANCE: Cache hit ratio: 92.5% | Memory: 256MB | CPU: 45% | Requests/sec: 1,247",
  "TRACE: SQL Query executed: SELECT * FROM users WHERE active = true LIMIT 100",
  "FATAL: System shutdown initiated - critical error in payment processor",
  "INFO: Scheduled backup completed successfully (2.3GB compressed)",
  "WARN: Rate limit exceeded for IP 192.168.1.100 - throttling requests",
];

interface ProcessedLog {
  original: string;
  ansi: string;
  html: string;
}

interface ThemeColors {
  background: string;
  text: string;
  mode: "light" | "dark";
}

export function AdaptiveThemeDemo() {
  const [selectedPair, setSelectedPair] = useState("Dracula");
  const [isDark, setIsDark] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const [logs, setLogs] = useState<ProcessedLog[]>([]);
  const [outputFormat, setOutputFormat] = useState<"ansi" | "html">("ansi");
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    background: "#000000",
    text: "#ffffff",
    mode: "dark",
  });
  const [systemPreferences, setSystemPreferences] = useState({
    colorScheme: "no-preference" as "light" | "dark" | "no-preference",
    highContrast: false,
    reducedMotion: false,
  });

  // Enhanced system preference detection using logsdx utilities
  useEffect(() => {
    const updateSystemPreferences = () => {
      setSystemPreferences({
        colorScheme: detectColorScheme(),
        highContrast: detectHighContrast(),
        reducedMotion: detectReducedMotion(),
      });
    };

    // Initial detection
    updateSystemPreferences();

    if (!autoDetect) return;

    // Set initial dark mode based on system preference
    setIsDark(detectColorScheme() === "dark");

    // Listen for system preference changes
    const mediaQueries = [
      window.matchMedia("(prefers-color-scheme: dark)"),
      window.matchMedia("(prefers-contrast: high)"),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
    ];

    const handler = () => {
      updateSystemPreferences();
      if (autoDetect) {
        setIsDark(detectColorScheme() === "dark");
      }
    };

    mediaQueries.forEach((mq) => mq.addEventListener("change", handler));
    return () =>
      mediaQueries.forEach((mq) => mq.removeEventListener("change", handler));
  }, [autoDetect]);

  // Process logs with actual logsdx when theme changes
  useEffect(() => {
    const pair = THEME_PAIRS[selectedPair as keyof typeof THEME_PAIRS];
    const themeName = isDark ? pair.dark : pair.light;

    try {
      // Get theme information for colors
      const themeInfo = getTheme(themeName);
      const allThemes = getAllThemes();

      // Extract colors from theme schema or fallback to defaults
      let backgroundColor = "#000000";
      let textColor = "#ffffff";
      let mode: "light" | "dark" = "dark";

      if (themeInfo && themeInfo.mode) {
        mode = themeInfo.mode as "light" | "dark";
      }

      // Try to get colors from the theme configuration
      if (allThemes[themeName]) {
        const theme = allThemes[themeName];
        // Check if theme has color information in schema
        if (theme.schema?.defaultStyle?.color) {
          textColor = theme.schema.defaultStyle.color;
        }

        // Set background based on theme mode and specific theme patterns
        if (mode === "light") {
          backgroundColor = themeName.includes("github")
            ? "#ffffff"
            : themeName.includes("solarized")
              ? "#fdf6e3"
              : themeName.includes("oh-my-zsh")
                ? "#f8f8f8"
                : "#ffffff";
          textColor = textColor === "#ffffff" ? "#000000" : textColor;
        } else {
          backgroundColor = themeName.includes("github")
            ? "#0d1117"
            : themeName.includes("solarized")
              ? "#002b36"
              : themeName.includes("dracula")
                ? "#282a36"
                : themeName.includes("nord")
                  ? "#2e3440"
                  : themeName.includes("monokai")
                    ? "#272822"
                    : themeName.includes("oh-my-zsh")
                      ? "#2c3e50"
                      : "#1a1a1a";
        }
      }

      setThemeColors({ background: backgroundColor, text: textColor, mode });

      // Create logger instances - use HTML for both since we need to render in browser
      const terminalLogger = getLogsDX({
        theme: themeName,
        outputFormat: "html",
      });
      const browserLogger = getLogsDX({
        theme: themeName,
        outputFormat: "html",
      });

      if (terminalLogger && browserLogger) {
        const processedLogs = sampleLogs.map((log) => ({
          original: log,
          ansi: terminalLogger.processLine(log), // This is actually HTML formatted for terminal display
          html: browserLogger.processLine(log), // This is HTML formatted for browser display
        }));

        setLogs(processedLogs);
      } else {
        throw new Error("Failed to create loggers");
      }
    } catch (error) {
      console.warn("Failed to process logs with theme:", themeName, error);
      // Fallback to original logs if processing fails
      const fallbackLogs = sampleLogs.map((log) => ({
        original: log,
        ansi: log,
        html: log,
      }));
      setLogs(fallbackLogs);

      // Set fallback theme colors
      setThemeColors({
        background: isDark ? "#1a1a1a" : "#ffffff",
        text: isDark ? "#ffffff" : "#000000",
        mode: isDark ? "dark" : "light",
      });
    }
  }, [selectedPair, isDark]);

  const currentTheme =
    THEME_PAIRS[selectedPair as keyof typeof THEME_PAIRS][
      isDark ? "dark" : "light"
    ];

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle>Adaptive Theme Demo</CardTitle>
        <CardDescription>
          See how themes adapt to your system preferences with real logsdx
          processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme Pair</label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {Object.keys(THEME_PAIRS).map((pair) => (
                <option key={pair} value={pair}>
                  {pair}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Output Format</label>
            <select
              value={outputFormat}
              onChange={(e) =>
                setOutputFormat(e.target.value as "ansi" | "html")
              }
              className="px-3 py-2 border rounded-md"
            >
              <option value="ansi">Terminal</option>
              <option value="html">Browser</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Auto-detect</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoDetect}
                onChange={(e) => setAutoDetect(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-muted-foreground">
                Use system preference
              </span>
            </div>
          </div>

          {!autoDetect && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsDark(false)}
                  className={`px-3 py-2 rounded-md ${
                    !isDark
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setIsDark(true)}
                  className={`px-3 py-2 rounded-md ${
                    isDark
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced System State */}
        <div className="p-4 bg-secondary rounded-md space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Current Theme:</span>
            <span className="font-mono">{currentTheme}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Output Format:</span>
            <span className="font-mono">{outputFormat.toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">System Color Scheme:</span>
            <span className="font-mono">{systemPreferences.colorScheme}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">High Contrast:</span>
            <span className="font-mono">
              {systemPreferences.highContrast ? "enabled" : "disabled"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Reduced Motion:</span>
            <span className="font-mono">
              {systemPreferences.reducedMotion ? "enabled" : "disabled"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Auto-detect Status:</span>
            <span className="font-mono">
              {autoDetect ? "active" : "manual"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Theme Background:</span>
            <span
              className="font-mono"
              style={{ color: themeColors.background }}
            >
              {themeColors.background}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Theme Text Color:</span>
            <span className="font-mono" style={{ color: themeColors.text }}>
              {themeColors.text}
            </span>
          </div>
        </div>

        {/* Enhanced Live Preview with Dual Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Live Preview</h3>
            <div className="text-xs text-muted-foreground">
              Showing {outputFormat === "ansi" ? "Terminal" : "Browser"} output
              with real logsdx processing (both use HTML rendering for browser
              compatibility)
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Terminal Preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">Terminal</h4>
                <button
                  onClick={() => setOutputFormat("ansi")}
                  className={`px-2 py-1 text-xs rounded ${
                    outputFormat === "ansi"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  View
                </button>
              </div>
              <div
                className="p-4 rounded-md border font-mono text-sm space-y-1 overflow-x-auto terminal-preview"
                style={{
                  backgroundColor: themeColors.background,
                  color: themeColors.text,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                }}
              >
                {logs.map((log, i) => (
                  <div key={`terminal-${i}`} className="whitespace-pre-wrap">
                    <div dangerouslySetInnerHTML={{ __html: log.ansi }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Browser Preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">Browser</h4>
                <button
                  onClick={() => setOutputFormat("html")}
                  className={`px-2 py-1 text-xs rounded ${
                    outputFormat === "html"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  View
                </button>
              </div>
              <div
                className="p-4 rounded-md border font-mono text-sm space-y-1 overflow-x-auto browser-preview"
                style={{
                  backgroundColor: themeColors.background,
                  color: themeColors.text,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                }}
              >
                {logs.map((log, i) => (
                  <div
                    key={`browser-${i}`}
                    dangerouslySetInnerHTML={{ __html: log.html }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Current Output Focus */}
          <div className="p-4 rounded-md border-2 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">
                Current Output:{" "}
                {outputFormat === "ansi" ? "Terminal" : "Browser"}
              </h4>
              <span className="text-xs text-muted-foreground">
                Theme: {currentTheme}
              </span>
            </div>
            <div
              className="p-3 rounded font-mono text-sm space-y-1 overflow-x-auto border"
              style={{
                backgroundColor: themeColors.background,
                color: themeColors.text,
                fontFamily:
                  'ui-monospace, SFMono-Regular, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            >
              {logs.map((log, i) => (
                <div key={`current-${i}`} className="whitespace-pre-wrap">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: outputFormat === "ansi" ? log.ansi : log.html,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CSS Variables */}
        <div>
          <h3 className="mb-2 font-medium">CSS Custom Properties</h3>
          <pre className="p-4 bg-secondary rounded-md text-xs overflow-x-auto">
            {`/* Use these in your CSS */
.log-container {
  background: var(--logsdx-bg);
  color: var(--logsdx-fg);
}

.log-error {
  color: var(--logsdx-error);
}

.log-warning {
  color: var(--logsdx-warning);
}

.log-success {
  color: var(--logsdx-success);
}`}
          </pre>
        </div>

        {/* Enhanced Integration Examples */}
        <div className="space-y-4">
          <h3 className="font-medium">Integration Examples</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Basic Usage */}
            <div>
              <h4 className="text-sm font-medium mb-2">
                Basic Adaptive Logger
              </h4>
              <pre className="p-3 bg-secondary rounded-md text-xs overflow-x-auto">
                {`import { 
  getLogsDX, 
  detectColorScheme,
  AdaptiveLogger 
} from 'logsdx'

// Auto-detect system preference
const scheme = detectColorScheme()
const theme = scheme === 'dark' ? 'github-dark' : 'github-light'

// Create logger with detected theme
const logger = getLogsDX({ theme })

// Process logs
logger.processLine('INFO: Theme auto-detected')
`}
              </pre>
            </div>

            {/* Advanced Usage */}
            <div>
              <h4 className="text-sm font-medium mb-2">
                Advanced Adaptive Features
              </h4>
              <pre className="p-3 bg-secondary rounded-md text-xs overflow-x-auto">
                {`import { 
  AdaptiveLogger,
  detectHighContrast,
  detectReducedMotion 
} from 'logsdx'

// Create adaptive logger with preferences
const logger = new AdaptiveLogger('github', {
  outputFormat: 'html',
  respectHighContrast: detectHighContrast()
})

// Listen for system changes
logger.onThemeChange((newTheme) => {
  console.log('Switched to:', newTheme)
})

// Process with current adaptive theme
logger.processLine('SUCCESS: Adaptive theming active')
`}
              </pre>
            </div>
          </div>

          {/* Current Demo Code */}
          <div>
            <h4 className="text-sm font-medium mb-2">
              Current Demo Configuration
            </h4>
            <pre className="p-3 bg-secondary rounded-md text-xs overflow-x-auto">
              {`// Current settings from this demo:
const config = {
  selectedPair: "${selectedPair}",
  currentTheme: "${currentTheme}",
  outputFormat: "${outputFormat}",
  autoDetect: ${autoDetect},
  systemPreferences: {
    colorScheme: "${systemPreferences.colorScheme}",
    highContrast: ${systemPreferences.highContrast},
    reducedMotion: ${systemPreferences.reducedMotion}
  }
}

// Recreate this setup:
const logger = getLogsDX({ 
  theme: "${currentTheme}",
  outputFormat: "${outputFormat}"
})
`}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
