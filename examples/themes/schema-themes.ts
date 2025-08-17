#!/usr/bin/env tsx

/**
 * Schema-based Theme Examples for LogsDX
 * Demonstrates how to create themes using LogsDX's SchemaConfig system
 * and shows identical styling between terminal and browser
 */

import { LogsDX } from "../../src";
import { createTheme, createSimpleTheme } from "../../src/themes/builder";
import type { SimpleThemeConfig } from "../../src/themes/builder";

// Example 1: API Logs Theme using full schema
const apiLogsTheme = createTheme({
  name: "api-logs",
  description: "Theme optimized for API request/response logs",
  colors: {
    primary: "#007acc", // Blue for GET requests
    secondary: "#28a745", // Green for success
    accent: "#ffc107", // Yellow for warnings
    error: "#dc3545", // Red for errors
    warning: "#fd7e14", // Orange for warnings
    info: "#17a2b8", // Cyan for info
    success: "#28a745", // Green for success
    debug: "#6f42c1", // Purple for debug
    text: "#212529", // Dark gray for text
    muted: "#6c757d", // Gray for muted
  },
  // Use specific presets
  presets: ["logLevels", "numbers", "dates"],
  // Define custom words for HTTP methods and status codes
  customWords: {
    GET: "primary",
    POST: "info",
    PUT: "warning",
    DELETE: "error",
    PATCH: "secondary",
    HEAD: "muted",
    OPTIONS: "muted",
    "200": { color: "success", styleCodes: ["bold"] },
    "201": { color: "success", styleCodes: ["bold"] },
    "400": { color: "warning", styleCodes: ["bold"] },
    "401": { color: "error", styleCodes: ["bold"] },
    "403": { color: "error", styleCodes: ["bold"] },
    "404": { color: "warning", styleCodes: ["bold"] },
    "500": { color: "error", styleCodes: ["bold", "underline"] },
  },
  // Define custom patterns for API-specific formats
  customPatterns: [
    {
      name: "url-path",
      pattern: "/[a-zA-Z0-9/_-]+",
      color: "secondary",
      style: ["italic"],
    },
    {
      name: "ip-address",
      pattern: "\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b",
      color: "info",
      style: ["bold"],
    },
    {
      name: "response-time",
      pattern: "\\d+ms",
      color: "accent",
    },
  ],
});

// Example 2: Terminal Hacker Theme
const terminalHackerTheme = createSimpleTheme(
  "terminal-hacker",
  {
    primary: "#00ff00", // Bright green
    secondary: "#00cc00", // Medium green
    accent: "#ffffff", // White
    error: "#ff0000", // Red
    warning: "#ffff00", // Yellow
    info: "#00ffff", // Cyan
    success: "#00ff00", // Green
    debug: "#00aa00", // Dark green
    text: "#00ff00", // Green text
    muted: "#008800", // Darker green
  },
  {
    customWords: {
      SYSTEM: { color: "error", styleCodes: ["bold", "underline"] },
      ACCESS: { color: "success", styleCodes: ["bold"] },
      DENIED: { color: "error", styleCodes: ["bold"] },
      GRANTED: { color: "success", styleCodes: ["bold"] },
      BREACH: { color: "error", styleCodes: ["bold"] },
      SECURE: { color: "success", styleCodes: ["bold"] },
    },
    customPatterns: [
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
  },
);

// Example 3: Minimal theme with just colors
const minimalTheme = createSimpleTheme("minimal", {
  error: "#e74c3c",
  warning: "#f39c12",
  info: "#3498db",
  success: "#27ae60",
  text: "#2c3e50",
});

console.log("=== LogsDX Schema-based Theme Examples ===\\n");

// Sample logs that demonstrate the patterns
const sampleLogs = [
  "2024-01-15T10:30:42.123Z [INFO] GET /api/users/123 200 45ms",
  "2024-01-15T10:30:43.456Z [ERROR] POST /api/auth/login 401 234ms - Authentication failed",
  "2024-01-15T10:30:44.789Z [WARN] DELETE /api/posts/456 429 12ms - Rate limit exceeded",
  "2024-01-15T10:30:45.012Z [DEBUG] Processing request from 192.168.1.100",
  "SYSTEM ACCESS GRANTED for user:admin123 with token 0xabc123def",
  "SYSTEM BREACH DENIED from 203.0.113.42 - SECURE protocol active",
];

// Demonstrate API Logs Theme
console.log("1. API LOGS THEME (Terminal Output):");
console.log(
  "Theme matches HTTP methods, status codes, URLs, IPs, and response times\\n",
);

const apiLogsDX = LogsDX.getInstance({
  theme: apiLogsTheme,
  outputFormat: "ansi",
});

sampleLogs.slice(0, 4).forEach((log) => {
  console.log(apiLogsDX.processLine(log));
});

console.log("\\n" + "=".repeat(60) + "\\n");

// Demonstrate Terminal Hacker Theme
console.log("2. TERMINAL HACKER THEME (Terminal Output):");
console.log(
  "Theme matches system messages, access control, user IDs, and hex values\\n",
);

const hackerLogsDX = LogsDX.getInstance({
  theme: terminalHackerTheme,
  outputFormat: "ansi",
});

sampleLogs.slice(4).forEach((log) => {
  console.log(hackerLogsDX.processLine(log));
});

console.log("\\n" + "=".repeat(60) + "\\n");

// Show HTML output for browser
console.log("3. BROWSER HTML OUTPUT (same themes, different format):");
console.log("Same themes produce HTML instead of ANSI codes\\n");

const browserApiLogsDX = LogsDX.getInstance({
  theme: apiLogsTheme,
  outputFormat: "html",
  htmlStyleFormat: "css",
});

console.log("HTML with inline CSS:");
console.log(browserApiLogsDX.processLine(sampleLogs[0]));
console.log("\\n");

const browserClassLogsDX = LogsDX.getInstance({
  theme: apiLogsTheme,
  outputFormat: "html",
  htmlStyleFormat: "className",
});

console.log("HTML with CSS classes:");
console.log(browserClassLogsDX.processLine(sampleLogs[0]));

console.log(`
=== Schema Configuration Summary ===

LogsDX themes are defined using a SchemaConfig that includes:

1. matchWords: Exact word matching (e.g., "ERROR", "GET", "200")
2. matchPatterns: Regex pattern matching (e.g., IP addresses, URLs)
3. defaultStyle: Fallback styling for unmatched content
4. whiteSpace/newLine: Control whitespace handling

The same schema produces:
- ANSI escape codes for terminal
- HTML with CSS for browsers  
- HTML with CSS classes for custom styling

This ensures logs look identical across environments!
`);

export { apiLogsTheme, terminalHackerTheme, minimalTheme };
