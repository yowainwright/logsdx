import { TokenList } from "@/src/schema/types";
import { Theme } from "@/src/types";
import { tokenize, applyTheme } from "@/src/tokenizer";
import { BACKGROUND_COLORS, STYLE_CODES, getColorDefinition, supportsColors } from "./constants";
import type { RenderOptions } from "./types";

/**
 * Render a line with the specified options
 * @param line - The line to render
 * @param theme - The theme to use
 * @param options - Rendering options
 * @returns The rendered line
 */
export function renderLine(
  line: string,
  theme?: Theme,
  options: RenderOptions = {}
): string {
  // First tokenize the line
  const tokens = tokenize(line, theme);

  // Then apply the theme to get styled tokens
  const styledTokens = applyTheme(
    tokens,
    theme || { name: "default", schema: { defaultStyle: { color: "white" } } }
  );

  // Now render the styled tokens based on output format
  if (options.outputFormat === "html") {
    if (options.htmlStyleFormat === "className") {
      return tokensToClassNames(styledTokens);
    } else {
      return tokensToHtml(styledTokens);
    }
  } else {
    // Default to ANSI output
    return tokensToString(styledTokens);
  }
}

/**
 * Convert tokens to a styled string
 * @param tokens - The tokens to convert
 * @param forceColors - Force color output regardless of terminal detection
 * @returns A string with ANSI escape codes for styling
 */
export function tokensToString(tokens: TokenList, forceColors?: boolean): string {
  const colorSupport = forceColors ?? supportsColors();
  
  return tokens
    .map((token) => {
      // For whitespace and newlines, preserve them exactly as is without styling
      if (
        token.metadata?.matchType === "whitespace" ||
        token.metadata?.matchType === "newline" ||
        token.metadata?.matchType === "space" ||
        token.metadata?.matchType === "spaces" ||
        token.metadata?.matchType === "tab" ||
        token.metadata?.matchType === "carriage-return"
      ) {
        // Handle trimmed whitespace
        if (token.metadata?.trimmed) {
          if (token.metadata?.matchType === "spaces" && token.metadata?.originalLength) {
            // Convert multiple spaces to single space when trimmed
            return " ";
          }
          if (token.metadata?.matchType === "space") {
            // Keep single spaces even when trimming
            return token.content;
          }
          // Other trimmed whitespace is ignored
          return "";
        }
        return token.content;
      }

      const style = token.metadata?.style;
      if (!style || !colorSupport) {
        return token.content;
      }

      let result = token.content;

      if (style.color) {
        result = applyColor(result, style.color);
      }

      const hasStyleCode = (code: string) =>
        Array.isArray(style.styleCodes) && style.styleCodes.includes(code);

      if (hasStyleCode("bold")) {
        result = applyBold(result);
      }

      if (hasStyleCode("italic")) {
        result = applyItalic(result);
      }

      if (hasStyleCode("underline")) {
        result = applyUnderline(result);
      }

      if (hasStyleCode("dim")) {
        result = applyDim(result);
      }

      if ((style as any).backgroundColor) {
        result = applyBackgroundColor(result, (style as any).backgroundColor);
      }

      return result;
    })
    .join("");
}

/**
 * Convert tokens to HTML with inline CSS styles
 * @param tokens - The tokens to convert
 * @returns HTML string with inline CSS styles
 */
export function tokensToHtml(tokens: TokenList): string {
  return tokens
    .map((token) => {
      // Enhanced whitespace handling for HTML
      if (
        token.metadata?.matchType === "whitespace" ||
        token.metadata?.matchType === "space" ||
        token.metadata?.matchType === "spaces" ||
        token.metadata?.matchType === "tab"
      ) {
        // Handle trimmed whitespace
        if (token.metadata?.trimmed) {
          if (token.metadata?.matchType === "spaces") {
            return "&nbsp;"; // Convert multiple spaces to single non-breaking space
          }
          if (token.metadata?.matchType === "space") {
            return "&nbsp;"; // Convert space to non-breaking space
          }
          return ""; // Other trimmed whitespace is ignored
        }
        
        // Normal whitespace handling
        if (token.metadata?.matchType === "tab") {
          return "&nbsp;".repeat(4 * token.content.length); // 4 spaces per tab
        }
        if (token.metadata?.matchType === "spaces") {
          return "&nbsp;".repeat(token.content.length);
        }
        if (token.metadata?.matchType === "space") {
          return "&nbsp;";
        }
        // Generic whitespace fallback
        return token.content
          .replace(/ /g, "&nbsp;")
          .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
      }

      if (token.metadata?.matchType === "newline") {
        return "<br>";
      }

      if (token.metadata?.matchType === "carriage-return") {
        return ""; // Ignore carriage returns in HTML
      }

      const style = token.metadata?.style;
      if (!style) {
        return escapeHtml(token.content);
      }

      const css = [];

      if (style.color) {
        const colorDef = getColorDefinition(style.color);
        css.push(`color: ${colorDef?.hex || style.color}`);
      }

      const hasStyleCode = (code: string) =>
        Array.isArray(style.styleCodes) && style.styleCodes.includes(code);

      if (hasStyleCode("bold")) {
        css.push("font-weight: bold");
      }

      if (hasStyleCode("italic")) {
        css.push("font-style: italic");
      }

      if (hasStyleCode("underline")) {
        css.push("text-decoration: underline");
      }

      if (hasStyleCode("dim")) {
        css.push("opacity: 0.8");
      }

      return css.length > 0
        ? `<span style="${css.join("; ")}">${escapeHtml(token.content)}</span>`
        : escapeHtml(token.content);
    })
    .join("");
}

