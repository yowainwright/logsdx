import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ThemeColors } from "@/components/themegenerator/types";
import { DEFAULT_DARK_COLORS } from "@/components/themegenerator/constants";

interface ThemeEditorState {
  name: string;
  colors: ThemeColors;
  presets: string[];
  processedLogs: string[];
  isProcessing: boolean;
}

interface ThemeEditorActions {
  setName: (name: string) => void;
  setColor: (key: keyof ThemeColors, value: string) => void;
  togglePreset: (presetId: string) => void;
  setProcessedLogs: (logs: string[]) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  reset: () => void;
  loadTheme: (name: string, colors: ThemeColors, presets: string[]) => void;
}

const initialState: ThemeEditorState = {
  name: "my-custom-theme",
  colors: DEFAULT_DARK_COLORS,
  presets: ["logLevels", "numbers", "strings", "brackets"],
  processedLogs: [],
  isProcessing: false,
};

export const useThemeEditorStore = create<ThemeEditorState & ThemeEditorActions>()(
  immer((set) => ({
    ...initialState,

    setName: (name) =>
      set((state) => {
        state.name = name.toLowerCase().replace(/\s+/g, "-");
      }),

    setColor: (key, value) =>
      set((state) => {
        state.colors[key] = value;
      }),

    togglePreset: (presetId) =>
      set((state) => {
        const index = state.presets.indexOf(presetId);
        if (index > -1) {
          state.presets.splice(index, 1);
        } else {
          state.presets.push(presetId);
        }
      }),

    setProcessedLogs: (logs) =>
      set((state) => {
        state.processedLogs = logs;
      }),

    setIsProcessing: (isProcessing) =>
      set((state) => {
        state.isProcessing = isProcessing;
      }),

    reset: () => set(initialState),

    loadTheme: (name, colors, presets) =>
      set((state) => {
        state.name = name;
        state.colors = colors;
        state.presets = presets;
      }),
  })),
);
