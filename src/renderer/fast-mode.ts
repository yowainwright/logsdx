const ANSI_RESET = "\x1b[0m";
const ANSI_RED_BOLD = "\x1b[31;1m";
const ANSI_YELLOW_BOLD = "\x1b[33;1m";
const ANSI_BLUE = "\x1b[34m";
const ANSI_GREEN = "\x1b[32m";
const ANSI_GRAY = "\x1b[90m";

const LOG_LEVELS = {
  ERROR: ANSI_RED_BOLD,
  ERR: ANSI_RED_BOLD,
  FATAL: ANSI_RED_BOLD,
  WARN: ANSI_YELLOW_BOLD,
  WARNING: ANSI_YELLOW_BOLD,
  INFO: ANSI_BLUE,
  SUCCESS: ANSI_GREEN,
  DEBUG: ANSI_GRAY,
  TRACE: ANSI_GRAY,
} as const;

const FAST_REGEX = new RegExp(
  `\\b(${Object.keys(LOG_LEVELS).join("|")})\\b`,
  "gi",
);

export function processFast(line: string): string {
  return line.replace(FAST_REGEX, (match) => {
    const level = match.toUpperCase() as keyof typeof LOG_LEVELS;
    const color = LOG_LEVELS[level];
    return color ? `${color}${match}${ANSI_RESET}` : match;
  });
}

export function processFastHtml(line: string): string {
  const colorMap: Record<keyof typeof LOG_LEVELS, string> = {
    ERROR: "#ff5555",
    ERR: "#ff5555",
    FATAL: "#ff0000",
    WARN: "#ffb86c",
    WARNING: "#ffb86c",
    INFO: "#8be9fd",
    SUCCESS: "#50fa7b",
    DEBUG: "#6272a4",
    TRACE: "#6272a4",
  };

  return line.replace(FAST_REGEX, (match) => {
    const level = match.toUpperCase() as keyof typeof LOG_LEVELS;
    const color = colorMap[level];
    return color
      ? `<span style="color:${color};font-weight:bold">${match}</span>`
      : match;
  });
}

export function isFastModeEnabled(options?: { fast?: boolean }): boolean {
  return options?.fast === true;
}
