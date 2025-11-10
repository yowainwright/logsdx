interface BoxenOptions {
  padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
  margin?: number | { top?: number; bottom?: number; left?: number; right?: number };
  borderStyle?: "single" | "double" | "round" | "bold" | "classic";
  borderColor?: string;
  backgroundColor?: string;
  title?: string;
}

const borderStyles = {
  single: { topLeft: "┌", topRight: "┐", bottomLeft: "└", bottomRight: "┘", horizontal: "─", vertical: "│" },
  double: { topLeft: "╔", topRight: "╗", bottomLeft: "╚", bottomRight: "╝", horizontal: "═", vertical: "║" },
  round: { topLeft: "╭", topRight: "╮", bottomLeft: "╰", bottomRight: "╯", horizontal: "─", vertical: "│" },
  bold: { topLeft: "┏", topRight: "┓", bottomLeft: "┗", bottomRight: "┛", horizontal: "━", vertical: "┃" },
  classic: { topLeft: "+", topRight: "+", bottomLeft: "+", bottomRight: "+", horizontal: "-", vertical: "|" },
};

function normalizePadding(value: number | { top?: number; bottom?: number; left?: number; right?: number } | undefined): { top: number; bottom: number; left: number; right: number } {
  if (typeof value === "number") {
    return { top: value, bottom: value, left: value, right: value };
  }
  return { top: value?.top || 0, bottom: value?.bottom || 0, left: value?.left || 0, right: value?.right || 0 };
}

export function boxen(text: string, options: BoxenOptions = {}): string {
  const border = borderStyles[options.borderStyle || "single"];
  const padding = normalizePadding(options.padding);
  const margin = normalizePadding(options.margin);
  
  const lines = text.split("\n");
  const contentWidth = Math.max(...lines.map(line => line.replace(/\x1B\[[0-9;]*m/g, "").length));
  const boxWidth = contentWidth + padding.left + padding.right;
  
  const result: string[] = [];
  
  // Top margin
  for (let i = 0; i < margin.top; i++) {
    result.push("");
  }
  
  const leftMargin = " ".repeat(margin.left);
  
  // Top border
  const topBorder = options.title
    ? border.topLeft + ` ${options.title} ` + border.horizontal.repeat(Math.max(0, boxWidth - options.title.length - 2)) + border.topRight
    : border.topLeft + border.horizontal.repeat(boxWidth) + border.topRight;
  result.push(leftMargin + topBorder);
  
  // Top padding
  for (let i = 0; i < padding.top; i++) {
    result.push(leftMargin + border.vertical + " ".repeat(boxWidth) + border.vertical);
  }
  
  // Content
  lines.forEach(line => {
    const cleanLength = line.replace(/\x1B\[[0-9;]*m/g, "").length;
    const paddingRight = " ".repeat(Math.max(0, contentWidth - cleanLength));
    result.push(
      leftMargin +
      border.vertical +
      " ".repeat(padding.left) +
      line +
      paddingRight +
      " ".repeat(padding.right) +
      border.vertical
    );
  });
  
  // Bottom padding
  for (let i = 0; i < padding.bottom; i++) {
    result.push(leftMargin + border.vertical + " ".repeat(boxWidth) + border.vertical);
  }
  
  // Bottom border
  result.push(leftMargin + border.bottomLeft + border.horizontal.repeat(boxWidth) + border.bottomRight);
  
  // Bottom margin
  for (let i = 0; i < margin.bottom; i++) {
    result.push("");
  }
  
  return result.join("\n");
}

export default boxen;
