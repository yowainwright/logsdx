import { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  useThemeEditorStore,
  themeEditorActions,
} from "@/stores/useThemeEditorStore";
import { processLogs } from "@/lib/logProcessor";
import { SAMPLE_LOGS } from "@/components/themegenerator/constants";

export function useLogPreview() {
  const colors = useThemeEditorStore((state) => state.colors);
  const presets = useThemeEditorStore((state) => state.presets);
  const { setProcessedLogs, setIsProcessing } = themeEditorActions;

  const debouncedProcessLogs = useDebouncedCallback(async () => {
    setIsProcessing(true);

    try {
      const processed = await processLogs(colors, presets, SAMPLE_LOGS);
      setProcessedLogs(processed);
    } finally {
      setIsProcessing(false);
    }
  }, 300);

  useEffect(() => {
    debouncedProcessLogs();
  }, [colors, presets, debouncedProcessLogs]);

  return {
    processedLogs: useThemeEditorStore((state) => state.processedLogs),
    isProcessing: useThemeEditorStore((state) => state.isProcessing),
  };
}