/**
 * Convert tokens to HTML with CSS class names
 * @param tokens - The tokens to convert
 * @returns HTML with CSS class names for styling
 */
export function tokensToClassNames(tokens: TokenList): string {
  return tokens
    .map((token) => {
      // Enhanced whitespace handling for HTML with classes
      if (
        token.metadata?.matchType === "whitespace" ||
        token.metadata?.matchType === "space" ||
        token.metadata?.matchType === "spaces" ||
        token.metadata?.matchType === "tab"
      ) {
        // Handle trimmed whitespace
        if (token.metadata?.trimmed) {
          if (token.metadata?.matchType === "spaces") {
            return '&nbsp;'; // Convert multiple spaces to single non-breaking space
          }
          if (token.metadata?.matchType === "space") {
            return '&nbsp;'; // Convert space to non-breaking space
          }
          return ""; // Other trimmed whitespace is ignored
        }
        
        // Normal whitespace handling
        if (token.metadata?.matchType === "tab") {
          return "&nbsp;".repeat(4 * token.content.length); // 4 spaces per tab
        }
        if (token.metadata?.matchType === "spaces") {
          return "&nbsp;".repeat(token.content.length);
        }
        if (token.metadata?.matchType === "space") {
          return "&nbsp;";
        }
        // Generic whitespace fallback
        return token.content
          .replace(/ /g, "&nbsp;")
          .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
      }

      if (token.metadata?.matchType === "newline") {
        return "<br>";
      }

      if (token.metadata?.matchType === "carriage-return") {
        return ""; // Ignore carriage returns in HTML
      }

      const style = token.metadata?.style;
      if (!style) {
        return escapeHtml(token.content);
      }

      const classes = [];

      if (style.color) {
        const colorDef = getColorDefinition(style.color);
        if (colorDef?.className) {
          classes.push(colorDef.className);
        }
      }

      const hasStyleCode = (code: string) =>
        Array.isArray(style.styleCodes) && style.styleCodes.includes(code);

      if (hasStyleCode("bold")) {
        classes.push("logsdx-bold");
      }

      if (hasStyleCode("italic")) {
        classes.push("logsdx-italic");
      }

      if (hasStyleCode("underline")) {
        classes.push("logsdx-underline");
      }

      if (hasStyleCode("dim")) {
        classes.push("logsdx-dim");
      }

      const escapedContent = escapeHtml(token.content);
      return classes.length > 0
        ? `<span class="${classes.join(" ")}">${escapedContent}</span>`
        : escapedContent;
    })
    .join("");
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Highlight a line (for line highlighting)
 * @param line - The line to highlight
 * @returns The highlighted line
 */
export function highlightLine(line: string): string {
  return `\x1b[48;5;236m${line}\x1b[0m`;
}

/**
 * Apply color to text using ANSI escape codes
 * @param text - The text to color
 * @param color - The color to apply
 * @returns The colored text
 */
export function applyColor(text: string, color: string): string {
  const colorDef = getColorDefinition(color);
  if (!colorDef) {
    return text; // Return unchanged if color not found
  }
  return `${colorDef.ansi}${text}${STYLE_CODES.resetColor}`;
}

/**
 * Apply bold style to text using ANSI escape codes
 * @param text - The text to style
 * @returns The styled text
 */
export function applyBold(text: string): string {
  return `${STYLE_CODES.bold}${text}${STYLE_CODES.resetBold}`;
}

/**
 * Apply italic style to text using ANSI escape codes
 * @param text - The text to style
 * @returns The styled text
 */
export function applyItalic(text: string): string {
  return `${STYLE_CODES.italic}${text}${STYLE_CODES.resetItalic}`;
}

/**
 * Apply underline style to text using ANSI escape codes
 * @param text - The text to style
 * @returns The styled text
 */
export function applyUnderline(text: string): string {
  return `${STYLE_CODES.underline}${text}${STYLE_CODES.resetUnderline}`;
}

/**
 * Apply dim style to text using ANSI escape codes
 * @param text - The text to style
 * @returns The styled text
 */
export function applyDim(text: string): string {
  return `${STYLE_CODES.dim}${text}${STYLE_CODES.resetDim}`;
}

/**
 * Apply background color to text using ANSI escape codes
 * @param text - The text to color
 * @param color - The color to apply
 * @returns The colored text
 */
export function applyBackgroundColor(text: string, color: string): string {
  const colorDef = BACKGROUND_COLORS[color];
  if (!colorDef) {
    return text; // Return unchanged if color not found
  }
  return `${colorDef.ansi}${text}${STYLE_CODES.resetBackground}`;
}

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

/**
 * Render multiple lines with the specified options
 * @param lines - The lines to render
 * @param theme - The theme to use
 * @param options - Rendering options
 * @returns The rendered lines
 */
export function renderLines(
  lines: string[],
  theme?: Theme,
  options: RenderOptions = {}
): string[] {
  return lines.map((line) => renderLine(line, theme, options));
}

export default {
  renderLine,
  renderLines,
};
