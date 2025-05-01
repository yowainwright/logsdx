/**
 * LogsDX HTML Client
 *
 * This package provides HTML/JavaScript utilities for integrating LogsDX
 * into web applications without a framework.
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

// Get level color
function getLevelColor(level, themeName = DEFAULT_THEME) {
  const theme = getTheme(themeName);
  return theme.levels[level]?.color || theme.levels.info.color;
}

// Get status color
function getStatusColor(status, themeName = DEFAULT_THEME) {
  const theme = getTheme(themeName);
  return theme.status[status]?.color || theme.status.pending.color;
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

  // Use status color if available, otherwise use level color
  return status
    ? getStatusColor(status, themeName)
    : getLevelColor(level, themeName);
}

/**
 * Create a styled HTML element for a log
 * @param {string} logString - The log string to process
 * @param {string} themeName - The name of the theme to use
 * @returns {HTMLElement} The styled HTML element
 */
export function createLogElement(logString: string, themeName = DEFAULT_THEME) {
  // Parse the log
  const parsedLog = parseJsonLog(logString);

  // Get the theme
  const theme = getTheme(themeName);

  // Get the color
  const color = getLogColor(parsedLog, themeName);

  // Format the log
  const formattedLog = formatLog(parsedLog);

  // Create the element
  const element = document.createElement('div');
  element.textContent = formattedLog;
  element.style.color = color;

  // Apply bold if needed
  if (theme.levels[parsedLog.level]?.bold) {
    element.style.fontWeight = 'bold';
  }

  return element;
}

/**
 * Initialize a log viewer in a container element
 * @param {HTMLElement} container - The container element
 * @param {string} themeName - The name of the theme to use
 * @returns {Object} An object with methods to add logs
 */
export function initLogViewer(container: HTMLElement, themeName = DEFAULT_THEME) {
  return {
    addLog(logString: string) {
      const logElement = createLogElement(logString, themeName);
      container.appendChild(logElement);
      // Auto-scroll to bottom
      container.scrollTop = container.scrollHeight;
    },

    setTheme(newThemeName: string) {
      themeName = newThemeName;
      // Clear and re-render all logs with new theme
      // This is a simple implementation - in a real app you might want to store logs
      // and re-render them with the new theme
      container.innerHTML = '';
    },

    clear() {
      container.innerHTML = '';
    }
  };
}

// Re-export theme utilities from LogsDX
export { getTheme, getLevelColor, getStatusColor, DEFAULT_THEME, THEMES };
