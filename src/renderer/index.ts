import { TokenList } from '@/src/schema/types';
import { tokenize, applyTheme } from '@/src/tokenizer';
import { RenderOptions } from '@/src/renderer/types';
import { TEXT_COLORS, BACKGROUND_COLORS, STYLE_CODES } from '@/src/renderer/constants';

/**
 * Render a log line with theme styling
 * @param line - The log line to render
 * @param options - Rendering options
 * @returns The rendered log line with styling
 */
export function renderLine(line: string, options: RenderOptions = {}): string {
  const tokens = tokenize(line, options.theme);
  const styledTokens = options.theme 
    ? applyTheme(tokens, options.theme) 
    : tokens;
  if (options.htmlStyleFormat === 'css') {
    return tokensToHtml(styledTokens);
  } else if (options.htmlStyleFormat === 'className') {
    return tokensToClassNames(styledTokens);
  } else {
    return tokensToString(styledTokens);
  }
}

/**
 * Render multiple log lines with theme styling
 * @param lines - The log lines to render
 * @param options - Rendering options
 * @returns The rendered log lines with styling
 */
export function renderLines(lines: string[], options: RenderOptions = {}): string[] {
  return lines.map(line => renderLine(line, options));
}

/**
 * Convert tokens to a styled string
 * @param tokens - The tokens to convert
 * @returns A string with ANSI escape codes for styling
 */
export function tokensToString(tokens: TokenList): string {
  return tokens.map(token => {
    // For whitespace and newlines, preserve them exactly as is without styling
    if (token.metadata?.matchType === 'whitespace' || token.metadata?.matchType === 'newline') {
      return token.content;
    }
    
    const style = token.metadata?.style;
    if (!style) {
      return token.content;
    }
    
    let result = token.content;
    
    if (style.color) {
      result = applyColor(result, style.color);
    }
    
    const hasStyleCode = (code: string) => 
      Array.isArray(style.styleCodes) && style.styleCodes.includes(code);
    
    if (hasStyleCode('bold')) {
      result = applyBold(result);
    }
    
    if (hasStyleCode('italic')) {
      result = applyItalic(result);
    }
    
    if (hasStyleCode('underline')) {
      result = applyUnderline(result);
    }
    
    if (hasStyleCode('dim')) {
      result = applyDim(result);
    }
    
    return result;
  }).join('');
}

/**
 * Convert tokens to HTML with inline CSS styles
 * @param tokens - The tokens to convert
 * @returns HTML string with inline CSS styles
 */
export function tokensToHtml(tokens: TokenList): string {
  return tokens.map(token => {
    if (token.metadata?.matchType === 'whitespace') {
      return token.content
        .replace(/ {2,}/g, match => '&nbsp;'.repeat(match.length))
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
    
    if (token.metadata?.matchType === 'newline') {
      return '<br>';
    }
    
    const style = token.metadata?.style;
    if (!style) {
      return escapeHtml(token.content);
    }
    
    const css = [];
    
    if (style.color) {
      const colorDef = TEXT_COLORS[style.color];
      css.push(`color: ${colorDef?.hex || style.color}`);
    }
    
    const hasStyleCode = (code: string) => 
      Array.isArray(style.styleCodes) && style.styleCodes.includes(code);
    
    if (hasStyleCode('bold')) {
      css.push('font-weight: bold');
    }
    
    if (hasStyleCode('italic')) {
      css.push('font-style: italic');
    }
    
    if (hasStyleCode('underline')) {
      css.push('text-decoration: underline');
    }
    
    if (hasStyleCode('dim')) {
      css.push('opacity: 0.8');
    }
    
    return css.length > 0
      ? `<span style="${css.join('; ')}">${escapeHtml(token.content)}</span>`
      : escapeHtml(token.content);
  }).join('');
}

/**
 * Convert tokens to HTML with CSS class names
 * @param tokens - The tokens to convert
 * @returns HTML with CSS class names for styling
 */
export function tokensToClassNames(tokens: TokenList): string {
  return tokens.map(token => {
    if (token.metadata?.matchType === 'whitespace') {
      return token.content
        .replace(/ {2,}/g, match => '&nbsp;'.repeat(match.length))
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
    
    if (token.metadata?.matchType === 'newline') {
      return '<br>';
    }
    
    const style = token.metadata?.style;
    if (!style) {
      return escapeHtml(token.content);
    }
    
    const classes = [];
    
    if (style.color) {
      const colorDef = TEXT_COLORS[style.color];
      if (colorDef?.className) {
        classes.push(colorDef.className);
      }
    }
    
    const hasStyleCode = (code: string) => 
      Array.isArray(style.styleCodes) && style.styleCodes.includes(code);
    
    if (hasStyleCode('bold')) {
      classes.push('logsdx-bold');
    }
    
    if (hasStyleCode('italic')) {
      classes.push('logsdx-italic');
    }
    
    if (hasStyleCode('underline')) {
      classes.push('logsdx-underline');
    }
    
    if (hasStyleCode('dim')) {
      classes.push('logsdx-dim');
    }
    
    const escapedContent = escapeHtml(token.content);
    return classes.length > 0 
      ? `<span class="${classes.join(' ')}">${escapedContent}</span>` 
      : escapedContent;
  }).join('');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
 * Apply color to text
 * @param text - The text to color
 * @param color - The color to apply
 * @returns The colored text
 */
export function applyColor(text: string, color: string): string {
  if (color.startsWith('#')) {
    return applyHexColor(text, color);
  }
  
  const colorCode = TEXT_COLORS[color] || TEXT_COLORS.white; // Default to white
  return `${colorCode}${text}${STYLE_CODES.resetColor}`;
}

/**
 * Apply hex color to text
 * @param text - The text to color
 * @param hexColor - The hex color to apply
 * @returns The colored text
 */
export function applyHexColor(text: string, hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[39m`;
}

/**
 * Apply bold to text
 * @param text - The text to make bold
 * @returns The bold text
 */
export function applyBold(text: string): string {
  return `\x1b[1m${text}\x1b[22m`;
}

/**
 * Apply italic to text
 * @param text - The text to make italic
 * @returns The italic text
 */
export function applyItalic(text: string): string {
  return `\x1b[3m${text}\x1b[23m`;
}

/**
 * Apply underline to text
 * @param text - The text to underline
 * @returns The underlined text
 */
export function applyUnderline(text: string): string {
  return `\x1b[4m${text}\x1b[24m`;
}

/**
 * Apply dim to text
 * @param text - The text to dim
 * @returns The dimmed text
 */
export function applyDim(text: string): string {
  return `\x1b[2m${text}\x1b[22m`;
}

/**
 * Apply background color to text
 * @param text - The text to apply background color to
 * @param color - The background color to apply
 * @returns The text with background color
 */
export function applyBackgroundColor(text: string, color: string): string {
  if (color.startsWith('#')) {
    return applyHexBackgroundColor(text, color);
  }
  
  const colorCode = BACKGROUND_COLORS[color] || BACKGROUND_COLORS.white; // Default to white
  return `${colorCode}${text}${STYLE_CODES.resetBackground}`;
}

/**
 * Apply hex background color to text
 * @param text - The text to apply background color to
 * @param hexColor - The hex background color to apply
 * @returns The text with background color
 */
export function applyHexBackgroundColor(text: string, hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `\x1b[48;2;${r};${g};${b}m${text}\x1b[49m`;
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

export default {
  renderLine,
  renderLines
};
