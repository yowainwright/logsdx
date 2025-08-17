/**
 * Terminal background detection utilities
 */

/**
 * Detects if the terminal has a dark background
 */
export function isTerminalDark(): boolean {
  // Check environment variables
  if (process.env.COLORFGBG) {
    // Format: "foreground;background" (e.g., "15;0" for white on black)
    const [, bg] = process.env.COLORFGBG.split(";").map(Number);
    // Background colors 0-7 are typically dark
    return bg <= 7;
  }

  // Check terminal program
  const darkTerminals = [
    "iTerm.app",
    "Hyper",
    "Windows Terminal",
    "alacritty",
    "kitty",
  ];

  if (darkTerminals.includes(process.env.TERM_PROGRAM || "")) {
    return true;
  }

  // Check for common dark terminal indicators
  if (process.env.TERMINAL_EMULATOR === "JetBrains-JediTerm") {
    return true;
  }

  // VSCode integrated terminal is typically dark
  if (process.env.TERM_PROGRAM === "vscode") {
    return true;
  }

  // Default to dark (most modern terminals use dark themes)
  return true;
}

/**
 * Adjusts a theme for terminal visibility
 * Light themes in dark terminals need inverted text colors
 */
export function adjustThemeForTerminal(
  theme: any,
  terminalIsDark: boolean,
): any {
  // If theme doesn't have explicit mode, try to infer from name
  let themeIsDark = theme.mode === "dark";
  if (!theme.mode) {
    // Fallback to name-based detection
    themeIsDark = !theme.name.toLowerCase().includes("light");
  }

  // If theme mode matches terminal, no adjustment needed
  if (themeIsDark === terminalIsDark) {
    return theme;
  }

  // Light theme in dark terminal - need to invert text colors
  if (!themeIsDark && terminalIsDark) {
    return {
      ...theme,
      schema: {
        ...theme.schema,
        defaultStyle: {
          ...theme.schema?.defaultStyle,
          // Use light text for visibility
          color: "#e6e6e6",
        },
        rules: theme.schema?.rules?.map((rule: any) => {
          // Keep colored elements as-is, but lighten very dark colors
          if (rule.style?.color) {
            const color = rule.style.color;
            // If it's a very dark color (like text color), replace with light
            if (isVeryDarkColor(color)) {
              return {
                ...rule,
                style: {
                  ...rule.style,
                  color: "#e6e6e6",
                },
              };
            }
          }
          return rule;
        }),
      },
    };
  }

  // Dark theme in light terminal - need darker text
  if (themeIsDark && !terminalIsDark) {
    return {
      ...theme,
      schema: {
        ...theme.schema,
        defaultStyle: {
          ...theme.schema?.defaultStyle,
          color: "#2e2e2e",
        },
      },
    };
  }

  return theme;
}

/**
 * Checks if a color is very dark (would be invisible on dark background)
 */
function isVeryDarkColor(color: string): boolean {
  // Common dark text colors that need adjustment
  const darkColors = [
    "#000000",
    "#1f2328",
    "#24292f",
    "#1a1a1a",
    "#2e2e2e",
    "#333333",
    "#2d2d2d",
    "#1e1e1e",
  ];

  return darkColors.includes(color.toLowerCase());
}

/**
 * Gets a theme name adjusted for terminal visibility
 */
export function getTerminalAdjustedTheme(themeName: string): string {
  const isDark = isTerminalDark();

  // Map light themes to dark variants in dark terminals
  const adjustmentMap: Record<string, string> = {
    "github-light": isDark ? "github-dark" : "github-light",
    "solarized-light": isDark ? "solarized-dark" : "solarized-light",
    // Dark themes generally work well in both environments
    "github-dark": "github-dark",
    "solarized-dark": "solarized-dark",
    dracula: "dracula",
    "oh-my-zsh": "oh-my-zsh",
  };

  return adjustmentMap[themeName] || themeName;
}

/**
 * Validates cross-environment consistency for a theme
 */
export function validateCrossEnvironmentConsistency(theme: any): {
  isConsistent: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if theme has mode specified
  if (!theme.mode) {
    issues.push(
      "Theme mode not specified - may not adapt properly to different environments",
    );
    recommendations.push(
      'Add mode: "light" | "dark" | "auto" to theme configuration',
    );
  }

  // Check for very light colors in potential dark environments
  if (theme.schema?.defaultStyle?.color) {
    const color = theme.schema.defaultStyle.color;
    if (color.match(/^#[fF]{6}$/) || color === "white") {
      recommendations.push(
        "Consider using slightly off-white colors for better terminal compatibility",
      );
    }
  }

  return {
    isConsistent: issues.length === 0,
    issues,
    recommendations,
  };
}
