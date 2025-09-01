"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Download, Copy, RefreshCw } from "lucide-react";
import { createSimpleTheme, registerTheme, getLogsDX } from "logsdx";
import type { ThemeColors, ThemeConfig } from "./types";
import { 
  DEFAULT_DARK_COLORS, 
  DEFAULT_LIGHT_COLORS, 
  PRESET_OPTIONS, 
  SAMPLE_LOGS 
} from "./constants";
import { generateThemeCode } from "./utils";

interface CustomThemeCreatorProps {
  onThemeCreate?: (theme: ThemeConfig) => void;
}

export function CustomThemeCreator({ onThemeCreate }: CustomThemeCreatorProps) {
  const [themeName, setThemeName] = useState("custom-theme");
  const [mode, setMode] = useState<"light" | "dark">("dark");
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
  const [processedLogs, setProcessedLogs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const customTheme = createSimpleTheme({
        name: themeName,
        mode,
        colors,
        presets: selectedPresets,
      });

      registerTheme(customTheme);

      const logsDX = getLogsDX({ theme: themeName });

      const processed = SAMPLE_LOGS.map(log => {
        const htmlLogsDX = getLogsDX({ 
          theme: themeName,
          outputFormat: 'html'
        }) as unknown as { processLine: (line: string) => string };
        return htmlLogsDX.processLine(log.text);
      });

      setProcessedLogs(processed);
    } catch (error) {
      console.error("Error creating theme:", error);
    }
  }, [themeName, mode, colors, selectedPresets]);

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handlePresetToggle = (presetId: string) => {
    setSelectedPresets((prev) =>
      prev.includes(presetId)
        ? prev.filter((p) => p !== presetId)
        : [...prev, presetId]
    );
  };

  const handleModeChange = (newMode: "light" | "dark") => {
    setMode(newMode);
    setColors(newMode === "dark" ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS);
  };

  const resetColors = () => {
    setColors(mode === "dark" ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS);
  };

  const themeConfig: ThemeConfig = useMemo(() => {
    return {
      name: themeName,
      mode,
      colors,
      presets: selectedPresets,
    };
  }, [themeName, mode, colors, selectedPresets]);

  const copyCode = async () => {
    const code = generateThemeCode(themeName, mode, colors, selectedPresets);
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
    const code = generateThemeCode(themeName, mode, colors, selectedPresets);
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
          Design your own LogsDX theme with custom colors and presets. See real-time preview using the actual LogsDX engine.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Theme Basics</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Theme Name</label>
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                placeholder="my-awesome-theme"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Mode</label>
              <div className="flex gap-2">
                <Button
                  variant={mode === "dark" ? "default" : "outline"}
                  onClick={() => handleModeChange("dark")}
                  className="flex-1"
                >
                  Dark
                </Button>
                <Button
                  variant={mode === "light" ? "default" : "outline"}
                  onClick={() => handleModeChange("light")}
                  className="flex-1"
                >
                  Light
                </Button>
              </div>
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
                      onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                      className="h-10 w-16 rounded border dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
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

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Live Preview</h3>
              <span className="text-xs text-muted-foreground">Powered by LogsDX</span>
            </div>
            <div
              className="font-mono text-sm p-4 rounded-lg space-y-2 overflow-x-auto"
              style={{
                backgroundColor: colors.background,
                color: colors.text,
              }}
            >
              {processedLogs.map((log, index) => (
                <div
                  key={index}
                  dangerouslySetInnerHTML={{ __html: log }}
                />
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Export Theme</h3>
            
            <div className="space-y-3">
              <Button
                className="w-full gap-2"
                onClick={copyCode}
              >
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
                {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
            
            {showAdvanced && (
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs">
                  <code>{generateThemeCode(themeName, mode, colors, selectedPresets)}</code>
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

function CustomLogInput({ themeName, colors }: { themeName: string; colors: ThemeColors }) {
  const [customLog, setCustomLog] = useState("");
  const [processedCustomLog, setProcessedCustomLog] = useState("");

  const handleProcessLog = () => {
    if (customLog) {
      try {
        const htmlLogsDX = getLogsDX({ 
          theme: themeName,
          outputFormat: 'html'
        }) as unknown as { processLine: (line: string) => string };
        const processed = htmlLogsDX.processLine(customLog);
        setProcessedCustomLog(processed);
      } catch (error) {
        console.error("Error processing custom log:", error);
      }
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={customLog}
        onChange={(e) => setCustomLog(e.target.value)}
        placeholder="Enter your own log message to test the theme..."
        className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 h-24 font-mono text-sm"
      />
      <Button onClick={handleProcessLog} className="w-full">
        Process Log
      </Button>
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