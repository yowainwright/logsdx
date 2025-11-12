import type { StyleName, ChainableColorFunction } from "./types";

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
};

function createColorFunction(style: string) {
  return (text: string) => `${style}${text}${styles.reset}`;
}

function createChainableColor(appliedStyles: string[] = []): ChainableColorFunction {
  const fn = ((text: string) => {
    const prefix = appliedStyles.join("");
    return `${prefix}${text}${styles.reset}`;
  }) as ChainableColorFunction;

  Object.keys(styles).forEach((key) => {
    if (key === "reset") return;
    Object.defineProperty(fn, key, {
      get() {
        return createChainableColor([
          ...appliedStyles,
          styles[key as StyleName],
        ]);
      },
    });
  });

  return fn;
}

export const colors = createChainableColor();

export const red = createColorFunction(styles.red);
export const green = createColorFunction(styles.green);
export const yellow = createColorFunction(styles.yellow);
export const blue = createColorFunction(styles.blue);
export const magenta = createColorFunction(styles.magenta);
export const cyan = createColorFunction(styles.cyan);
export const white = createColorFunction(styles.white);
export const gray = createColorFunction(styles.gray);
export const dim = createColorFunction(styles.dim);
export const bold = createColorFunction(styles.bold);

export default colors;
