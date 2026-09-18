import { CONTRAST } from "./constants";

export function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace(/^#/, "");

  let r: number, g: number, b: number;

  if (cleaned.length === 3) {
    const red = cleaned[0] + cleaned[0];
    const green = cleaned[1] + cleaned[1];
    const blue = cleaned[2] + cleaned[2];
    r = parseInt(red, 16);
    g = parseInt(green, 16);
    b = parseInt(blue, 16);
  } else if (cleaned.length === 6) {
    r = parseInt(cleaned.substring(0, 2), 16);
    g = parseInt(cleaned.substring(2, 4), 16);
    b = parseInt(cleaned.substring(4, 6), 16);
  } else {
    r = 0;
    g = 0;
    b = 0;
  }

  return [r, g, b];
}

export function calculateChannelLuminance(channelValue: number): number {
  const normalized = channelValue / 255;

  if (normalized <= CONTRAST.GAMMA_THRESHOLD) {
    return normalized / CONTRAST.GAMMA_DIVISOR;
  }

  const adjusted =
    (normalized + CONTRAST.GAMMA_OFFSET) / CONTRAST.GAMMA_MULTIPLIER;
  return Math.pow(
    adjusted,
    CONTRAST.GAMMA_EXPONENT,
  );
}

export function calculateRelativeLuminance(
  rgb: [number, number, number],
): number {
  const [r, g, b] = rgb;

  const rLuminance = calculateChannelLuminance(r);
  const gLuminance = calculateChannelLuminance(g);
  const bLuminance = calculateChannelLuminance(b);

  const luminance =
    rLuminance * CONTRAST.R_COEFFICIENT +
    gLuminance * CONTRAST.G_COEFFICIENT +
    bLuminance * CONTRAST.B_COEFFICIENT;
  return luminance;
}

export function hexContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const luminance1 = calculateRelativeLuminance(rgb1);
  const luminance2 = calculateRelativeLuminance(rgb2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  const numerator = lighter + 0.05;
  const denominator = darker + 0.05;
  return numerator / denominator;
}

export default hexContrastRatio;
