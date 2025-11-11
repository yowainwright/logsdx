// ============================================================================
// ASCII Art (from utils/ascii.ts)
// ============================================================================

const LOGSDX_ASCII = `
  ╦  ┌─┐┌─┐┌─┐╔╦╗═╗ ╦
  ║  │ ││ ┬└─┐ ║║╔╩╦╝
  ╩═╝└─┘└─┘└─┘═╩╝╩ ╚═
`;

export function textSync(
  text: string,
  options?: {
    font?: string;
    horizontalLayout?: string;
    verticalLayout?: string;
  },
): string {
  if (text === "LogsDX") {
    return LOGSDX_ASCII;
  }

  return text;
}

// ============================================================================
// Boxen (from utils/boxen.ts)
// ============================================================================

interface BoxenOptions {
  padding?:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number };
  margin?:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number };
  borderStyle?: "single" | "double" | "round" | "bold" | "classic";
  borderColor?: string;
  backgroundColor?: string;
  title?: string;
}

const borderStyles = {
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
};

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

export function boxen(text: string, options: BoxenOptions = {}): string {
  const border = borderStyles[options.borderStyle || "single"];
  const padding = normalizePadding(options.padding);
  const margin = normalizePadding(options.margin);

  const lines = text.split("\n");
  const contentWidth = Math.max(
    ...lines.map((line) => line.replace(/\x1B\[[0-9;]*m/g, "").length),
  );
  const boxWidth = contentWidth + padding.left + padding.right;

  const result: string[] = [];

  for (let i = 0; i < margin.top; i++) {
    result.push("");
  }

  const leftMargin = " ".repeat(margin.left);

  const topBorder = options.title
    ? border.topLeft +
      ` ${options.title} ` +
      border.horizontal.repeat(
        Math.max(0, boxWidth - options.title.length - 2),
      ) +
      border.topRight
    : border.topLeft + border.horizontal.repeat(boxWidth) + border.topRight;
  result.push(leftMargin + topBorder);

  for (let i = 0; i < padding.top; i++) {
    result.push(
      leftMargin + border.vertical + " ".repeat(boxWidth) + border.vertical,
    );
  }

  lines.forEach((line) => {
    const cleanLength = line.replace(/\x1B\[[0-9;]*m/g, "").length;
    const paddingRight = " ".repeat(Math.max(0, contentWidth - cleanLength));
    result.push(
      leftMargin +
        border.vertical +
        " ".repeat(padding.left) +
        line +
        paddingRight +
        " ".repeat(padding.right) +
        border.vertical,
    );
  });

  for (let i = 0; i < padding.bottom; i++) {
    result.push(
      leftMargin + border.vertical + " ".repeat(boxWidth) + border.vertical,
    );
  }

  result.push(
    leftMargin +
      border.bottomLeft +
      border.horizontal.repeat(boxWidth) +
      border.bottomRight,
  );

  for (let i = 0; i < margin.bottom; i++) {
    result.push("");
  }

  return result.join("\n");
}

// ============================================================================
// Gradient (from utils/gradient.ts)
// ============================================================================

export function gradient(colors: string[]): {
  (text: string): string;
  multiline(text: string): string;
} {
  const applyGradient = (text: string) => `\x1B[36m${text}\x1B[0m`;

  applyGradient.multiline = (text: string) => {
    return text
      .split("\n")
      .map((line) => `\x1B[36m${line}\x1B[0m`)
      .join("\n");
  };

  return applyGradient;
}

export default { textSync, boxen, gradient };
