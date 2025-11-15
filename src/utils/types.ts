const styles = {
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

export type StyleName = keyof typeof styles;

export type ChainableColorFunction = ((text: string) => string) & {
  [K in Exclude<StyleName, "reset">]: ChainableColorFunction;
};
