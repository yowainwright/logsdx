"use client";

import React, { useState, useEffect, useRef } from "react";
import { useThemeProcessor } from "@/hooks/useThemeProcessor";
import { PreviewPane } from "./PreviewPane";
import { ThemeControls } from "./ThemeControls";
import { CodeExample } from "./CodeExample";
import { SAMPLE_LOGS, THEME_PAIRS } from "./constants";
import { THEME_BACKGROUNDS } from "./CodeExample/constants";
import type { ColorMode } from "./types";

function useAutoRotateTheme() {
  const [selectedTheme, setSelectedTheme] = useState("GitHub");
  const autoRotateRef = useRef(true);

  useEffect(() => {
    const themes = Object.keys(THEME_PAIRS);
    const interval = setInterval(() => {
      if (!autoRotateRef.current) return;
      setSelectedTheme((current) => {
        const currentIndex = themes.indexOf(current);
        const nextIndex = (currentIndex + 1) % themes.length;
        return themes[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    autoRotateRef.current = false;
  };

  return { handleThemeChange, selectedTheme };
}

function useEffectiveMode(colorMode: ColorMode) {
  const [effectiveMode, setEffectiveMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (colorMode !== "system") {
      setEffectiveMode(colorMode);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const setMode = (isDark: boolean) =>
      setEffectiveMode(isDark ? "dark" : "light");
    const handler = (event: MediaQueryListEvent) => setMode(event.matches);
    setMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [colorMode]);

  return effectiveMode;
}

function InteractiveHeading() {
  return (
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
  );
}

interface CodeExampleConfig {
  title: string;
  code: string;
}

function CodeExampleGrid({
  examples,
  gridClassName = "grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch",
  themeName,
}: {
  examples: CodeExampleConfig[];
  gridClassName?: string;
  themeName: string;
}) {
  return (
    <div className={gridClassName}>
      {examples.map((example) => (
        <CodeExample
          key={example.title}
          title={example.title}
          themeName={themeName}
          code={example.code}
        />
      ))}
    </div>
  );
}

function PreviewGrid({
  background,
  isLoading,
  logs,
  themeName,
}: {
  background: { bg: string; border: string; headerBg: string };
  isLoading: boolean;
  logs: string[];
  themeName: string;
}) {
  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PreviewPane
          title="Terminal"
          themeName={themeName}
          logs={logs}
          backgroundColor={background.bg}
          headerBg={background.headerBg}
          borderColor={background.border}
          isLoading={isLoading}
        />
        <PreviewPane
          title="Browser Console"
          themeName={themeName}
          logs={logs}
          backgroundColor={background.bg}
          headerBg={background.headerBg}
          borderColor={background.border}
          isLoading={isLoading}
          showBorder
        />
      </div>
    </div>
  );
}

function getQuickExamples(
  themeName: string,
  themePair: { light: string; dark: string },
): CodeExampleConfig[] {
  return [
    {
      title: "Basic Usage",
      code: `import { getLogsDX } from 'logsdx'

// Initialize with selected theme
const logger = await getLogsDX({ theme: '${themeName}' })

// Process your logs
console.log(logger.processLine('[INFO] Server started'))
console.log(logger.processLine('[ERROR] Connection failed'))
console.log(logger.processLine('[SUCCESS] Deploy complete'))`,
    },
    {
      title: "Auto Theme Detection",
      code: `import { getLogsDX } from 'logsdx'

// Auto-detect light/dark mode
const logger = await getLogsDX({
  theme: {
    light: '${themePair.light}',
    dark: '${themePair.dark}'
  },
  autoAdjustTerminal: true
})

// Logs adapt to user's theme preference
console.log(logger.processLine('[INFO] Adaptive theming'))`,
    },
  ];
}

function getWinstonExample(themeName: string): CodeExampleConfig {
  return {
    title: "Winston",
    code: `import winston from 'winston'
import { getLogsDX } from 'logsdx'

const logsDX = await getLogsDX({
  theme: '${themeName}'
})

const logger = winston.createLogger({
  format: winston.format.printf(info => {
    return logsDX.processLine(info.message)
  })
})`,
  };
}

function getPinoExample(themeName: string): CodeExampleConfig {
  return {
    title: "Pino",
    code: `import pino from 'pino'
import { getLogsDX } from 'logsdx'

const logsDX = await getLogsDX({
  theme: '${themeName}'
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
})`,
  };
}

function getConsoleExample(themeName: string): CodeExampleConfig {
  return {
    title: "Console Override",
    code: `import { getLogsDX } from 'logsdx'

const logsDX = await getLogsDX({
  theme: '${themeName}'
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
}`,
  };
}

function getLoggerExamples(themeName: string): CodeExampleConfig[] {
  return [
    getWinstonExample(themeName),
    getPinoExample(themeName),
    getConsoleExample(themeName),
  ];
}

function QuickIntegration({
  themeName,
  themePair,
}: {
  themeName: string;
  themePair: { light: string; dark: string };
}) {
  const examples = getQuickExamples(themeName, themePair);

  return (
    <div>
      <h3 className="mb-6 text-2xl font-semibold text-center">
        Quick Integration
      </h3>
      <CodeExampleGrid
        examples={examples}
        gridClassName="grid gap-6 md:grid-cols-2 items-stretch"
        themeName={themeName}
      />
    </div>
  );
}

function LoggerIntegration({ themeName }: { themeName: string }) {
  const examples = getLoggerExamples(themeName);

  return (
    <div>
      <h3 className="mb-6 text-2xl font-semibold text-center">
        Logger Integration Examples
      </h3>
      <CodeExampleGrid examples={examples} themeName={themeName} />
    </div>
  );
}

function IntegrationExamples({
  themeName,
  themePair,
}: {
  themeName: string;
  themePair: { light: string; dark: string };
}) {
  return (
    <div className="space-y-12">
      <QuickIntegration themeName={themeName} themePair={themePair} />
      <LoggerIntegration themeName={themeName} />
    </div>
  );
}

function InteractivePreview({
  background,
  isLoading,
  logs,
  themeName,
  themePair,
}: {
  background: { bg: string; border: string; headerBg: string };
  isLoading: boolean;
  logs: string[];
  themeName: string;
  themePair: { light: string; dark: string };
}) {
  return (
    <div className="container mx-auto px-4">
      <div className="mx-auto max-w-6xl">
        <PreviewGrid
          background={background}
          isLoading={isLoading}
          logs={logs}
          themeName={themeName}
        />
        <IntegrationExamples themeName={themeName} themePair={themePair} />
      </div>
    </div>
  );
}

export function InteractiveExamplesSection() {
  const [colorMode, setColorMode] = useState<ColorMode>("system");
  const { handleThemeChange, selectedTheme } = useAutoRotateTheme();
  const effectiveMode = useEffectiveMode(colorMode);

  const currentThemePair =
    THEME_PAIRS[selectedTheme as keyof typeof THEME_PAIRS];
  const currentThemeName = currentThemePair[effectiveMode];
  const isDarkOnly = currentThemePair.light === currentThemePair.dark;

  const { processedLogs, isLoading } = useThemeProcessor(
    currentThemeName,
    SAMPLE_LOGS,
  );

  const bg =
    THEME_BACKGROUNDS[currentThemeName] || THEME_BACKGROUNDS["github-dark"];
  const htmlLogs = processedLogs.map((p) => p.html);

  return (
    <section id="examples" className="bg-slate-50 dark:bg-slate-900 py-24">
      <InteractiveHeading />
      <ThemeControls
        selectedTheme={selectedTheme}
        colorMode={colorMode}
        isDarkOnly={isDarkOnly}
        onThemeChange={handleThemeChange}
        onColorModeChange={setColorMode}
      />
      <InteractivePreview
        background={bg}
        isLoading={isLoading}
        logs={htmlLogs}
        themeName={currentThemeName}
        themePair={currentThemePair}
      />
    </section>
  );
}
