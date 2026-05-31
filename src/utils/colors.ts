import type { StyleName, ChainableColorFunction } from "./types";
import { STYLES } from "./constants";
import { HEX_COLOR_PATTERN } from "../renderer/constants";

function applyStyles(text: unknown, appliedStyles: string[]): string {
  const styleSequence = appliedStyles.join("");
  return `${styleSequence}${String(text)}${STYLES.reset}`;
}

function addStyleProperties(
  fn: ChainableColorFunction,
  appliedStyles: string[],
): void {
  const styleNames = Object.keys(STYLES).filter(
    (key) => key !== "reset",
  ) as StyleName[];

  styleNames.forEach((styleName) => {
    Object.defineProperty(fn, styleName, {
      get: () => createChainableFunction([...appliedStyles, STYLES[styleName]]),
      enumerable: true,
    });
  });
}

function createChainableFunction(
  appliedStyles: string[] = [],
): ChainableColorFunction {
  const fn = ((text: unknown) =>
    applyStyles(text, appliedStyles)) as ChainableColorFunction;
  addStyleProperties(fn, appliedStyles);
  return fn;
}

const colors = createChainableFunction();

export function hex(hexColor: string): (text: unknown) => string {
  const match = hexColor.match(HEX_COLOR_PATTERN);
  if (!match) return (text: unknown) => String(text);

  const r = parseInt(match[1], 16);
  const g = parseInt(match[2], 16);
  const b = parseInt(match[3], 16);

  return (text: unknown) =>
    `\x1B[38;2;${r};${g};${b}m${String(text)}${STYLES.reset}`;
}

export function bgHex(hexColor: string): (text: unknown) => string {
  const match = hexColor.match(HEX_COLOR_PATTERN);
  if (!match) return (text: unknown) => String(text);

  const r = parseInt(match[1], 16);
  const g = parseInt(match[2], 16);
  const b = parseInt(match[3], 16);

  return (text: unknown) =>
    `\x1B[48;2;${r};${g};${b}m${String(text)}${STYLES.reset}`;
}

export default colors;
