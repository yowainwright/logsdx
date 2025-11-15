import { describe, it, expect, beforeEach } from "bun:test";
import { useThemeEditorStore } from "@/stores/useThemeEditorStore";
import { DEFAULT_DARK_COLORS } from "@/components/themegenerator/constants";

describe("useThemeEditorStore", () => {
  beforeEach(() => {
    useThemeEditorStore.getState().reset();
  });

  it("initializes with default state", () => {
    const state = useThemeEditorStore.getState();

    expect(state.name).toBe("my-custom-theme");
    expect(state.colors).toEqual(DEFAULT_DARK_COLORS);
    expect(state.presets).toEqual(["logLevels", "numbers", "strings", "brackets"]);
    expect(state.processedLogs).toEqual([]);
    expect(state.isProcessing).toBe(false);
  });

  it("updates theme name", () => {
    const { setName } = useThemeEditorStore.getState();

    setName("New Theme Name");

    const state = useThemeEditorStore.getState();
    expect(state.name).toBe("new-theme-name");
  });

  it("converts theme name to kebab-case", () => {
    const { setName } = useThemeEditorStore.getState();

    setName("My Awesome Theme");

    const state = useThemeEditorStore.getState();
    expect(state.name).toBe("my-awesome-theme");
  });

  it("updates individual colors", () => {
    const { setColor } = useThemeEditorStore.getState();

    setColor("primary", "#ff0000");

    const state = useThemeEditorStore.getState();
    expect(state.colors.primary).toBe("#ff0000");
    expect(state.colors.secondary).toBe(DEFAULT_DARK_COLORS.secondary); // Others unchanged
  });

  it("toggles presets on", () => {
    const { reset, togglePreset } = useThemeEditorStore.getState();

    reset();
    const initialState = useThemeEditorStore.getState();
    const initialPresets = initialState.presets;

    // Remove a preset first
    togglePreset("numbers");
    expect(useThemeEditorStore.getState().presets).not.toContain("numbers");

    // Add it back
    togglePreset("numbers");
    expect(useThemeEditorStore.getState().presets).toContain("numbers");
  });

  it("toggles presets off", () => {
    const { togglePreset } = useThemeEditorStore.getState();

    togglePreset("logLevels");

    const state = useThemeEditorStore.getState();
    expect(state.presets).not.toContain("logLevels");
  });

  it("handles multiple preset toggles", () => {
    const { togglePreset } = useThemeEditorStore.getState();

    togglePreset("logLevels");
    togglePreset("numbers");
    togglePreset("strings");

    const state = useThemeEditorStore.getState();
    expect(state.presets).toEqual(["brackets"]);
  });

  it("updates processed logs", () => {
    const { setProcessedLogs } = useThemeEditorStore.getState();

    const mockLogs = ["<span>Log 1</span>", "<span>Log 2</span>"];
    setProcessedLogs(mockLogs);

    const state = useThemeEditorStore.getState();
    expect(state.processedLogs).toEqual(mockLogs);
  });

  it("updates processing state", () => {
    const { setIsProcessing } = useThemeEditorStore.getState();

    setIsProcessing(true);
    expect(useThemeEditorStore.getState().isProcessing).toBe(true);

    setIsProcessing(false);
    expect(useThemeEditorStore.getState().isProcessing).toBe(false);
  });

  it("resets to initial state", () => {
    const { setName, setColor, togglePreset, reset } = useThemeEditorStore.getState();

    // Make changes
    setName("modified");
    setColor("primary", "#ff0000");
    togglePreset("logLevels");

    // Verify changes
    let state = useThemeEditorStore.getState();
    expect(state.name).toBe("modified");
    expect(state.colors.primary).toBe("#ff0000");
    expect(state.presets).not.toContain("logLevels");

    // Reset
    reset();

    // Verify reset
    state = useThemeEditorStore.getState();
    expect(state.name).toBe("my-custom-theme");
    expect(state.colors).toEqual(DEFAULT_DARK_COLORS);
    expect(state.presets).toEqual(["logLevels", "numbers", "strings", "brackets"]);
  });

  it("loads theme from parameters", () => {
    const { loadTheme } = useThemeEditorStore.getState();

    const customColors = {
      ...DEFAULT_DARK_COLORS,
      primary: "#custom",
    };

    loadTheme("loaded-theme", customColors, ["logLevels"]);

    const state = useThemeEditorStore.getState();
    expect(state.name).toBe("loaded-theme");
    expect(state.colors.primary).toBe("#custom");
    expect(state.presets).toEqual(["logLevels"]);
  });

  it("maintains immutability with immer", () => {
    const { setColor } = useThemeEditorStore.getState();

    const initialColors = useThemeEditorStore.getState().colors;

    setColor("primary", "#new-color");

    const updatedColors = useThemeEditorStore.getState().colors;

    // Colors object should be different reference (immutability)
    expect(initialColors).not.toBe(updatedColors);
    expect(initialColors.primary).not.toBe(updatedColors.primary);
  });
});
