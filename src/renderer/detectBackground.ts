import type { BackgroundInfo, ColorScheme, ConfidenceLevel } from "./types";
import {
  parseColorFgBg,
  isLightBgColor,
  isBrowser,
  hasMatchMedia,
} from "./utils";
import {
  DARK_TERMINALS,
  LIGHT_TERMINALS,
  DEFAULT_DARK_BACKGROUND,
  DEFAULT_AUTO_BACKGROUND,
} from "./constants";

function getEnv(key: string): string | undefined {
  const hasProcess = typeof process !== "undefined" && process.env;
  return hasProcess ? process.env[key] : undefined;
}

function getPlatform(): string | undefined {
  const hasProcess = typeof process !== "undefined";
  return hasProcess ? process.platform : undefined;
}

function createBackgroundInfo(
  scheme: ColorScheme,
  confidence: ConfidenceLevel,
  source: BackgroundInfo["source"],
  details?: BackgroundInfo["details"],
): BackgroundInfo {
  return { scheme, confidence, source, ...(details && { details }) } as const;
}

function detectFromColorFgBg(): BackgroundInfo | undefined {
  const colorFgBg = getEnv("COLORFGBG");
  if (!colorFgBg) return undefined;

  const bgColor = parseColorFgBg(colorFgBg);
  if (bgColor === undefined) return undefined;

  const scheme = isLightBgColor(bgColor) ? "light" : "dark";
  return createBackgroundInfo(scheme, "high", "terminal", { colorFgBg });
}

function detectFromTermProgram(): BackgroundInfo | undefined {
  const termProgram = getEnv("TERM_PROGRAM");
  if (!termProgram) return undefined;

  if (DARK_TERMINALS.includes(termProgram)) {
    return createBackgroundInfo("dark", "medium", "terminal", { termProgram });
  }
  if (LIGHT_TERMINALS.includes(termProgram)) {
    return createBackgroundInfo("light", "medium", "terminal", { termProgram });
  }
  return undefined;
}

function isVSCode(): boolean {
  const hasVscodePid = Boolean(getEnv("VSCODE_PID"));
  const versionStr = getEnv("TERM_PROGRAM_VERSION") || "";
  return hasVscodePid || versionStr.includes("vscode");
}

function detectFromVSCode(): BackgroundInfo | undefined {
  if (!isVSCode()) return undefined;
  return createBackgroundInfo("auto", "low", "terminal", { termProgram: "vscode" });
}

export function detectTerminalBackground(): BackgroundInfo {
  const fromColorFgBg = detectFromColorFgBg();
  if (fromColorFgBg) {
    return fromColorFgBg;
  }

  const fromTermProgram = detectFromTermProgram();
  if (fromTermProgram) {
    return fromTermProgram;
  }

  const fromVSCode = detectFromVSCode();
  if (fromVSCode) {
    return fromVSCode;
  }

  return DEFAULT_DARK_BACKGROUND;
}

function matchesColorScheme(scheme: "dark" | "light"): boolean {
  if (!hasMatchMedia()) {
    return false;
  }

  const query = window.matchMedia(`(prefers-color-scheme: ${scheme})`);
  return query.matches;
}

export function detectBrowserBackground(): BackgroundInfo {
  if (!hasMatchMedia()) {
    return DEFAULT_AUTO_BACKGROUND;
  }

  if (matchesColorScheme("dark")) {
    return createBackgroundInfo("dark", "high", "browser", {
      mediaQuery: true,
      systemPreference: "dark",
    });
  }

  if (matchesColorScheme("light")) {
    return createBackgroundInfo("light", "high", "browser", {
      mediaQuery: true,
      systemPreference: "light",
    });
  }

  return createBackgroundInfo("auto", "medium", "browser", {
    mediaQuery: false,
  });
}

