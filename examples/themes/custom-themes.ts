#!/usr/bin/env tsx

/**
 * Examples showing how easy it is to create custom themes with LogsDX
 */

import { LogsDX } from "../../src";
import {
  createTheme,
  createSimpleTheme,
  extendTheme,
  getTheme,
  registerTheme,
  THEME_PRESETS,
} from "../../src/themes";

// Example 1: Create a simple theme with just colors
const neonTheme = createSimpleTheme("neon", {
  primary: "#ff6b6b",
  secondary: "#4ecdc4", 
  accent: "#45b7d1",
  error: "#ff5555",
  warning: "#ffb86c",
  info: "#8be9fd",
  success: "#50fa7b",
  debug: "#bd93f9",
  text: "#f8f8f2",
  muted: "#6272a4",
});

// Example 2: Create a theme with custom patterns and words
const terminalTheme = createTheme({
  name: "terminal-hacker",
  description: "Green-on-black hacker terminal theme",
  colors: {
    primary: "#00ff00",
    secondary: "#00cc00", 
    accent: "#ffffff",
    error: "#ff0000",
    warning: "#ffff00",
    info: "#00ffff",
    success: "#00ff00",
    debug: "#00aa00",
    text: "#00ff00",
    muted: "#008800",
  },
  // Only use specific presets
  presets: ["logLevels", "booleans", "numbers"],
  // Add custom words
  customWords: {
    "SYSTEM": "error",
    "ACCESS": "success", 
    "DENIED": "error",
    "GRANTED": "success",
    "BREACH": { color: "error", styleCodes: ["bold", "blink"] },
  },
  // Add custom patterns
  customPatterns: [
    {
      name: "ip-address",
      pattern: "\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b",
      color: "info",
      style: ["bold"],
    },
    {
      name: "user-id",
      pattern: "user:[a-zA-Z0-9]+",
      color: "warning",
    },
    {
      name: "hex-hash",
      pattern: "0x[a-fA-F0-9]+",
      color: "accent",
    },
  ],
});

// Example 3: Extend an existing theme
const darkDraculaTheme = extendTheme(getTheme("dracula"), {
  name: "dark-dracula",
  description: "Even darker version of Dracula",
  colors: {
    // Override specific colors while keeping others
    text: "#44475a",
    muted: "#282a36",
  },
  // Add new custom words
  customWords: {
    "MIDNIGHT": "text",
    "SHADOW": "muted",
  },
});

// Example 4: Build a theme for specific use case (API logs)
const apiTheme = createTheme({
  name: "api-logs",
  description: "Theme optimized for API request/response logs",
  colors: {
    primary: "#007acc",
    secondary: "#17a2b8", 
    accent: "#ffc107",
    error: "#dc3545",
    warning: "#fd7e14",
    info: "#17a2b8",
    success: "#28a745",
    debug: "#6f42c1",
    text: "#212529",
    muted: "#6c757d",
  },
  presets: ["logLevels", "strings", "numbers"],
  customWords: {
    "GET": "success",
    "POST": "info", 
    "PUT": "warning",
    "DELETE": "error",
    "PATCH": "secondary",
    "HEAD": "muted",
    "OPTIONS": "muted",
    "200": "success",
    "201": "success", 
    "400": "warning",
    "401": "error",
    "403": "error",
    "404": "warning",
    "500": "error",
  },
  customPatterns: [
    {
      name: "http-status",
      pattern: "\\b[1-5][0-9]{2}\\b",
      color: "info",
      style: ["bold"],
    },
    {
      name: "json-key",
      pattern: "\"[a-zA-Z_][a-zA-Z0-9_]*\"\\s*:",
      color: "primary",
    },
    {
      name: "url-path",
      pattern: "/[a-zA-Z0-9/_-]+",
      color: "secondary",
    },
  ],
});

// Example 5: Quick custom theme with minimal config
const simpleTheme = createSimpleTheme("ocean", {
  primary: "#0077be",
  error: "#e74c3c", 
  success: "#27ae60",
  text: "#2c3e50",
});

// Register all custom themes
registerTheme(neonTheme);
registerTheme(terminalTheme);
registerTheme(darkDraculaTheme);
registerTheme(apiTheme);
registerTheme(simpleTheme);

// Demo the themes
console.log("\\n=== Custom Theme Examples ===\\n");

const sampleLog = `2024-01-15 10:30:42 INFO User login successful: user:john123
2024-01-15 10:30:43 ERROR Database connection failed: 192.168.1.100:5432
2024-01-15 10:30:44 WARN Rate limit exceeded for IP 203.0.113.42
2024-01-15 10:30:45 DEBUG Processing request: GET /api/users/123
2024-01-15 10:30:46 SUCCESS User authenticated with token 0xabc123def
SYSTEM ACCESS GRANTED for user:admin
SYSTEM BREACH detected from 10.0.0.1`;

const themes = [neonTheme, terminalTheme, apiTheme, simpleTheme];

for (const theme of themes) {
  console.log(`\\n--- ${theme.name.toUpperCase()} THEME ---`);
  const logsdx = LogsDX.getInstance({ theme: theme.name });
  console.log(logsdx.processLine(sampleLog));
}

console.log("\\n=== Available Theme Presets ===\\n");
console.log("Built-in presets you can mix and match:");
for (const [name, preset] of Object.entries(THEME_PRESETS)) {
  console.log(`- ${name}: ${preset.name}`);
}

export {
  neonTheme,
  terminalTheme,
  darkDraculaTheme,
  apiTheme,
  simpleTheme,
};
