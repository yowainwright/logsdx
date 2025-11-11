import { colors } from "./color-constants";

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
    return {
      text: contrastLevel === "AAA" ? colors.gray[50] : colors.gray[100],
      info: contrastLevel === "AAA" ? colors.sky[300] : colors.sky[400],
      warn: contrastLevel === "AAA" ? colors.amber[300] : colors.amber[400],
      error: contrastLevel === "AAA" ? colors.red[300] : colors.red[400],
      success: contrastLevel === "AAA" ? colors.green[300] : colors.green[400],
      debug: contrastLevel === "AAA" ? colors.purple[300] : colors.purple[400],
      number: contrastLevel === "AAA" ? colors.cyan[300] : colors.cyan[400],
      string: contrastLevel === "AAA" ? colors.lime[300] : colors.lime[400],
    };
  } else {
    return {
      text: contrastLevel === "AAA" ? colors.gray[900] : colors.gray[800],
      info: contrastLevel === "AAA" ? colors.sky[700] : colors.sky[600],
      warn: contrastLevel === "AAA" ? colors.amber[700] : colors.amber[600],
      error: contrastLevel === "AAA" ? colors.red[700] : colors.red[600],
      success: contrastLevel === "AAA" ? colors.green[700] : colors.green[600],
      debug: contrastLevel === "AAA" ? colors.purple[700] : colors.purple[600],
      number: contrastLevel === "AAA" ? colors.cyan[700] : colors.cyan[600],
      string: contrastLevel === "AAA" ? colors.lime[700] : colors.lime[600],
    };
  }
}

export function getWCAGLevel(
  ratio: number,
  isLargeText: boolean = false,
): "AAA" | "AA" | "A" | "FAIL" {
  if (isLargeText) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
    return "FAIL";
  } else {
    if (ratio >= 7) return "AAA";
    if (ratio >= 4.5) return "AA";
    if (ratio >= 3) return "A";
    return "FAIL";
  }
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
