"use client";

import { useThemeEditorStore } from "@/stores/useThemeEditorStore";
import { ThemeColorPicker } from "./ThemeColorPicker";
import { PresetSelector } from "./PresetSelector";
import { ThemePreview } from "./ThemePreview";
import { AVAILABLE_PRESETS, DEFAULT_DARK_COLORS } from "./constants";
import { exportThemeToShareCode, generateShareUrl, generateThemeCode } from "@/lib/themeUtils";
import { useState } from "react";

export function CustomThemeCreator() {
  const name = useThemeEditorStore((state) => state.name);
  const colors = useThemeEditorStore((state) => state.colors);
  const presets = useThemeEditorStore((state) => state.presets);
  const processedLogs = useThemeEditorStore((state) => state.processedLogs);
  const isProcessing = useThemeEditorStore((state) => state.isProcessing);
  
  const setName = useThemeEditorStore((state) => state.setName);
  const setColor = useThemeEditorStore((state) => state.setColor);
  const togglePreset = useThemeEditorStore((state) => state.togglePreset);
  const reset = useThemeEditorStore((state) => state.reset);

  const [shareUrl, setShareUrl] = useState<string>("");
  const [showCode, setShowCode] = useState(false);

  const handleExport = () => {
    const shareCode = exportThemeToShareCode(name, colors, presets);
    const url = generateShareUrl(shareCode);
    setShareUrl(url);
  };

  const handleGenerateCode = () => {
    setShowCode(!showCode);
  };

  const handleReset = () => {
    reset();
    setShareUrl("");
    setShowCode(false);
  };

  const themeCode = generateThemeCode(name, colors, presets);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Custom Theme Creator</h2>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Theme Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-md px-3 py-2 border rounded"
              placeholder="my-custom-theme"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ThemeColorPicker
              colors={colors}
              onColorChange={setColor}
              onReset={() => {
                Object.entries(DEFAULT_DARK_COLORS).forEach(([key, value]) => {
                  setColor(key as keyof typeof colors, value);
                });
              }}
            />
            <PresetSelector
              presets={AVAILABLE_PRESETS}
              selectedPresets={presets}
              onToggle={togglePreset}
            />
          </div>

          <div>
            <ThemePreview
              processedLogs={processedLogs}
              isProcessing={isProcessing}
              colors={colors}
            />
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export Theme
          </button>
          <button
            onClick={handleGenerateCode}
            className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {showCode ? "Hide" : "Show"} Code
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Reset All
          </button>
        </div>

        {shareUrl && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            <p className="font-medium mb-2">Share URL:</p>
            <code className="block p-2 bg-white dark:bg-gray-800 rounded border text-sm">
              {shareUrl}
            </code>
          </div>
        )}

        {showCode && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded border">
            <p className="font-medium mb-2">Generated Code:</p>
            <pre className="p-4 bg-white dark:bg-gray-800 rounded border text-sm overflow-x-auto">
              <code>{themeCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
