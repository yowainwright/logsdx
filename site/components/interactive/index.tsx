"use client";

import React, { useState, useEffect, useRef } from "react";
import { useThemeProcessor } from "@/hooks/useThemeProcessor";
import { PreviewPane } from "./PreviewPane";
import { ThemeControls } from "./ThemeControls";
import { CodeExample } from "./CodeExample";
import { SAMPLE_LOGS, THEME_PAIRS } from "./constants";
import { THEME_BACKGROUNDS } from "./CodeExample/constants";
import type { ColorMode } from "./types";

export function InteractiveExamplesSection() {
  const [selectedTheme, setSelectedTheme] = useState("GitHub");
  const [colorMode, setColorMode] = useState<ColorMode>("system");
  const [effectiveMode, setEffectiveMode] = useState<"light" | "dark">("dark");
  const autoRotateRef = useRef(true);

  useEffect(() => {
    const themes = Object.keys(THEME_PAIRS);
    const interval = setInterval(() => {
      if (autoRotateRef.current) {
        setSelectedTheme((current) => {
          const currentIndex = themes.indexOf(current);
          return themes[(currentIndex + 1) % themes.length];
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
  const isDarkOnly = currentThemePair.light === currentThemePair.dark;

  const logs = SAMPLE_LOGS;
  const { processedLogs, isLoading } = useThemeProcessor(
    currentThemeName,
    logs,
  );

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    autoRotateRef.current = false;
  };

  const bg =
    THEME_BACKGROUNDS[currentThemeName] || THEME_BACKGROUNDS["github-dark"];
  const htmlLogs = processedLogs.map((p) => p.html);

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

      <ThemeControls
        selectedTheme={selectedTheme}
        colorMode={colorMode}
        isDarkOnly={isDarkOnly}
        onThemeChange={handleThemeChange}
        onColorModeChange={setColorMode}
      />

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PreviewPane
                title="Terminal"
                themeName={currentThemeName}
                logs={htmlLogs}
                backgroundColor={bg.bg}
                headerBg={bg.headerBg}
                borderColor={bg.border}
                isLoading={isLoading}
              />
              <PreviewPane
                title="Browser Console"
                themeName={currentThemeName}
                logs={htmlLogs}
                backgroundColor={bg.bg}
                headerBg={bg.headerBg}
                borderColor={bg.border}
                isLoading={isLoading}
                showBorder
              />
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-center">
                Quick Integration
              </h3>
              <div className="grid gap-6 md:grid-cols-2 items-stretch">
                <CodeExample
                  title="Basic Usage"
                  themeName={currentThemeName}
                  code={`import { getLogsDX } from 'logsdx'

// Initialize with selected theme
const logger = await getLogsDX({ theme: '${currentThemeName}' })

// Process your logs
console.log(logger.processLine('[INFO] Server started'))
console.log(logger.processLine('[ERROR] Connection failed'))
console.log(logger.processLine('[SUCCESS] Deploy complete'))`}
                />
                <CodeExample
                  title="Auto Theme Detection"
                  themeName={currentThemeName}
                  code={`import { getLogsDX } from 'logsdx'

// Auto-detect light/dark mode
const logger = await getLogsDX({
  theme: {
    light: '${currentThemePair.light}',
    dark: '${currentThemePair.dark}'
  },
  autoAdjustTerminal: true
})

// Logs adapt to user's theme preference
console.log(logger.processLine('[INFO] Adaptive theming'))`}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-6 text-2xl font-semibold text-center">
                Logger Integration Examples
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                <CodeExample
                  title="Winston"
                  themeName={currentThemeName}
                  code={`import winston from 'winston'
import { getLogsDX } from 'logsdx'

const logsDX = await getLogsDX({
  theme: '${currentThemeName}'
})

const logger = winston.createLogger({
  format: winston.format.printf(info => {
    return logsDX.processLine(info.message)
  })
})`}
                />
                <CodeExample
                  title="Pino"
                  themeName={currentThemeName}
                  code={`import pino from 'pino'
import { getLogsDX } from 'logsdx'

const logsDX = await getLogsDX({
  theme: '${currentThemeName}'
})

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
                />
                <CodeExample
                  title="Console Override"
                  themeName={currentThemeName}
                  code={`import { getLogsDX } from 'logsdx'

const logsDX = await getLogsDX({
  theme: '${currentThemeName}'
})

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
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