function detectFromMacOS(): BackgroundInfo | undefined {
  if (getPlatform() !== "darwin") return undefined;

  const appleInterfaceStyle = getEnv("APPLE_INTERFACE_STYLE");
  if (!appleInterfaceStyle) return undefined;

  const scheme = appleInterfaceStyle.toLowerCase() === "dark" ? "dark" : "light";
  return createBackgroundInfo(scheme, "high", "system", { systemPreference: appleInterfaceStyle });
}

function detectFromWindows(): BackgroundInfo | undefined {
  if (getPlatform() !== "win32") return undefined;
  return createBackgroundInfo("auto", "low", "system");
}

function detectFromLinux(): BackgroundInfo | undefined {
  const desktopSession = getEnv("DESKTOP_SESSION");
  const xdgCurrentDesktop = getEnv("XDG_CURRENT_DESKTOP");

  if (!desktopSession && !xdgCurrentDesktop) return undefined;
  return createBackgroundInfo("auto", "medium", "system", {
    systemPreference: desktopSession || xdgCurrentDesktop,
  });
}

export function detectSystemBackground(): BackgroundInfo {
  const fromMacOS = detectFromMacOS();
  if (fromMacOS) {
    return fromMacOS;
  }

  const fromWindows = detectFromWindows();
  if (fromWindows) {
    return fromWindows;
  }

  const fromLinux = detectFromLinux();
  if (fromLinux) {
    return fromLinux;
  }

  return DEFAULT_AUTO_BACKGROUND;
}

function hasHigherConfidence(a: ConfidenceLevel, b: ConfidenceLevel): boolean {
  const confidenceOrder: Record<ConfidenceLevel, number> = {
    high: 3,
    medium: 2,
    low: 1,
  } as const;

  return confidenceOrder[a] >= confidenceOrder[b];
}

export function detectBackground(): BackgroundInfo {
  if (isBrowser()) {
    const browserInfo = detectBrowserBackground();
    if (browserInfo.confidence === "high") {
      return browserInfo;
    }
  }

  const terminalInfo = detectTerminalBackground();
  const isTerminalReliable =
    terminalInfo.confidence === "high" || terminalInfo.confidence === "medium";

  if (isTerminalReliable) {
    return terminalInfo;
  }

  const systemInfo = detectSystemBackground();
  if (systemInfo.confidence === "high") {
    return systemInfo;
  }

  return hasHigherConfidence(terminalInfo.confidence, systemInfo.confidence)
    ? terminalInfo
    : systemInfo;
}

export function isDarkBackground(): boolean {
  const info = detectBackground();
  const isDefaultAuto = info.scheme === "auto" && info.source === "default";

  return info.scheme === "dark" || isDefaultAuto;
}

export function isLightBackground(): boolean {
  const info = detectBackground();
  return info.scheme === "light";
}

export function getRecommendedThemeMode(): "light" | "dark" {
  return isDarkBackground() ? "dark" : "light";
}

function setupMediaQueryListeners(
  callback: (info: BackgroundInfo) => void,
): () => void {
  if (!hasMatchMedia()) {
    return () => {};
  }

  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const lightModeQuery = window.matchMedia("(prefers-color-scheme: light)");

  const handleChange = (): void => {
    callback(detectBrowserBackground());
  };

  if (darkModeQuery.addEventListener) {
    darkModeQuery.addEventListener("change", handleChange);
    lightModeQuery.addEventListener("change", handleChange);

    return () => {
      darkModeQuery.removeEventListener("change", handleChange);
      lightModeQuery.removeEventListener("change", handleChange);
    };
  }

  if (darkModeQuery.addListener) {
    darkModeQuery.addListener(handleChange);
    lightModeQuery.addListener(handleChange);

    return () => {
      darkModeQuery.removeListener(handleChange);
      lightModeQuery.removeListener(handleChange);
    };
  }

  return () => {};
}

export function watchBackgroundChanges(
  callback: (info: BackgroundInfo) => void,
): () => void {
  return setupMediaQueryListeners(callback);
}
