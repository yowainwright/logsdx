import { Store } from "@tanstack/store";
import { useStore } from "@tanstack/react-store";
import type { ThemeColors } from "@/components/themegenerator/types";
import { DEFAULT_DARK_COLORS } from "@/components/themegenerator/constants";

interface ThemeEditorState {
  name: string;
  colors: ThemeColors;
  presets: string[];
  processedLogs: string[];
  isProcessing: boolean;
}

const initialState: ThemeEditorState = {
  name: "my-custom-theme",
  colors: DEFAULT_DARK_COLORS,
  presets: ["logLevels", "numbers", "strings", "brackets"],
  processedLogs: [],
  isProcessing: false,
};

export const themeEditorStore = new Store<ThemeEditorState>(initialState);

export const themeEditorActions = {
  setName: (name: string) => {
    themeEditorStore.setState((state) => ({
      ...state,
      name: name.toLowerCase().replace(/\s+/g, "-"),
    }));
  },

  setColor: (key: keyof ThemeColors, value: string) => {
    themeEditorStore.setState((state) => ({
      ...state,
      colors: { ...state.colors, [key]: value },
    }));
  },

  togglePreset: (presetId: string) => {
    themeEditorStore.setState((state) => {
      const index = state.presets.indexOf(presetId);
      const newPresets =
        index > -1
          ? state.presets.filter((_, i) => i !== index)
          : [...state.presets, presetId];
      return { ...state, presets: newPresets };
    });
  },

  setProcessedLogs: (logs: string[]) => {
    themeEditorStore.setState((state) => ({
      ...state,
      processedLogs: logs,
    }));
  },

  setIsProcessing: (isProcessing: boolean) => {
    themeEditorStore.setState((state) => ({
      ...state,
      isProcessing,
    }));
  },

  reset: () => {
    themeEditorStore.setState(() => initialState);
  },

  loadTheme: (name: string, colors: ThemeColors, presets: string[]) => {
    themeEditorStore.setState((state) => ({
      ...state,
      name,
      colors,
      presets,
    }));
  },
};

export function useThemeEditorStore<T>(
  selector: (state: ThemeEditorState) => T,
): T {
  return useStore(themeEditorStore, selector);
}

export function useThemeEditorState(): ThemeEditorState {
  return useStore(themeEditorStore);
}
