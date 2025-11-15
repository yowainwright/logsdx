"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Download, Copy } from "lucide-react";
import { useThemeEditorStore } from "@/stores/useThemeEditorStore";
import { useLogPreview } from "@/hooks/useLogPreview";
import { useCreateTheme } from "@/hooks/useThemes";
import { generateThemeCode, exportThemeToShareCode, generateShareUrl } from "@/lib/themeUtils";
import { PRESET_OPTIONS } from "./constants";
import { ThemeColorPicker } from "./ThemeColorPicker";
import { ThemePreview } from "./ThemePreview";
import { PresetSelector } from "./PresetSelector";

export function CustomThemeCreator() {
  const name = useThemeEditorStore((state) => state.name);
  const colors = useThemeEditorStore((state) => state.colors);
  const presets = useThemeEditorStore((state) => state.presets);
  const setName = useThemeEditorStore((state) => state.setName);
  const setColor = useThemeEditorStore((state) => state.setColor);
  const togglePreset = useThemeEditorStore((state) => state.togglePreset);
  const reset = useThemeEditorStore((state) => state.reset);

  const { processedLogs, isProcessing } = useLogPreview();
  const { mutate: saveTheme } = useCreateTheme();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const handleCopyCode = async () => {
    const code = generateThemeCode(name, colors, presets);
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyConfig = async () => {
    const config = { name, colors, presets, mode: "dark" };
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleDownload = () => {
    const code = generateThemeCode(name, colors, presets);
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-theme.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    saveTheme({ name, colors, presets });
  };

  const handleShare = async () => {
    const shareCode = exportThemeToShareCode(name, colors, presets);
    const url = generateShareUrl(shareCode);
    await navigator.clipboard.writeText(url);
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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Controls */}
        <div className="space-y-6">
          {/* Theme Name */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Theme Basics</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Theme Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                placeholder="my-awesome-theme"
              />
            </div>
          </div>

          {/* Colors */}
          <ThemeColorPicker colors={colors} onColorChange={setColor} onReset={reset} />

          {/* Presets */}
          <PresetSelector
            presets={PRESET_OPTIONS}
            selectedPresets={presets}
            onToggle={togglePreset}
          />
        </div>

        {/* Right: Preview & Export */}
        <div className="lg:sticky lg:top-24 space-y-6" style={{ maxHeight: "calc(100vh - 8rem)", overflowY: "auto" }}>
          {/* Live Preview */}
          <ThemePreview
            processedLogs={processedLogs}
            isProcessing={isProcessing}
            colors={colors}
          />

          {/* Export Options */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Export Theme</h3>
            <div className="space-y-3">
              <Button className="w-full gap-2" onClick={handleCopyCode}>
                <Copy className="h-4 w-4" />
                {copiedCode ? "Copied!" : "Copy Code"}
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={handleCopyConfig}>
                <Copy className="h-4 w-4" />
                {copiedConfig ? "Copied!" : "Copy Config JSON"}
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                Download Theme File
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={handleSave}>
                Save Theme
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
                Share Theme
              </Button>
            </div>
          </div>

          {/* Generated Code */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Generated Code</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
            {showAdvanced && (
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs">
                  <code>{generateThemeCode(name, colors, presets)}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
