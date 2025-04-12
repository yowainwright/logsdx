import { style, ANSI } from "@/src/cli/styles";

export const applyHighlightPatterns = (
  line: string,
  patterns?: Array<{
    pattern: RegExp | string;
    style: keyof typeof ANSI | (keyof typeof ANSI)[];
  }>,
): string => {
  if (!patterns?.length) return line;

  let result = line;
  patterns.forEach(({ pattern, style: styleValue }) => {
    const regex =
      pattern instanceof RegExp ? pattern : new RegExp(pattern, "g");
    result = result.replace(regex, (match) => style(match, styleValue));
  });
  return result;
};

export const formatLineNumber = (index: number, totalLines: number): string => {
  const width = totalLines.toString().length;
  return style(`${(index + 1).toString().padStart(width, " ")} | `, [
    "dim",
    "gray",
  ]);
};
