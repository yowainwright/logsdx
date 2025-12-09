import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import {
  themeEditorStore,
  themeEditorActions,
} from "@/stores/useThemeEditorStore";
import { DEFAULT_DARK_COLORS } from "@/components/themegenerator/constants";

describe("useThemeEditorStore", () => {
  beforeEach(() => {
    themeEditorActions.reset();
  });

  afterEach(() => {
    themeEditorActions.reset();
  });

  it("initializes with default state", () => {
    const state = themeEditorStore.state;

    expect(state.name).toBe("my-custom-theme");
    expect(state.colors).toEqual(DEFAULT_DARK_COLORS);
    expect(state.presets).toEqual([
      "logLevels",
      "numbers",
      "strings",
      "brackets",
    ]);
    expect(state.processedLogs).toEqual([]);
    expect(state.isProcessing).toBe(false);
  });

  it("updates theme name", () => {
    themeEditorActions.setName("New Theme Name");

    const state = themeEditorStore.state;
    expect(state.name).toBe("new-theme-name");
  });

  it("converts theme name to kebab-case", () => {
    themeEditorActions.setName("My Awesome Theme");

    const state = themeEditorStore.state;
    expect(state.name).toBe("my-awesome-theme");
  });

  it("updates individual colors", () => {
    themeEditorActions.setColor("primary", "#ff0000");

    const state = themeEditorStore.state;
    expect(state.colors.primary).toBe("#ff0000");
    expect(state.colors.secondary).toBe(DEFAULT_DARK_COLORS.secondary);
  });

  it("toggles presets on", () => {
    themeEditorActions.reset();

    themeEditorActions.togglePreset("numbers");
    expect(themeEditorStore.state.presets).not.toContain("numbers");

    themeEditorActions.togglePreset("numbers");
    expect(themeEditorStore.state.presets).toContain("numbers");
  });

  it("toggles presets off", () => {
    themeEditorActions.togglePreset("logLevels");

    const state = themeEditorStore.state;
    expect(state.presets).not.toContain("logLevels");
  });

  it("handles multiple preset toggles", () => {
    themeEditorActions.togglePreset("logLevels");
    themeEditorActions.togglePreset("numbers");
    themeEditorActions.togglePreset("strings");

    const state = themeEditorStore.state;
    expect(state.presets).toEqual(["brackets"]);
  });

  it("updates processed logs", () => {
    const mockLogs = ["<span>Log 1</span>", "<span>Log 2</span>"];
    themeEditorActions.setProcessedLogs(mockLogs);

    const state = themeEditorStore.state;
    expect(state.processedLogs).toEqual(mockLogs);
  });

  it("updates processing state", () => {
    themeEditorActions.setIsProcessing(true);
    expect(themeEditorStore.state.isProcessing).toBe(true);

    themeEditorActions.setIsProcessing(false);
    expect(themeEditorStore.state.isProcessing).toBe(false);
  });

  it("resets to initial state", () => {
    themeEditorActions.setName("modified");
    themeEditorActions.setColor("primary", "#ff0000");
    themeEditorActions.togglePreset("logLevels");

    let state = themeEditorStore.state;
    expect(state.name).toBe("modified");
    expect(state.colors.primary).toBe("#ff0000");
    expect(state.presets).not.toContain("logLevels");

    themeEditorActions.reset();

    state = themeEditorStore.state;
    expect(state.name).toBe("my-custom-theme");
    expect(state.colors).toEqual(DEFAULT_DARK_COLORS);
    expect(state.presets).toEqual([
      "logLevels",
      "numbers",
      "strings",
      "brackets",
    ]);
  });

  it("loads theme from parameters", () => {
    const customColors = {
      ...DEFAULT_DARK_COLORS,
      primary: "#custom",
    };

    themeEditorActions.loadTheme("loaded-theme", customColors, ["logLevels"]);

    const state = themeEditorStore.state;
    expect(state.name).toBe("loaded-theme");
    expect(state.colors.primary).toBe("#custom");
    expect(state.presets).toEqual(["logLevels"]);
  });

  it("maintains immutability", () => {
    const initialColors = themeEditorStore.state.colors;

    themeEditorActions.setColor("primary", "#new-color");

    const updatedColors = themeEditorStore.state.colors;

    expect(initialColors).not.toBe(updatedColors);
    expect(initialColors.primary).not.toBe(updatedColors.primary);
  });
});
