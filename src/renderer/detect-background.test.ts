import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import {
  detectTerminalBackground,
  detectBrowserBackground,
  detectSystemBackground,
  detectBackground,
  isDarkBackground,
  isLightBackground,
  getRecommendedThemeMode,
  watchBackgroundChanges,
} from "./detect-background";

describe("detectTerminalBackground", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("detects dark background from COLORFGBG", () => {
    process.env.COLORFGBG = "15;0";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("dark");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("terminal");
  });

  test("detects light background from COLORFGBG", () => {
    process.env.COLORFGBG = "0;7";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("light");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("terminal");
  });

  test("detects bright white background from COLORFGBG", () => {
    process.env.COLORFGBG = "0;15";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("light");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("terminal");
  });

  test("detects dark terminal from iTerm", () => {
    delete process.env.COLORFGBG;
    process.env.TERM_PROGRAM = "iTerm.app";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("dark");
    expect(result.confidence).toBe("medium");
    expect(result.source).toBe("terminal");
    expect(result.details?.termProgram).toBe("iTerm.app");
  });

  test("detects dark terminal from WarpTerminal", () => {
    delete process.env.COLORFGBG;
    process.env.TERM_PROGRAM = "WarpTerminal";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("dark");
    expect(result.confidence).toBe("medium");
    expect(result.source).toBe("terminal");
  });

  test("detects light terminal from Apple Terminal", () => {
    delete process.env.COLORFGBG;
    process.env.TERM_PROGRAM = "Apple_Terminal";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("light");
    expect(result.confidence).toBe("medium");
    expect(result.source).toBe("terminal");
  });

  test("detects VS Code terminal as auto", () => {
    delete process.env.COLORFGBG;
    delete process.env.TERM_PROGRAM;
    process.env.VSCODE_PID = "12345";
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("low");
    expect(result.source).toBe("terminal");
    expect(result.details?.termProgram).toBe("vscode");
  });

  test("defaults to dark when no information available", () => {
    delete process.env.COLORFGBG;
    delete process.env.TERM_PROGRAM;
    delete process.env.VSCODE_PID;
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("dark");
    expect(result.confidence).toBe("low");
    expect(result.source).toBe("default");
  });

  test("handles invalid COLORFGBG gracefully", () => {
    process.env.COLORFGBG = "invalid";
    delete process.env.TERM_PROGRAM;
    const result = detectTerminalBackground();
    expect(result.scheme).toBe("dark");
    expect(result.source).toBe("default");
  });

  test("handles partial COLORFGBG", () => {
    process.env.COLORFGBG = "15";
    const result = detectTerminalBackground();
    expect(result.confidence).not.toBe("high");
  });
});

describe("detectBrowserBackground", () => {
  test("returns auto when not in browser environment", () => {
    const result = detectBrowserBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("low");
    expect(result.source).toBe("default");
  });

  test("detects dark mode preference", () => {
    const originalWindow = global.window;
    global.window = {
      matchMedia: (query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    } as any;

    const result = detectBrowserBackground();
    expect(result.scheme).toBe("dark");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("browser");
    expect(result.details?.mediaQuery).toBe(true);
    expect(result.details?.systemPreference).toBe("dark");

    global.window = originalWindow;
  });

  test("detects light mode preference", () => {
    const originalWindow = global.window;
    global.window = {
      matchMedia: (query: string) => ({
        matches: query === "(prefers-color-scheme: light)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    } as any;

    const result = detectBrowserBackground();
    expect(result.scheme).toBe("light");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("browser");
    expect(result.details?.systemPreference).toBe("light");

    global.window = originalWindow;
  });

  test("returns auto when no preference detected", () => {
    const originalWindow = global.window;
    global.window = {
      matchMedia: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    } as any;

    const result = detectBrowserBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("medium");
    expect(result.source).toBe("browser");
    expect(result.details?.mediaQuery).toBe(false);

    global.window = originalWindow;
  });
});

describe("detectSystemBackground", () => {
  const originalEnv = process.env;
  const originalPlatform = process.platform;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    Object.defineProperty(process, "platform", { value: originalPlatform });
  });

  test("detects macOS dark mode", () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    process.env.APPLE_INTERFACE_STYLE = "Dark";
    const result = detectSystemBackground();
    expect(result.scheme).toBe("dark");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("system");
    expect(result.details?.systemPreference).toBe("Dark");
  });

  test("detects macOS light mode", () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    process.env.APPLE_INTERFACE_STYLE = "Light";
    const result = detectSystemBackground();
    expect(result.scheme).toBe("light");
    expect(result.confidence).toBe("high");
    expect(result.source).toBe("system");
  });

  test("returns auto for Windows", () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    const result = detectSystemBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("low");
    expect(result.source).toBe("system");
  });

  test("detects Linux desktop environment", () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    process.env.DESKTOP_SESSION = "gnome";
    const result = detectSystemBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("medium");
    expect(result.source).toBe("system");
    expect(result.details?.systemPreference).toBe("gnome");
  });

  test("detects XDG desktop environment", () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    process.env.XDG_CURRENT_DESKTOP = "KDE";
    const result = detectSystemBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("medium");
    expect(result.source).toBe("system");
    expect(result.details?.systemPreference).toBe("KDE");
  });

  test("returns auto when no system info available", () => {
    Object.defineProperty(process, "platform", { value: "freebsd" });
    delete process.env.APPLE_INTERFACE_STYLE;
    delete process.env.DESKTOP_SESSION;
    delete process.env.XDG_CURRENT_DESKTOP;
    const result = detectSystemBackground();
    expect(result.scheme).toBe("auto");
    expect(result.confidence).toBe("low");
    expect(result.source).toBe("default");
  });
});

