/**
 * Shared theme configuration for both terminal and React client
 * This file defines color schemes that can be used consistently across interfaces
 */

// Theme configuration type
export const ThemeType = {
  name: "string",
  levels: {
    error: { color: "string", bold: true },
    warn: { color: "string" },
    info: { color: "string" },
    debug: { color: "string", dim: true },
    success: { color: "string" },
    trace: { color: "string", dim: true },
  },
  status: {
    success: { color: "string" },
    failure: { color: "string" },
    error: { color: "string" },
    pending: { color: "string" },
    cancelled: { color: "string" },
    timeout: { color: "string" },
  }
};

// Built-in themes
export const THEMES = {
  default: {
    name: "default",
    levels: {
      error: { color: "#ff0000", bold: true }, // Red
      warn: { color: "#ffcc00" },              // Yellow
      info: { color: "#0066ff" },              // Blue
      debug: { color: "#808080", dim: true },  // Gray
      success: { color: "#00cc00" },           // Green
      trace: { color: "#ffffff", dim: true },  // White
    },
    status: {
      success: { color: "#00cc00" },           // Green
      failure: { color: "#ff0000" },           // Red
      error: { color: "#ff0000" },             // Red
      pending: { color: "#ffcc00" },           // Yellow
      cancelled: { color: "#808080" },         // Gray
      timeout: { color: "#ff0000" },           // Red
    },
  },
  dark: {
    name: "dark",
    levels: {
      error: { color: "#ff5555", bold: true },  // Red
      warn: { color: "#ffb86c" },               // Orange
      info: { color: "#8be9fd" },               // Cyan
      debug: { color: "#6272a4", dim: true },   // Comment Purple
      success: { color: "#50fa7b" },            // Green
      trace: { color: "#f8f8f2", dim: true },   // Foreground
    },
    status: {
      success: { color: "#50fa7b" },            // Green
      failure: { color: "#ff5555" },            // Red
      error: { color: "#ff5555" },              // Red
      pending: { color: "#ffb86c" },            // Orange
      cancelled: { color: "#6272a4" },          // Comment Purple
      timeout: { color: "#ff5555" },            // Red
    },
  },
  dracula: {
    name: "dracula",
    levels: {
      error: { color: "#ff5555", bold: true },  // Red
      warn: { color: "#f1fa8c" },               // Yellow
      info: { color: "#8be9fd" },               // Cyan
      debug: { color: "#6272a4", dim: true },   // Comment Purple
      success: { color: "#50fa7b" },            // Green
      trace: { color: "#f8f8f2", dim: true },   // Foreground
    },
    status: {
      success: { color: "#50fa7b" },            // Green
      failure: { color: "#ff5555" },            // Red
      error: { color: "#ff5555" },              // Red
      pending: { color: "#f1fa8c" },            // Yellow
      cancelled: { color: "#6272a4" },          // Comment Purple
      timeout: { color: "#ff5555" },            // Red
    },
  },
  githubDark: {
    name: "githubDark",
    levels: {
      error: { color: "#f97583", bold: true },  // Red
      warn: { color: "#dbab09" },               // Yellow
      info: { color: "#79b8ff" },               // Blue
      debug: { color: "#6a737d", dim: true },   // Gray
      success: { color: "#85e89d" },            // Green
      trace: { color: "#d1d5da", dim: true },   // Light Gray
    },
    status: {
      success: { color: "#85e89d" },            // Green
      failure: { color: "#f97583" },            // Red
      error: { color: "#f97583" },              // Red
      pending: { color: "#dbab09" },            // Yellow
      cancelled: { color: "#6a737d" },          // Gray
      timeout: { color: "#f97583" },            // Red
    },
  },
};

// Default theme name
export const DEFAULT_THEME = "dracula";

// Get a theme by name
export function getTheme(themeName = DEFAULT_THEME) {
  return THEMES[themeName] || THEMES[DEFAULT_THEME];
}

// Get color for a specific log level
export function getLevelColor(level: string, themeName = DEFAULT_THEME) {
  const theme = getTheme(themeName);
  return theme.levels[level]?.color || theme.levels.info.color;
}

// Get color for a specific status
export function getStatusColor(status: string, themeName = DEFAULT_THEME) {
  const theme = getTheme(themeName);
  return theme.status[status]?.color || theme.status.success.color;
}

// Determine if a level/status should be bold
export function isBold(level: string, themeName = DEFAULT_THEME) {
  const theme = getTheme(themeName);
  return theme.levels[level]?.bold || false;
}

// Determine if a level/status should be dimmed
export function isDim(level: string, themeName = DEFAULT_THEME) {
  const theme = getTheme(themeName);
  return theme.levels[level]?.dim || false;
}
