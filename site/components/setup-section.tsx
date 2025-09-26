"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";

type SetupStep = "install" | "import" | "custom";

interface CodeLine {
  text: string;
  highlight?: boolean;
}

const SETUP_CONTENT = {
  install: {
    title: "Install with your package manager",
    lines: [
      { text: "npm install logsdx", highlight: true },
      { text: "# or" },
      { text: "yarn add logsdx" },
      { text: "# or" },
      { text: "pnpm add logsdx" },
      { text: "# or" },
      { text: "bun add logsdx" },
    ],
    language: "bash",
  },
  import: {
    title: "Import and start logging",
    lines: [
      { text: "import { getLogsDX } from 'logsdx'" },
      { text: "" },
      { text: "// Use a built-in theme", highlight: true },
      { text: "const logger = getLogsDX('dracula')", highlight: true },
      { text: "" },
      { text: "// Terminal output (ANSI)" },
      { text: "console.log(logger.processLine('ERROR: Database connection failed'))" },
      { text: "console.log(logger.processLine('INFO: Server started on port 3000'))" },
      { text: "" },
      { text: "// Browser output (HTML)" },
      { text: "const htmlLogger = getLogsDX('dracula', {" },
      { text: "  outputFormat: 'html'" },
      { text: "})" },
      { text: "const safeHTML = htmlLogger.processLine('ERROR: Critical error occurred')" },
    ],
    language: "javascript",
  },
  custom: {
    title: "Create custom themes",
    lines: [
      { text: "import { createTheme, registerTheme, getLogsDX } from 'logsdx'" },
      { text: "" },
      { text: "const myTheme = createTheme({", highlight: true },
      { text: "  name: 'my-theme',", highlight: true },
      { text: "  colors: {", highlight: true },
      { text: "    primary: '#3b82f6',", highlight: true },
      { text: "    success: '#10b981',", highlight: true },
      { text: "    warning: '#f59e0b',", highlight: true },
      { text: "    error: '#ef4444',", highlight: true },
      { text: "    info: '#06b6d4',", highlight: true },
      { text: "    debug: '#8b5cf6',", highlight: true },
      { text: "  },", highlight: true },
      { text: "  presets: ['logLevels', 'timestamps', 'json'],", highlight: true },
      { text: "})", highlight: true },
      { text: "" },
      { text: "// Register and use the theme" },
      { text: "registerTheme(myTheme)" },
      { text: "const logger = getLogsDX('my-theme')" },
      { text: "" },
      { text: "// Your logs now have consistent styling everywhere" },
      { text: "logger.log('[SUCCESS] Deployment completed')" },
    ],
    language: "javascript",
  },
};