describe("detectBackground", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("prioritizes high confidence terminal detection", () => {
    process.env.COLORFGBG = "15;0";
    const result = detectBackground();
    expect(result.scheme).toBe("dark");
    expect(result.source).toBe("terminal");
    expect(result.confidence).toBe("high");
  });

  test("uses medium confidence terminal over low confidence system", () => {
    process.env.TERM_PROGRAM = "iTerm.app";
    const result = detectBackground();
    expect(result.scheme).toBe("dark");
    expect(result.source).toBe("terminal");
    expect(result.confidence).toBe("medium");
  });

  test("falls back to default when all confidence is low", () => {
    delete process.env.COLORFGBG;
    delete process.env.TERM_PROGRAM;
    delete process.env.APPLE_INTERFACE_STYLE;
    const result = detectBackground();
    expect(result.confidence).toBe("low");
  });
});

describe("helper functions", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("isDarkBackground returns true for dark schemes", () => {
    process.env.COLORFGBG = "15;0";
    expect(isDarkBackground()).toBe(true);
  });

  test("isDarkBackground returns true for auto with default source", () => {
    delete process.env.COLORFGBG;
    delete process.env.TERM_PROGRAM;
    expect(isDarkBackground()).toBe(true);
  });

  test("isLightBackground returns true for light schemes", () => {
    process.env.COLORFGBG = "0;7";
    expect(isLightBackground()).toBe(true);
  });

  test("isLightBackground returns false for dark schemes", () => {
    process.env.COLORFGBG = "15;0";
    expect(isLightBackground()).toBe(false);
  });

  test("getRecommendedThemeMode returns dark for dark background", () => {
    process.env.COLORFGBG = "15;0";
    expect(getRecommendedThemeMode()).toBe("dark");
  });

  test("getRecommendedThemeMode returns light for light background", () => {
    process.env.COLORFGBG = "0;7";
    expect(getRecommendedThemeMode()).toBe("light");
  });
});

describe("watchBackgroundChanges", () => {
  test("returns no-op function when not in browser", () => {
    const callback = () => {};
    const unsubscribe = watchBackgroundChanges(callback);
    expect(typeof unsubscribe).toBe("function");
    unsubscribe();
  });

  test("subscribes to media query changes in browser", () => {
    const originalWindow = global.window;
    const listeners: Array<() => void> = [];

    global.window = {
      matchMedia: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: (event: string, handler: () => void) => {
          if (event === "change") listeners.push(handler);
        },
        removeEventListener: (event: string, handler: () => void) => {
          const index = listeners.indexOf(handler);
          if (index > -1) listeners.splice(index, 1);
        },
        dispatchEvent: () => true,
      }),
    } as any;

    let callbackCalled = false;
    const callback = () => {
      callbackCalled = true;
    };

    const unsubscribe = watchBackgroundChanges(callback);
    expect(typeof unsubscribe).toBe("function");
    expect(listeners.length).toBeGreaterThan(0);

    listeners[0]();
    expect(callbackCalled).toBe(true);

    unsubscribe();
    expect(listeners.length).toBe(0);

    global.window = originalWindow;
  });

  test("uses legacy addListener API if addEventListener not available", () => {
    const originalWindow = global.window;
    const listeners: Array<() => void> = [];

    global.window = {
      matchMedia: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: (handler: () => void) => {
          listeners.push(handler);
        },
        removeListener: (handler: () => void) => {
          const index = listeners.indexOf(handler);
          if (index > -1) listeners.splice(index, 1);
        },
        dispatchEvent: () => true,
      }),
    } as any;

    const callback = () => {};
    const unsubscribe = watchBackgroundChanges(callback);

    expect(typeof unsubscribe).toBe("function");
    expect(listeners.length).toBeGreaterThan(0);

    unsubscribe();
    expect(listeners.length).toBe(0);

    global.window = originalWindow;
  });
});
