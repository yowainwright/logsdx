export type ColorScheme = "light" | "dark" | "auto";

export interface BackgroundInfo {
  scheme: ColorScheme;
  confidence: "high" | "medium" | "low";
  source: "terminal" | "browser" | "system" | "default";
  details?: {
    termProgram?: string;
    colorFgBg?: string;
    mediaQuery?: boolean;
    systemPreference?: string;
  };
}

export function detectTerminalBackground(): BackgroundInfo {
  if (process.env.COLORFGBG) {
    const parts = process.env.COLORFGBG.split(";");
    if (parts.length >= 2) {
      const bgColor = parseInt(parts[1], 10);
      if (!isNaN(bgColor)) {
        return {
          scheme: bgColor === 7 || bgColor === 15 ? "light" : "dark",
          confidence: "high",
          source: "terminal",
          details: { colorFgBg: process.env.COLORFGBG },
        };
      }
    }
  }

  const termProgram = process.env.TERM_PROGRAM;
  if (termProgram) {
    const darkTerminals = [
      "iTerm.app",
      "WarpTerminal",
      "Hyper",
      "Alacritty",
      "kitty",
      "WezTerm",
    ];

    const lightTerminals = ["Apple_Terminal"];

    if (darkTerminals.includes(termProgram)) {
      return {
        scheme: "dark",
        confidence: "medium",
        source: "terminal",
        details: { termProgram },
      };
    }

    if (lightTerminals.includes(termProgram)) {
      return {
        scheme: "light",
        confidence: "medium",
        source: "terminal",
        details: { termProgram },
      };
    }
  }

  if (
    process.env.VSCODE_PID ||
    process.env.TERM_PROGRAM_VERSION?.includes("vscode")
  ) {
    return {
      scheme: "auto",
      confidence: "low",
      source: "terminal",
      details: { termProgram: "vscode" },
    };
  }

  return {
    scheme: "dark",
    confidence: "low",
    source: "default",
  };
}

export function detectBrowserBackground(): BackgroundInfo {
  if (typeof window === "undefined" || !window.matchMedia) {
    return {
      scheme: "auto",
      confidence: "low",
      source: "default",
    };
  }

  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const lightModeQuery = window.matchMedia("(prefers-color-scheme: light)");

  if (darkModeQuery.matches) {
    return {
      scheme: "dark",
      confidence: "high",
      source: "browser",
      details: { mediaQuery: true, systemPreference: "dark" },
    };
  }

  if (lightModeQuery.matches) {
    return {
      scheme: "light",
      confidence: "high",
      source: "browser",
      details: { mediaQuery: true, systemPreference: "light" },
    };
  }

  return {
    scheme: "auto",
    confidence: "medium",
    source: "browser",
    details: { mediaQuery: false },
  };
}

export function detectSystemBackground(): BackgroundInfo {
  if (process.platform === "darwin") {
    const appleInterfaceStyle = process.env.APPLE_INTERFACE_STYLE;
    if (appleInterfaceStyle) {
      return {
        scheme: appleInterfaceStyle.toLowerCase() === "dark" ? "dark" : "light",
        confidence: "high",
        source: "system",
        details: { systemPreference: appleInterfaceStyle },
      };
    }
  }

  if (process.platform === "win32") {
    return {
      scheme: "auto",
      confidence: "low",
      source: "system",
    };
  }

  const desktopSession = process.env.DESKTOP_SESSION;
  const xdgCurrentDesktop = process.env.XDG_CURRENT_DESKTOP;

  if (desktopSession || xdgCurrentDesktop) {
    return {
      scheme: "auto",
      confidence: "medium",
      source: "system",
      details: {
        systemPreference: desktopSession || xdgCurrentDesktop,
      },
    };
  }

  return {
    scheme: "auto",
    confidence: "low",
    source: "default",
  };
}

export function detectBackground(): BackgroundInfo {
  if (typeof window !== "undefined") {
    const browserInfo = detectBrowserBackground();
    if (browserInfo.confidence === "high") {
      return browserInfo;
    }
  }

  const terminalInfo = detectTerminalBackground();
  if (
    terminalInfo.confidence === "high" ||
    terminalInfo.confidence === "medium"
  ) {
    return terminalInfo;
  }

  const systemInfo = detectSystemBackground();
  if (systemInfo.confidence === "high") {
    return systemInfo;
  }

  return terminalInfo.confidence >= systemInfo.confidence
    ? terminalInfo
    : systemInfo;
}

export function isDarkBackground(): boolean {
  const info = detectBackground();
  return (
    info.scheme === "dark" ||
    (info.scheme === "auto" && info.source === "default")
  );
}

export function isLightBackground(): boolean {
  const info = detectBackground();
  return info.scheme === "light";
}

export function getRecommendedThemeMode(): "light" | "dark" {
  return isDarkBackground() ? "dark" : "light";
}

export function watchBackgroundChanges(
  callback: (info: BackgroundInfo) => void,
): () => void {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }

  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const lightModeQuery = window.matchMedia("(prefers-color-scheme: light)");

  const handleChange = () => {
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
