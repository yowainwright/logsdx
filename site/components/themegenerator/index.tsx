"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Copy,
  RefreshCw,
} from "lucide-react";
import { createSimpleTheme, registerTheme, getLogsDX } from "logsdx";
import type { ThemeColors, ThemeConfig } from "./types";
import {
  DEFAULT_DARK_COLORS,
  DEFAULT_LIGHT_COLORS,
  PRESET_OPTIONS,
  SAMPLE_LOGS,
} from "./constants";
import { generateThemeCode } from "./utils";

const STORAGE_KEY = "logsdx-custom-theme";

export function CustomThemeCreator() {
  // Load saved theme from localStorage or use defaults
  const [themeName, setThemeName] = useState("dracula-custom");
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_DARK_COLORS);
  const [selectedPresets, setSelectedPresets] = useState<string[]>([
    "logLevels",
    "numbers",
    "strings",
    "brackets",
  ]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [uniqueThemeName] = useState(() => `${themeName}-${Date.now()}`);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize with empty array, will be populated by useEffect
  const [processedLogs, setProcessedLogs] = useState<string[]>([]);
  const [liveLogIndex, setLiveLogIndex] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.themeName) setThemeName(parsed.themeName);
        if (parsed.colors) setColors(parsed.colors);
        if (parsed.selectedPresets) setSelectedPresets(parsed.selectedPresets);
      } catch (e) {
        console.error("Failed to load saved theme:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    const themeData = {
      themeName,
      colors,
      selectedPresets,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themeData));
  }, [themeName, colors, selectedPresets, isLoaded]);

  useEffect(() => {
    const processLogs = () => {
      try {
        const tempThemeName = `logsdx-theme-preview`;

        const customTheme = createSimpleTheme(tempThemeName, colors, {
          mode: "dark",
          presets: selectedPresets,
        });

        registerTheme(customTheme);

        const htmlLogsDX = getLogsDX({
          theme: tempThemeName,
          outputFormat: "html",
          htmlStyleFormat: "css",
          escapeHtml: false,
        }) as unknown as { processLine: (line: string) => string };

        const processed = SAMPLE_LOGS.map((log) => {
          try {
            return htmlLogsDX.processLine(log.text);
          } catch (e) {
            console.error("LogsDX processing failed:", log.text, e);
            // Return styled fallback using all theme colors
            let styledText = log.text;

            // Apply colors based on selected presets
            if (selectedPresets.includes("logLevels")) {
              if (log.text.includes("[ERROR]") || log.text.includes("ERROR:")) {
                styledText = styledText.replace(
                  /(\[ERROR\]|ERROR:)/g,
                  `<span style="color: ${colors.error}; font-weight: bold;">$1</span>`,
                );
              }
              if (log.text.includes("[WARN]") || log.text.includes("WARN:")) {
                styledText = styledText.replace(
                  /(\[WARN\]|WARN:)/g,
                  `<span style="color: ${colors.warning}; font-weight: bold;">$1</span>`,
                );
              }
              if (
                log.text.includes("[SUCCESS]") ||
                log.text.includes("SUCCESS:")
              ) {
                styledText = styledText.replace(
                  /(\[SUCCESS\]|SUCCESS:)/g,
                  `<span style="color: ${colors.success}; font-weight: bold;">$1</span>`,
                );
              }
              if (log.text.includes("[INFO]") || log.text.includes("INFO:")) {
                styledText = styledText.replace(
                  /(\[INFO\]|INFO:)/g,
                  `<span style="color: ${colors.info}; font-weight: bold;">$1</span>`,
                );
              }
              if (log.text.includes("[DEBUG]") || log.text.includes("DEBUG:")) {
                styledText = styledText.replace(
                  /(\[DEBUG\]|DEBUG:)/g,
                  `<span style="color: ${colors.debug}; font-weight: bold;">$1</span>`,
                );
              }
            }

            // Highlight numbers
            if (selectedPresets.includes("numbers")) {
              styledText = styledText.replace(
                /\b(\d+\.?\d*)\b/g,
                `<span style="color: ${colors.accent};">$1</span>`,
              );
            }

            // Highlight strings
            if (selectedPresets.includes("strings")) {
              styledText = styledText.replace(
                /(['"])([^'"]*)\1/g,
                `<span style="color: ${colors.secondary};">$1$2$1</span>`,
              );
            }

            // Highlight brackets
            if (selectedPresets.includes("brackets")) {
              styledText = styledText.replace(
                /[[\]{}()<>]/g,
                `<span style="color: ${colors.highlight};">$&</span>`,
              );
            }

            // Highlight booleans and null
            if (selectedPresets.includes("booleans")) {
              styledText = styledText.replace(
                /\b(true|false|null|undefined)\b/g,
                `<span style="color: ${colors.primary};">$1</span>`,
              );
            }

            // URLs
            if (selectedPresets.includes("urls")) {
              styledText = styledText.replace(
                /(https?:\/\/[^\s]+)/g,
                `<span style="color: ${colors.accent};">$1</span>`,
              );
            }

            // Paths
            if (selectedPresets.includes("paths")) {
              styledText = styledText.replace(
                /(\/[\w\-./]+|[A-Z]:\\[\w\-.\\]+)/g,
                `<span style="color: ${colors.muted};">$1</span>`,
              );
            }

            // Timestamps
            if (selectedPresets.includes("timestamps")) {
              styledText = styledText.replace(
                /(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[\w.:]*)/g,
                `<span style="color: ${colors.info};">$1</span>`,
              );
            }

            // Semantic versions
            if (selectedPresets.includes("semantic")) {
              styledText = styledText.replace(
                /\bv?(\d+\.\d+\.\d+)\b/g,
                `<span style="color: ${colors.primary};">$&</span>`,
              );
            }

            return `<span style="color: ${colors.text}">${styledText}</span>`;
          }
        });

        setProcessedLogs(processed);
      } catch (error) {
        console.error("THEME CREATION ERROR:", error);
        // Styled fallback showing all colors
        const fallbackLogs = SAMPLE_LOGS.map((log) => {
          let styledText = log.text;

          // Apply all color categories
          if (log.category === "error" || log.text.includes("[ERROR]")) {
            styledText = `<span style="color: ${colors.error}; font-weight: bold;">${log.text}</span>`;
          } else if (
            log.category === "warning" ||
            log.text.includes("[WARN]")
          ) {
            styledText = `<span style="color: ${colors.warning}; font-weight: bold;">${log.text}</span>`;
          } else if (
            log.category === "success" ||
            log.text.includes("[SUCCESS]")
          ) {
            styledText = `<span style="color: ${colors.success}; font-weight: bold;">${log.text}</span>`;
          } else if (log.category === "info" || log.text.includes("[INFO]")) {
            styledText = `<span style="color: ${colors.info}; font-weight: bold;">${log.text}</span>`;
          } else if (log.category === "debug" || log.text.includes("[DEBUG]")) {
            styledText = `<span style="color: ${colors.debug}; font-weight: bold;">${log.text}</span>`;
          }

          // Apply pattern matching based on selected presets
          // Numbers
          if (selectedPresets.includes("numbers")) {
            styledText = styledText.replace(
              /\b(\d+\.?\d*)\b/g,
              `<span style="color: ${colors.accent};">$1</span>`,
            );
          }

          // Strings
          if (selectedPresets.includes("strings")) {
            styledText = styledText.replace(
              /(['"])([^'"]*)\1/g,
              `<span style="color: ${colors.secondary};">$1$2$1</span>`,
            );
          }

          // Brackets
          if (selectedPresets.includes("brackets")) {
            styledText = styledText.replace(
              /[[\]{}()<>]/g,
              `<span style="color: ${colors.highlight};">$&</span>`,
            );
          }

          // Booleans
          if (selectedPresets.includes("booleans")) {
            styledText = styledText.replace(
              /\b(true|false|null|undefined)\b/g,
              `<span style="color: ${colors.primary};">$1</span>`,
            );
          }

          // URLs
          if (selectedPresets.includes("urls")) {
            styledText = styledText.replace(
              /(https?:\/\/[^\s]+)/g,
              `<span style="color: ${colors.accent};">$1</span>`,
            );
          }

          // Paths
          if (selectedPresets.includes("paths")) {
            styledText = styledText.replace(
              /(\/[\w\-./]+|[A-Z]:\\[\w\-.\\]+)/g,
              `<span style="color: ${colors.muted};">$1</span>`,
            );
          }

          // Timestamps
          if (selectedPresets.includes("timestamps")) {
            styledText = styledText.replace(
              /(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[\w.:]*)/g,
              `<span style="color: ${colors.info};">$1</span>`,
            );
          }

          // Dates
          if (selectedPresets.includes("dates")) {
            styledText = styledText.replace(
              /(\[\d{4}-\d{2}-\d{2}[\s\d:]*\])/g,
              `<span style="color: ${colors.info};">$1</span>`,
            );
          }

          // Semantic versions
          if (selectedPresets.includes("semantic")) {
            styledText = styledText.replace(
              /\bv?(\d+\.\d+\.\d+)\b/g,
              `<span style="color: ${colors.primary};">$&</span>`,
            );
          }

          // JSON keys
          if (selectedPresets.includes("json")) {
            styledText = styledText.replace(
              /(\w+):/g,
              `<span style="color: ${colors.accent};">$1</span>:`,
            );
          }

          // Wrap in text color
          styledText = `<span style="color: ${colors.text}">${styledText}</span>`;

          return styledText;
        });
        setProcessedLogs(fallbackLogs);
      }
    };

    processLogs();
  }, [colors, selectedPresets]);

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handlePresetToggle = (presetId: string) => {
    setSelectedPresets((prev) =>
      prev.includes(presetId)
        ? prev.filter((p) => p !== presetId)
        : [...prev, presetId],
    );
  };

  const resetColors = () => {
    setColors(DEFAULT_DARK_COLORS);
    // Clear saved theme from localStorage
    localStorage.removeItem(STORAGE_KEY);
  };

  const themeConfig: ThemeConfig = useMemo(() => {
    return {
      name: themeName,
      mode: "dark", // Default mode, colors determine actual appearance
      colors,
      presets: selectedPresets,
    };
  }, [themeName, colors, selectedPresets]);

  const copyCode = async () => {
    const code = generateThemeCode(themeName, "dark", colors, selectedPresets);
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyConfig = async () => {
    await navigator.clipboard.writeText(JSON.stringify(themeConfig, null, 2));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const downloadTheme = () => {
    const code = generateThemeCode(themeName, "dark", colors, selectedPresets);
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${themeName}-theme.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">Create Your Custom Theme</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Design your own LogsDX theme with custom colors and presets. See
          real-time preview using the actual LogsDX engine.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 relative">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Theme Basics</h3>

            <div>
              <label className="block text-sm font-medium mb-2">
                Theme Name
              </label>
              <input
                type="text"
                value={themeName}
                onChange={(e) =>
                  setThemeName(
                    e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  )
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                placeholder="my-awesome-theme"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Colors</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={resetColors}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(colors).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">
                    {key}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) =>
                        handleColorChange(
                          key as keyof ThemeColors,
                          e.target.value,
                        )
                      }
                      className="h-10 w-16 rounded border dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        handleColorChange(
                          key as keyof ThemeColors,
                          e.target.value,
                        )
                      }
                      className="flex-1 px-2 py-1 text-sm border rounded dark:bg-slate-700 dark:border-slate-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Pattern Presets</h3>
            <div className="space-y-2">
              {PRESET_OPTIONS.map((preset) => (
                <label
                  key={preset.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPresets.includes(preset.id)}
                    onChange={() => handlePresetToggle(preset.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{preset.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {preset.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div
          className="lg:sticky lg:top-24 space-y-6"
          style={{ maxHeight: "calc(100vh - 8rem)", overflowY: "auto" }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Live Preview</h3>
              <span className="text-xs text-muted-foreground">
                Powered by LogsDX
              </span>
            </div>
            <div
              className="font-mono text-sm rounded-lg overflow-hidden h-[400px] relative"
              style={{
                backgroundColor: colors.background,
                color: colors.text,
                border: `1px solid ${colors.muted}`,
              }}
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  @keyframes scroll-up-continuous {
                    from {
                      transform: translateY(0);
                    }
                    to {
                      transform: translateY(-50%);
                    }
                  }
                  .log-scroll-wrapper {
                    display: flex;
                    flex-direction: column;
                    animation: scroll-up-continuous 40s linear infinite;
                  }
                  .log-scroll-wrapper:hover {
                    animation-play-state: paused;
                  }
                  .log-line {
                    padding: 4px 16px;
                    line-height: 1.6;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  }
                `,
                }}
              />
              <div className="h-full overflow-hidden relative">
                {processedLogs.length > 0 ? (
                  <div className="log-scroll-wrapper">
                    {/* First set of logs */}
                    {processedLogs.map((log, index) => (
                      <div
                        key={`log-1-${index}`}
                        className="log-line"
                        dangerouslySetInnerHTML={{ __html: log }}
                      />
                    ))}
                    {/* Duplicate set for seamless loop */}
                    {processedLogs.map((log, index) => (
                      <div
                        key={`log-2-${index}`}
                        className="log-line"
                        dangerouslySetInnerHTML={{ __html: log }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center opacity-50">
                      Processing logs...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Export Theme</h3>

            <div className="space-y-3">
              <Button className="w-full gap-2" onClick={copyCode}>
                <Copy className="h-4 w-4" />
                {copiedCode ? "Copied!" : "Copy Code"}
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={copyConfig}
              >
                <Copy className="h-4 w-4" />
                {copiedConfig ? "Copied!" : "Copy Config JSON"}
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={downloadTheme}
              >
                <Download className="h-4 w-4" />
                Download Theme File
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Generated Code</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>

            {showAdvanced && (
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs">
                  <code>
                    {generateThemeCode(
                      themeName,
                      "dark",
                      colors,
                      selectedPresets,
                    )}
                  </code>
                </pre>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Test with Custom Input</h3>
            <CustomLogInput themeName={themeName} colors={colors} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomLogInput({
  themeName,
  colors,
}: {
  themeName: string;
  colors: ThemeColors;
}) {
  const [customLog, setCustomLog] = useState("");
  const [processedCustomLog, setProcessedCustomLog] = useState("");

  useEffect(() => {
    if (!customLog) {
      setProcessedCustomLog("");
      return;
    }

    try {
      const tempThemeName = `logsdx-custom-input`;
      const customTheme = createSimpleTheme(tempThemeName, colors, {
        mode: "dark",
        presets: ["logLevels", "numbers", "strings", "brackets"],
      });
      registerTheme(customTheme);

      const htmlLogsDX = getLogsDX({
        theme: tempThemeName,
        outputFormat: "html",
        htmlStyleFormat: "css",
        escapeHtml: false,
      }) as unknown as { processLine: (line: string) => string };
      const processed = htmlLogsDX.processLine(customLog);
      setProcessedCustomLog(processed);
    } catch (error) {
      console.error("Error processing custom log:", error);
    }
  }, [colors, customLog]);

  return (
    <div className="space-y-3">
      <textarea
        value={customLog}
        onChange={(e) => setCustomLog(e.target.value)}
        placeholder="Enter your own log message to test the theme..."
        className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 h-24 font-mono text-sm"
      />
      {processedCustomLog && (
        <div
          className="font-mono text-sm p-4 rounded-lg"
          style={{
            backgroundColor: colors.background,
            color: colors.text,
          }}
          dangerouslySetInnerHTML={{ __html: processedCustomLog }}
        />
      )}
    </div>
  );
}