export function SetupSection() {
  const [activeStep, setActiveStep] = useState<SetupStep>("install");
  const [isHovered, setIsHovered] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  // Auto-cycle through steps
  React.useEffect(() => {
    if (isHovered) return;

    const steps: SetupStep[] = ["install", "import", "custom"];
    const interval = setInterval(() => {
      setActiveStep((current) => {
        const currentIndex = steps.indexOf(current);
        const nextStep = steps[(currentIndex + 1) % steps.length];
        setHighlightIndex(0); // Reset highlight when changing steps
        return nextStep;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered]);

  // Animate through highlighted lines
  React.useEffect(() => {
    if (isHovered) return;

    const currentContent = SETUP_CONTENT[activeStep];
    const highlightedLines = currentContent.lines
      .map((line, index) => (line.highlight ? index : null))
      .filter((i) => i !== null) as number[];

    if (highlightedLines.length === 0) return;

    const interval = setInterval(() => {
      setHighlightIndex((prev) => (prev + 1) % highlightedLines.length);
    }, 800);

    return () => clearInterval(interval);
  }, [activeStep, isHovered]);

  const getLineStyle = (lineIndex: number, line: CodeLine) => {
    const currentContent = SETUP_CONTENT[activeStep];
    const highlightedLines = currentContent.lines
      .map((l, i) => (l.highlight ? i : null))
      .filter((i) => i !== null) as number[];

    const isHighlightable = line.highlight;
    const isCurrentlyHighlighted = isHighlightable && highlightedLines[highlightIndex] === lineIndex;

    // When hovering, show all lines normally
    if (isHovered) {
      return {
        opacity: 1,
        background: "transparent",
        transform: "scale(1)",
      };
    }

    // When not hovering, apply spotlight effect
    if (isHighlightable) {
      return {
        opacity: isCurrentlyHighlighted ? 1 : 0.5,
        background: isCurrentlyHighlighted ? "rgba(59, 130, 246, 0.1)" : "transparent",
        transform: isCurrentlyHighlighted ? "scale(1.02)" : "scale(1)",
        borderLeft: isCurrentlyHighlighted ? "3px solid rgb(59, 130, 246)" : "3px solid transparent",
        paddingLeft: "12px",
        marginLeft: "-12px",
      };
    }

    return {
      opacity: 0.4,
      background: "transparent",
      transform: "scale(1)",
    };
  };

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case "bash":
        return "#89e051";
      case "javascript":
        return "#f1e05a";
      default:
        return "#6b7280";
    }
  };

  return (
    <section id="setup" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            {/* Left side - Interactive code display */}
            <div className="relative lg:sticky lg:top-24">
              {/* Step indicator badge */}
              <div className="absolute -top-2 right-4 z-10 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full shadow-lg">
                Step {activeStep === "install" ? "1" : activeStep === "import" ? "2" : "3"} of 3
              </div>

              <Card
                className="overflow-hidden bg-slate-900 border-slate-700 h-fit"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Header with file info */}
                <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{activeStep === "install" ? "terminal" : "app.js"}</span>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getLanguageColor(SETUP_CONTENT[activeStep].language) }}
                      />
                    </div>
                  </div>
                </div>

                {/* Code content with line-by-line spotlight */}
                <div className="p-4 font-mono text-sm">
                  <div className="space-y-0">
                    {SETUP_CONTENT[activeStep].lines.map((line, index) => (
                      <div
                        key={index}
                        className="transition-all duration-300 ease-in-out"
                        style={getLineStyle(index, line)}
                      >
                        <div className="flex">
                          <span className="text-slate-600 select-none pr-4 text-xs" style={{ minWidth: "2rem" }}>
                            {index + 1}
                          </span>
                          <pre className="flex-1">
                            <code
                              className={`${
                                SETUP_CONTENT[activeStep].language === "bash"
                                  ? "text-green-400"
                                  : "text-slate-300"
                              }`}
                              dangerouslySetInnerHTML={{
                                __html: line.text || "&nbsp;",
                              }}
                            />
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status bar */}
                <div className="px-4 pb-3 pt-2 border-t border-slate-700 text-xs">
                  <div className="text-slate-500">
                    {SETUP_CONTENT[activeStep].title}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right side - Quick start description */}
            <div>
              <h2 className="mb-8 text-5xl lg:text-6xl font-bold">
                Quick Start
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  in 30 seconds
                </span>
              </h2>
              <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400">
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Get up and running with logsDx in less than a minute. No
                  configuration needed to start.
                </p>
                <p>
                  logsDx works out of the box with zero configuration. Just
                  install, import, and your logs will look beautiful in both
                  terminal and browser environments.
                </p>

                {/* Setup buttons */}
                <div className="pt-6 space-y-4">
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setActiveStep("install");
                        setHighlightIndex(0);
                      }}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      className={`text-left p-4 rounded-lg border transition-all ${
                        activeStep === "install"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                          : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            activeStep === "install"
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          1
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            Install Package
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Works with npm, yarn, pnpm, or bun
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStep("import");
                        setHighlightIndex(0);
                      }}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      className={`text-left p-4 rounded-lg border transition-all ${
                        activeStep === "import"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                          : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            activeStep === "import"
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          2
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            Import & Use
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Choose from built-in themes or create your own
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStep("custom");
                        setHighlightIndex(0);
                      }}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      className={`text-left p-4 rounded-lg border transition-all ${
                        activeStep === "custom"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                          : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            activeStep === "custom"
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          3
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            Customize Themes
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Match your brand with custom color schemes
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    That's it! Your logs now look identical in terminal and
                    browser, with zero additional configuration.
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