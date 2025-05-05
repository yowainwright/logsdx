/**
 * Creates a 256-color foreground color code
 * @param code Color code (0-255)
 * @returns ANSI color code string
 */
export function fg256(code: number): string {
  return `\x1b[38;5;${code}m`;
}

/**
 * Creates a 256-color background color code
 * @param code Color code (0-255)
 * @returns ANSI color code string
 */
export function bg256(code: number): string {
  return `\x1b[48;5;${code}m`;
}

/**
 * Creates a 24-bit RGB foreground color code
 * @param r Red (0-255)
 * @param g Green (0-255)
 * @param b Blue (0-255)
 * @returns ANSI color code string
 */
export function fgRGB(r: number, g: number, b: number): string {
  return `\x1b[38;2;${r};${g};${b}m`;
}

/**
 * Creates a 24-bit RGB background color code
 * @param r Red (0-255)
 * @param g Green (0-255)
 * @param b Blue (0-255)
 * @returns ANSI color code string
 */
export function bgRGB(r: number, g: number, b: number): string {
  return `\x1b[48;2;${r};${g};${b}m`;
}
