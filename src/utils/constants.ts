export const CONTRAST = {
  R_COEFFICIENT: 0.2126,
  G_COEFFICIENT: 0.7152,
  B_COEFFICIENT: 0.0722,
  GAMMA_THRESHOLD: 0.03928,
  GAMMA_DIVISOR: 12.92,
  GAMMA_OFFSET: 0.055,
  GAMMA_MULTIPLIER: 1.055,
  GAMMA_EXPONENT: 2.4,
} as const;

export const STYLES = {
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m",
  gray: "\x1B[90m",
  redBright: "\x1B[91m",
  greenBright: "\x1B[92m",
  yellowBright: "\x1B[93m",
  blueBright: "\x1B[94m",
  magentaBright: "\x1B[95m",
  cyanBright: "\x1B[96m",
  whiteBright: "\x1B[97m",
  bold: "\x1B[1m",
  dim: "\x1B[2m",
  italic: "\x1B[3m",
  underline: "\x1B[4m",
  reset: "\x1B[0m",
} as const;

export const SPINNER_FRAMES = ["-", "\\", "|", "/"];

// eslint-disable-next-line no-control-regex
export const ANSI_ESCAPE_REGEX = /\x1B\[[0-9;]*m/g;

export const ANSI_STRIP_REGEX =
  // eslint-disable-next-line no-control-regex
  /[\u001B\u009B][[\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*|[a-zA-Z\d]+(?:;[-a-zA-Z\d/#&.:=?%@~_]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-ntqry=><~]))/g;

export const LOG_LEVEL_PRIORITY = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
} as const;

export const BORDER_STYLES = {
  single: {
    topLeft: "┌",
    topRight: "┐",
    bottomLeft: "└",
    bottomRight: "┘",
    horizontal: "─",
    vertical: "│",
  },
  double: {
    topLeft: "╔",
    topRight: "╗",
    bottomLeft: "╚",
    bottomRight: "╝",
    horizontal: "═",
    vertical: "║",
  },
  round: {
    topLeft: "╭",
    topRight: "╮",
    bottomLeft: "╰",
    bottomRight: "╯",
    horizontal: "─",
    vertical: "│",
  },
  bold: {
    topLeft: "┏",
    topRight: "┓",
    bottomLeft: "┗",
    bottomRight: "┛",
    horizontal: "━",
    vertical: "┃",
  },
  classic: {
    topLeft: "+",
    topRight: "+",
    bottomLeft: "+",
    bottomRight: "+",
    horizontal: "-",
    vertical: "|",
  },
} as const;
