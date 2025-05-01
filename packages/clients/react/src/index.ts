/**
 * LogsDX React Client
 *
 * This package provides React components and hooks for integrating LogsDX
 * into React applications.
 */

// Define theme constants
const DEFAULT_THEME = "dracula";
const THEMES = {
  dracula: {
    levels: {
      error: { color: "#ff5555", bold: true },
      warn: { color: "#f1fa8c" },
      info: { color: "#8be9fd" },
      debug: { color: "#6272a4" }
    },
    status: {
      success: { color: "#50fa7b" },
      error: { color: "#ff5555" },
      pending: { color: "#f1fa8c" }
    }
  }
};

// Simple theme getter
function getTheme(themeName = DEFAULT_THEME) {
  return THEMES[themeName] || THEMES[DEFAULT_THEME];
}

/**
 * Parse a JSON log string and extract relevant information
 * @param {string} logString - The JSON log string to parse
 * @returns {Object} The parsed log with extracted information
 */
export function parseJsonLog(logString: string) {
  try {
    // Parse the JSON string
    const log = JSON.parse(logString);

    // Extract common fields
    const {
      timestamp,
      level = 'info',
      message = '',
      status = null,
      ...rest
    } = log;

    return {
      raw: logString,
      timestamp,
      level,
      message,
      status,
      metadata: rest
    };
  } catch (error) {
    // Return a basic object if parsing fails
    return {
      raw: logString,
      timestamp: new Date().toISOString(),
      level: 'error',
      message: `Failed to parse log: ${logString}`,
      status: 'error',
      metadata: { parseError: (error as Error).message }
    };
  }
}

/**
 * Format a parsed log for display
 * @param {Object} parsedLog - The parsed log object
 * @returns {string} The formatted log string
 */
export function formatLog(parsedLog: any) {
  const { timestamp, level, message, status } = parsedLog;

  // Format the timestamp if it exists
  const formattedTime = timestamp ? `${timestamp} ` : '';

  // Format the level
  const formattedLevel = level ? `[${level.toUpperCase()}] ` : '';

  // Format the status if it exists
  const formattedStatus = status ? ` (${status})` : '';

  // Combine all parts
  return `${formattedTime}${formattedLevel}${message}${formattedStatus}`;
}

/**
 * Get the appropriate color for a log based on its level and status
 * @param {Object} parsedLog - The parsed log object
 * @param {string} themeName - The name of the theme to use
 * @returns {string} The color to use for the log
 */
export function getLogColor(parsedLog: any, themeName: string) {
  const { level, status } = parsedLog;
  const theme = getTheme(themeName);

  // Use status color if available, otherwise use level color
  if (status && theme.status && theme.status[status]) {
    return theme.status[status].color;
  }

  return theme.levels[level]?.color || theme.levels.info.color;
}

/**
 * Determine if a log should be displayed in bold
 * @param {Object} parsedLog - The parsed log object
 * @param {Object} theme - The theme object
 * @returns {boolean} Whether the log should be bold
 */
export function shouldBeBold(parsedLog: any, theme: any) {
  const { level } = parsedLog;
  return theme.levels[level]?.bold || false;
}

/**
 * Process a log string with the JSON parser
 * @param {string} logString - The log string to process
 * @param {string} themeName - The name of the theme to use
 * @param {Object} theme - The theme object
 * @returns {Object} The processed log with styling information
 */
export function processJsonLog(logString: string, themeName: string, theme: any) {
  // Parse the log
  const parsedLog = parseJsonLog(logString);

  // Get the color
  const color = getLogColor(parsedLog, themeName);

  // Determine if it should be bold
  const isBold = shouldBeBold(parsedLog, theme);

  // Format the log
  const formattedLog = formatLog(parsedLog);

  // Return the processed log
  return {
    parsedLog,
    formattedLog,
    style: {
      color,
      fontWeight: isBold ? 'bold' : 'normal'
    }
  };
}

// Re-export theme utilities from LogsDX
export { getTheme, DEFAULT_THEME, THEMES };

// Export hooks
export { useSchemaValidation } from './hooks/useSchemaValidation';

// Export schema validation utilities
export { validateClientSchema } from './schema/client-validation';
export type { ClientSchema } from './schema/client-validation';
