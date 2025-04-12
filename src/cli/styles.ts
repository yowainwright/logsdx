import chalk from 'chalk';
import JSON5 from 'json5';
import type { LogLevel } from '@/src/types';

// Force chalk to use colors
chalk.level = 3;

// Style configurations for different log levels
const LEVEL_STYLES: Record<LogLevel, any> = {
  error: chalk.bold.red,
  warn: chalk.yellow,
  info: chalk.blue,
  debug: chalk.gray,
  success: chalk.green,
  trace: chalk.white.dim,
};

// Field-specific styles
const FIELD_STYLES: Record<string, any> = {
  timestamp: chalk.gray,
  service: chalk.cyan,
  action: chalk.magenta,
  status: (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return chalk.green(status);
      case 'failure':
      case 'error':
        return chalk.red(status);
      case 'pending':
        return chalk.yellow(status);
      default:
        return chalk.white(status);
    }
  },
  user: chalk.blue,
  duration: chalk.yellow,
  requestId: chalk.gray,
  correlationId: chalk.gray,
  environment: chalk.green,
  version: chalk.magenta,
};

/**
 * Formats a JSON object with colors
 * @param obj The object to format
 * @returns The formatted string
 */
function formatJson(obj: Record<string, any>): string {
  const lines: string[] = [];
  lines.push(chalk.gray('{'));
  
  const entries = Object.entries(obj);
  const lastEntry = entries[entries.length - 1];
  
  for (const [key, value] of entries) {
    const formattedValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    const styleFn = FIELD_STYLES[key];
    let styledValue;
    if (typeof styleFn === 'function') {
      styledValue = styleFn(formattedValue);
    } else if (styleFn) {
      styledValue = styleFn(formattedValue);
    } else {
      styledValue = chalk.white(formattedValue);
    }
    const isLast = lastEntry && lastEntry[0] === key;
    lines.push(`  ${chalk.gray('"')}${chalk.cyan(key)}${chalk.gray('"')}: ${styledValue}${isLast ? '' : chalk.gray(',')}`);
  }
  
  lines.push(chalk.gray('}'));
  return lines.join('\n');
}

/**
 * Styles a line based on its log level and content
 * @param line The line to style
 * @param parsed The parsed line result containing level and other metadata
 * @returns The styled line
 */
export const styleLine = (line: string, parsed: { level?: LogLevel; [key: string]: any }): string => {
  if (parsed.language === 'json') {
    try {
      const json = JSON5.parse(line);
      return formatJson(json);
    } catch (error) {
      // If JSON parsing fails, fall back to level-based styling
      const level = parsed.level || 'info';
      const style = LEVEL_STYLES[level as LogLevel] || LEVEL_STYLES.info;
      return style(line);
    }
  }
  const level = parsed.level || 'info';
  const style = LEVEL_STYLES[level as LogLevel] || LEVEL_STYLES.info;
  return style(line);
};

// Export chalk for direct use
export { chalk };
