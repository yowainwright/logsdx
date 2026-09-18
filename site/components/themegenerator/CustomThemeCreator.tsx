"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Download, Copy } from "lucide-react";
import {
  useThemeEditorStore,
  themeEditorActions,
} from "@/stores/useThemeEditorStore";
import { useLogPreview } from "@/hooks/useLogPreview";
import { useCreateTheme } from "@/hooks/useThemes";
import {
  generateThemeCode,
  exportThemeToShareCode,
  generateShareUrl,
} from "@/lib/themeUtils";
import { PRESET_OPTIONS } from "./constants";
import { ThemeColorPicker } from "./ThemeColorPicker";
import { ThemePreview } from "./ThemePreview";
import { PresetSelector } from "./PresetSelector";
import type { ThemeColors } from "./types";

interface ThemeCreatorActions {
  copiedCode: boolean;
  copiedConfig: boolean;
  handleCopyCode: () => void;
  handleCopyConfig: () => void;
  handleDownload: () => void;
  handleSave: () => void;
  handleShare: () => void;
  showAdvanced: boolean;
  toggleAdvanced: () => void;
}

async function copyCode(
  name: string,
  colors: ThemeColors,
  presets: string[],
  setCopied: (copied: boolean) => void,
) {
  const code = generateThemeCode(name, colors, presets);
  await navigator.clipboard.writeText(code);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

async function copyConfig(
  name: string,
  colors: ThemeColors,
  presets: string[],
  setCopied: (copied: boolean) => void,
) {
  const config = { name, colors, presets, mode: "dark" };
  await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

function downloadTheme(
  name: string,
  colors: ThemeColors,
  presets: string[],
) {
  const code = generateThemeCode(name, colors, presets);
  const blob = new Blob([code], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}-theme.js`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function useThemeCreatorActions(
  name: string,
  colors: ThemeColors,
  presets: string[],
  onSave: () => void,
): ThemeCreatorActions {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const handleCopyCode = () => {
    void copyCode(name, colors, presets, setCopiedCode);
  };
  const handleCopyConfig = () => {
    void copyConfig(name, colors, presets, setCopiedConfig);
  };
  const handleDownload = () => downloadTheme(name, colors, presets);
  const handleShare = async () => {
    const shareCode = exportThemeToShareCode(name, colors, presets);
    const url = generateShareUrl(shareCode);
    await navigator.clipboard.writeText(url);
  };

  return {
    copiedCode,
    copiedConfig,
    handleCopyCode,
    handleCopyConfig,
    handleDownload,
    handleSave: onSave,
    handleShare,
    showAdvanced,
    toggleAdvanced: () => setShowAdvanced((visible) => !visible),
  };
}

function CreatorHeader() {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-4xl font-bold">Create Your Custom Theme</h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Design your own LogsDX theme with custom colors and presets. See
        real-time preview using the actual LogsDX engine.
      </p>
    </div>
  );
}

function ThemeBasics({
  name,
  onNameChange,
}: {
  name: string;
  onNameChange: (name: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold">Theme Basics</h3>
      <div>
        <label className="block text-sm font-medium mb-2">Theme Name</label>
        <input
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
          placeholder="my-awesome-theme"
        />
      </div>
    </div>
  );
}

interface ExportOptionsProps {
  copiedCode: boolean;
  copiedConfig: boolean;
  onCopyCode: () => void;
  onCopyConfig: () => void;
  onDownload: () => void;
  onSave: () => void;
  onShare: () => void;
}

function ExportButtons({
  copiedCode,
  copiedConfig,
  onCopyCode,
  onCopyConfig,
  onDownload,
  onSave,
  onShare,
}: ExportOptionsProps) {
  return (
    <div className="space-y-3">
      <Button className="w-full gap-2" onClick={onCopyCode}>
        <Copy className="h-4 w-4" />
        {copiedCode ? "Copied!" : "Copy Code"}
      </Button>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={onCopyConfig}
      >
        <Copy className="h-4 w-4" />
        {copiedConfig ? "Copied!" : "Copy Config JSON"}
      </Button>
      <Button variant="outline" className="w-full gap-2" onClick={onDownload}>
        <Download className="h-4 w-4" />
        Download Theme File
      </Button>
      <Button variant="outline" className="w-full gap-2" onClick={onSave}>
        Save Theme
      </Button>
      <Button variant="outline" className="w-full gap-2" onClick={onShare}>
        Share Theme
      </Button>
    </div>
  );
}

function ExportOptions({
  copiedCode,
  copiedConfig,
  onCopyCode,
  onCopyConfig,
  onDownload,
  onSave,
  onShare,
}: ExportOptionsProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold">Export Theme</h3>
      <ExportButtons
        copiedCode={copiedCode}
        copiedConfig={copiedConfig}
        onCopyCode={onCopyCode}
        onCopyConfig={onCopyConfig}
        onDownload={onDownload}
        onSave={onSave}
        onShare={onShare}
      />
    </div>
  );
}

function GeneratedCode({
  colors,
  name,
  presets,
  showAdvanced,
  onToggle,
}: {
  colors: ThemeColors;
  name: string;
  onToggle: () => void;
  presets: string[];
  showAdvanced: boolean;
}) {
  const code = generateThemeCode(name, colors, presets);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Generated Code</h3>
        <Button variant="ghost" size="sm" onClick={onToggle}>
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
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

function CreatorControls({
  colors,
  name,
  onNameChange,
  onColorChange,
  onReset,
  onTogglePreset,
  presets,
}: {
  colors: ThemeColors;
  name: string;
  onColorChange: (key: keyof ThemeColors, value: string) => void;
  onNameChange: (name: string) => void;
  onReset: () => void;
  onTogglePreset: (preset: string) => void;
  presets: string[];
}) {
  return (
    <div className="space-y-6">
      <ThemeBasics name={name} onNameChange={onNameChange} />
      <ThemeColorPicker
        colors={colors}
        onColorChange={onColorChange}
        onReset={onReset}
      />
      <PresetSelector
        presets={PRESET_OPTIONS}
        selectedPresets={presets}
        onToggle={onTogglePreset}
      />
    </div>
  );
}

function CreatorExports({
  actions,
  colors,
  name,
  presets,
}: {
  actions: ThemeCreatorActions;
  colors: ThemeColors;
  name: string;
  presets: string[];
}) {
  return (
    <>
      <ExportOptions
        copiedCode={actions.copiedCode}
        copiedConfig={actions.copiedConfig}
        onCopyCode={actions.handleCopyCode}
        onCopyConfig={actions.handleCopyConfig}
        onDownload={actions.handleDownload}
        onSave={actions.handleSave}
        onShare={actions.handleShare}
      />
      <GeneratedCode
        colors={colors}
        name={name}
        onToggle={actions.toggleAdvanced}
        presets={presets}
        showAdvanced={actions.showAdvanced}
      />
    </>
  );
}

function CreatorPreview({
  actions,
  colors,
  isProcessing,
  name,
  processedLogs,
  presets,
}: {
  actions: ThemeCreatorActions;
  colors: ThemeColors;
  isProcessing: boolean;
  name: string;
  processedLogs: string[];
  presets: string[];
}) {
  return (
    <div
      className="lg:sticky lg:top-24 space-y-6"
      style={{ maxHeight: "calc(100vh - 8rem)", overflowY: "auto" }}
    >
      <ThemePreview
        processedLogs={processedLogs}
        isProcessing={isProcessing}
        colors={colors}
      />
      <CreatorExports
        actions={actions}
        colors={colors}
        name={name}
        presets={presets}
      />
    </div>
  );
}

export function CustomThemeCreator() {
  const name = useThemeEditorStore((state) => state.name);
  const colors = useThemeEditorStore((state) => state.colors);
  const presets = useThemeEditorStore((state) => state.presets);
  const { setName, setColor, togglePreset, reset } = themeEditorActions;

  const { processedLogs, isProcessing } = useLogPreview();
  const { mutate: saveTheme } = useCreateTheme();

  const handleSave = () => saveTheme({ name, colors, presets });
  const actions = useThemeCreatorActions(
    name,
    colors,
    presets,
    handleSave,
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      <CreatorHeader />

      <div className="grid lg:grid-cols-2 gap-8">
        <CreatorControls
          colors={colors}
          name={name}
          onColorChange={setColor}
          onNameChange={setName}
          onReset={reset}
          onTogglePreset={togglePreset}
          presets={presets}
        />

        <CreatorPreview
          actions={actions}
          colors={colors}
          isProcessing={isProcessing}
          name={name}
          processedLogs={processedLogs}
          presets={presets}
        />
      </div>
    </div>
  );
}
