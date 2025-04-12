// ANSI escape codes for text styling
const ANSI = {
  // Reset
  reset: "\x1b[0m",

  // Text styles
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  strikethrough: "\x1b[9m",

  // Foreground colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // Bright foreground colors
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",

  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
  bgGray: "\x1b[100m",

  // Bright background colors
  bgBrightRed: "\x1b[101m",
  bgBrightGreen: "\x1b[102m",
  bgBrightYellow: "\x1b[103m",
  bgBrightBlue: "\x1b[104m",
  bgBrightMagenta: "\x1b[105m",
  bgBrightCyan: "\x1b[106m",
  bgBrightWhite: "\x1b[107m",
} as const;

// Style configurations for different log levels
const LEVEL_STYLES = {
  error: [ANSI.bold, ANSI.brightRed],
  warn: [ANSI.yellow],
  info: [ANSI.blue],
  debug: [ANSI.dim, ANSI.gray],
  success: [ANSI.green],
  trace: [ANSI.dim, ANSI.white],
} as const;

/**
 * Applies ANSI styles to a string
 * @param str The string to style
 * @param styles Array of ANSI style codes to apply
 * @returns The styled string
 */
export const applyStyles = (str: string, styles: string[]): string => {
  if (!styles.length) return str;
  return `${styles.join("")}${str}${ANSI.reset}`;
};

/**
 * Styles a line based on its log level
 * @param line The line to style
 * @param level Optional log level to determine styling
 * @returns The styled line
 */
export const styleLine = (line: string, level?: string): string => {
  const styles = level
    ? Array.from(LEVEL_STYLES[level as keyof typeof LEVEL_STYLES] || [])
    : [];
  return applyStyles(line, styles);
};

/**
 * Creates a styled string with custom ANSI codes
 * @param str The string to style
 * @param style The style or array of styles to apply
 * @returns The styled string
 */
export const style = (
  str: string,
  style: keyof typeof ANSI | (keyof typeof ANSI)[],
): string => {
  const styles = Array.isArray(style)
    ? style.map((s) => ANSI[s])
    : [ANSI[style]];
  return applyStyles(str, styles);
};

// Export ANSI codes for direct usage
export { ANSI };

// Export style configurations
export { LEVEL_STYLES };
