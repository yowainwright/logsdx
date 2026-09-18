import type { BoxenOptions } from "./types";
import { BORDER_STYLES, ANSI_ESCAPE_REGEX } from "./constants";

function normalizePadding(
  value:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number }
    | undefined,
): { top: number; bottom: number; left: number; right: number } {
  if (typeof value === "number") {
    return { top: value, bottom: value, left: value, right: value };
  }
  return {
    top: value?.top || 0,
    bottom: value?.bottom || 0,
    left: value?.left || 0,
    right: value?.right || 0,
  };
}

type BorderChars = (typeof BORDER_STYLES)[keyof typeof BORDER_STYLES];

function createEmptyLines(count: number): string[] {
  return Array.from({ length: count }, () => "");
}

function getContentWidth(lines: string[]): number {
  return Math.max(
    ...lines.map((line) => line.replace(ANSI_ESCAPE_REGEX, "").length),
  );
}

function createTopBorder(
  border: BorderChars,
  title: string | undefined,
  boxWidth: number,
): string {
  if (!title) {
    return [
      border.topLeft,
      border.horizontal.repeat(boxWidth),
      border.topRight,
    ].join("");
  }

  const titleText = ` ${title} `;
  const remainingWidth = Math.max(0, boxWidth - titleText.length);
  return [
    border.topLeft,
    titleText,
    border.horizontal.repeat(remainingWidth),
    border.topRight,
  ].join("");
}

function createPaddingLine(
  border: BorderChars,
  leftMargin: string,
  boxWidth: number,
): string {
  const content = " ".repeat(boxWidth);
  return [leftMargin, border.vertical, content, border.vertical].join("");
}

interface ContentLineOptions {
  border: BorderChars;
  leftMargin: string;
  contentWidth: number;
  padding: { left: number; right: number };
}

function createContentLine(line: string, options: ContentLineOptions): string {
  const cleanLength = line.replace(ANSI_ESCAPE_REGEX, "").length;
  const paddingRight = " ".repeat(
    Math.max(0, options.contentWidth - cleanLength),
  );
  return [
    options.leftMargin,
    options.border.vertical,
    " ".repeat(options.padding.left),
    line,
    paddingRight,
    " ".repeat(options.padding.right),
    options.border.vertical,
  ].join("");
}

export function boxen(text: string, options: BoxenOptions = {}): string {
  const border = BORDER_STYLES[options.borderStyle || "single"];
  const padding = normalizePadding(options.padding);
  const margin = normalizePadding(options.margin);

  const lines = text.split("\n");
  const contentWidth = getContentWidth(lines);
  const boxWidth = contentWidth + padding.left + padding.right;

  const leftMargin = " ".repeat(margin.left);
  const topBorder = createTopBorder(border, options.title, boxWidth);
  const paddingLine = () => createPaddingLine(border, leftMargin, boxWidth);
  const contentLines = lines.map((line) =>
    createContentLine(line, {
      border,
      leftMargin,
      contentWidth,
      padding,
    }),
  );
  const bottomBorder = [
    border.bottomLeft,
    border.horizontal.repeat(boxWidth),
    border.bottomRight,
  ].join("");
  const result = [
    ...createEmptyLines(margin.top),
    leftMargin + topBorder,
    ...createEmptyLines(padding.top).map(paddingLine),
    ...contentLines,
    ...createEmptyLines(padding.bottom).map(paddingLine),
    leftMargin + bottomBorder,
    ...createEmptyLines(margin.bottom),
  ];

  return result.join("\n");
}

export default boxen;
