import { colors } from "./colors";

export function isDarkColor(hex: string): boolean {
  const color = hex.replace("#", "");

  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance < 0.5;
}

export function getAccessibleTextColors(
  backgroundColor: string,
  contrastLevel: "AAA" | "AA" = "AA",
) {
  const isDark = isDarkColor(backgroundColor);

  if (isDark) {
    const textLevel = contrastLevel === "AAA" ? 50 : 100;
    const accentLevel = contrastLevel === "AAA" ? 300 : 400;

    return {
      text: colors.gray[textLevel],
      info: colors.sky[accentLevel],
      warn: colors.amber[accentLevel],
      error: colors.red[accentLevel],
      success: colors.green[accentLevel],
      debug: colors.purple[accentLevel],
      number: colors.cyan[accentLevel],
      string: colors.lime[accentLevel],
    };
  }

  const textLevel = contrastLevel === "AAA" ? 900 : 800;
  const accentLevel = contrastLevel === "AAA" ? 700 : 600;

  return {
    text: colors.gray[textLevel],
    info: colors.sky[accentLevel],
    warn: colors.amber[accentLevel],
    error: colors.red[accentLevel],
    success: colors.green[accentLevel],
    debug: colors.purple[accentLevel],
    number: colors.cyan[accentLevel],
    string: colors.lime[accentLevel],
  };
}

export function getWCAGLevel(
  ratio: number,
  isLargeText: boolean = false,
): "AAA" | "AA" | "A" | "FAIL" {
  if (isLargeText) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
    return "FAIL";
  }

  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "A";
  return "FAIL";
}

export function getWCAGRecommendations(ratio: number): string[] {
  const recommendations: string[] = [];

  if (ratio < 3) {
    recommendations.push(
      `Current contrast ratio (${ratio.toFixed(2)}:1) is below minimum standards`,
    );
    recommendations.push("Minimum 3:1 for large text, 4.5:1 for normal text");
  } else if (ratio < 4.5) {
    recommendations.push(
      "Contrast meets Level A for large text only (18pt+ or 14pt+ bold)",
    );
    recommendations.push(
      "Consider increasing contrast to 4.5:1 for normal text",
    );
  } else if (ratio < 7) {
    recommendations.push("Contrast meets Level AA for normal text");
    recommendations.push("Consider increasing to 7:1 for Level AAA compliance");
  }

  return recommendations;
}
