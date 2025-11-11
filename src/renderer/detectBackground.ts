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

function createBackgroundInfo(
  scheme: ColorScheme,
  confidence: ConfidenceLevel,
  source: BackgroundInfo["source"],
  details?: BackgroundInfo["details"],
): BackgroundInfo {
  return {
    scheme,
    confidence,
    source,
    ...(details && { details }),
  } as const;
}

function detectFromColorFgBg(): BackgroundInfo | undefined {
  const colorFgBg = process.env.COLORFGBG;

  if (!colorFgBg) {
    return undefined;
  }

  const bgColor = parseColorFgBg(colorFgBg);

  if (bgColor === undefined) {
    return undefined;
  }

  const scheme = isLightBgColor(bgColor) ? "light" : "dark";

  return createBackgroundInfo(scheme, "high", "terminal", { colorFgBg });
}

function isTerminalInList(
  termProgram: string,
  list: ReadonlyArray<string>,
): boolean {
  return list.includes(termProgram);
}

function detectFromTermProgram(): BackgroundInfo | undefined {
  const termProgram = process.env.TERM_PROGRAM;

  if (!termProgram) {
    return undefined;
  }

  if (isTerminalInList(termProgram, DARK_TERMINALS)) {
    return createBackgroundInfo("dark", "medium", "terminal", { termProgram });
  }

  if (isTerminalInList(termProgram, LIGHT_TERMINALS)) {
    return createBackgroundInfo("light", "medium", "terminal", { termProgram });
  }

  return undefined;
}

function isVSCode(): boolean {
  const hasVscodePid = Boolean(process.env.VSCODE_PID);
  const hasVscodeVersion = Boolean(
    process.env.TERM_PROGRAM_VERSION?.includes("vscode"),
  );

  return hasVscodePid || hasVscodeVersion;
}

function detectFromVSCode(): BackgroundInfo | undefined {
  if (!isVSCode()) {
    return undefined;
  }

  return createBackgroundInfo("auto", "low", "terminal", {
    termProgram: "vscode",
  });
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
  if (process.platform !== "darwin") {
    return undefined;
  }

  const appleInterfaceStyle = process.env.APPLE_INTERFACE_STYLE;

  if (!appleInterfaceStyle) {
    return undefined;
  }

  const scheme =
    appleInterfaceStyle.toLowerCase() === "dark" ? "dark" : "light";

  return createBackgroundInfo(scheme, "high", "system", {
    systemPreference: appleInterfaceStyle,
  });
}

function detectFromWindows(): BackgroundInfo | undefined {
  if (process.platform !== "win32") {
    return undefined;
  }

  return createBackgroundInfo("auto", "low", "system");
}

function detectFromLinux(): BackgroundInfo | undefined {
  const desktopSession = process.env.DESKTOP_SESSION;
  const xdgCurrentDesktop = process.env.XDG_CURRENT_DESKTOP;

  if (!desktopSession && !xdgCurrentDesktop) {
    return undefined;
  }

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
