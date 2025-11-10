"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { createSimpleTheme, registerTheme, getLogsDX } from "logsdx";
import { useThemeStore } from "./useThemeStore";
import { SAMPLE_LOGS } from "./constants";
import type { ThemeColors } from "./types";

export interface ThemeFormData {
  name: string;
  colors: ThemeColors;
  presets: string[];
}

export function useThemeForm() {
  const [processedLogs, setProcessedLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");

  const {
    currentTheme,
    setThemeName,
    setColor,
    togglePreset,
    resetTheme,
    saveTheme,
    generateShareUrl,
  } = useThemeStore();

  const { control, watch, reset, setValue, handleSubmit } =
    useForm<ThemeFormData>({
      defaultValues: currentTheme,
    });

  // Sync store with form
  useEffect(() => {
    reset(currentTheme);
  }, [currentTheme, reset]);

  // Process logs with LogsDX whenever theme changes
  const processLogs = useCallback(async () => {
    setIsProcessing(true);

    try {
      const tempThemeName = `preview-${Date.now()}`;

      const customTheme = createSimpleTheme(
        tempThemeName,
        currentTheme.colors,
        {
          mode: "dark",
          presets: currentTheme.presets,
        },
      );

      registerTheme(customTheme);

      // Small delay to ensure registration
      await new Promise((resolve) => setTimeout(resolve, 50));

      const htmlLogsDX = getLogsDX({
        theme: tempThemeName,
        outputFormat: "html",
        htmlStyleFormat: "css",
        escapeHtml: false,
      }) as unknown as { processLine: (line: string) => string };

      const processed = SAMPLE_LOGS.map((log) => {
        try {
          const result = htmlLogsDX.processLine(log.text);
          return result;
        } catch (e) {
          // Fallback if LogsDX fails
          console.warn("LogsDX processing failed, using fallback:", e);
          return `<span style="color: ${currentTheme.colors.text}">${log.text}</span>`;
        }
      });

      setProcessedLogs(processed);
    } catch (error) {
      console.error("Theme processing error:", error);
      // Use fallback rendering
      const fallback = SAMPLE_LOGS.map(
        (log) =>
          `<span style="color: ${currentTheme.colors.text}">${log.text}</span>`,
      );
      setProcessedLogs(fallback);
    } finally {
      setIsProcessing(false);
    }
  }, [currentTheme]);

  // Process logs on mount and when theme changes
  useEffect(() => {
    processLogs();
  }, [processLogs]);

  // Form handlers that update the store
  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColor(key, value);
    setValue(`colors.${key}`, value);
  };

  const handlePresetToggle = (presetId: string) => {
    togglePreset(presetId);
  };

  const handleNameChange = (name: string) => {
    setThemeName(name);
    setValue("name", name);
  };

  const handleSaveTheme = async () => {
    const themeId = await saveTheme();
    return themeId;
  };

  const handleShareTheme = () => {
    const url = generateShareUrl();
    setShareUrl(url);

    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }

    return url;
  };

  const handleExportCode = () => {
    // Generate JavaScript code
    const jsCode = `
import { createSimpleTheme, registerTheme } from 'logsdx';

const ${currentTheme.name.replace(/-/g, "_")}Theme = createSimpleTheme({
  name: '${currentTheme.name}',
  mode: 'dark',
  colors: ${JSON.stringify(currentTheme.colors, null, 2)},
  presets: ${JSON.stringify(currentTheme.presets)}
});

registerTheme(${currentTheme.name.replace(/-/g, "_")}Theme);
`;

    return jsCode;
  };

  const handleReset = () => {
    resetTheme();
    reset({
      name: "my-custom-theme",
      colors: currentTheme.colors,
      presets: ["logLevels", "numbers", "strings", "brackets"],
    });
  };

  return {
    // Form
    control,
    watch,
    handleSubmit,

    // Theme data
    currentTheme,
    processedLogs,
    isProcessing,
    shareUrl,

    // Actions
    handleColorChange,
    handlePresetToggle,
    handleNameChange,
    handleSaveTheme,
    handleShareTheme,
    handleExportCode,
    handleReset,
  };
}
