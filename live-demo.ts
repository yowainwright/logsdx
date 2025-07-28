#!/usr/bin/env bun

import { LogsDX } from "./src";
import { createTheme, createSimpleTheme } from "./src/themes/builder";

// Create the API logs theme
const apiLogsTheme = createTheme({
  name: "api-logs",
  description: "Theme optimized for API request/response logs",
  colors: {
    primary: "#007acc",     // Blue for GET requests
    secondary: "#28a745",   // Green for success
    accent: "#ffc107",      // Yellow for warnings
    error: "#dc3545",       // Red for errors
    warning: "#fd7e14",     // Orange for warnings
    info: "#17a2b8",        // Cyan for info
    success: "#28a745",     // Green for success
    debug: "#6f42c1",       // Purple for debug
    text: "#212529",        // Dark gray for text
    muted: "#6c757d",       // Gray for muted
  },
  presets: ["logLevels", "numbers", "dates"],
  customWords: {
    "GET": "primary",
    "POST": "info", 
    "PUT": "warning",
    "DELETE": "error",
    "200": { color: "success", styleCodes: ["bold"] },
    "201": { color: "success", styleCodes: ["bold"] },
    "400": { color: "warning", styleCodes: ["bold"] },
    "401": { color: "error", styleCodes: ["bold"] },
    "404": { color: "warning", styleCodes: ["bold"] },
    "500": { color: "error", styleCodes: ["bold", "underline"] },
  },
  customPatterns: [
    {
      name: "url-path",
      pattern: "/[a-zA-Z0-9/_-]+",
      color: "secondary",
      style: ["italic"]
    },
    {
      name: "ip-address", 
      pattern: "\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b",
      color: "info",
      style: ["bold"]
    },
    {
      name: "response-time",
      pattern: "\\d+ms",
      color: "accent",
    }
  ]
});

// Terminal hacker theme
const hackerTheme = createSimpleTheme("terminal-hacker", {
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
}, {
  customWords: {
    "SYSTEM": { color: "error", styleCodes: ["bold", "underline"] },
    "ACCESS": { color: "success", styleCodes: ["bold"] },
    "DENIED": { color: "error", styleCodes: ["bold"] },
    "GRANTED": { color: "success", styleCodes: ["bold"] },
  }
});

console.log("\n🎨 LogsDX Live Terminal Demo\n");
console.log("=" .repeat(60));

// API Logs Demo
console.log("\n📡 API LOGS THEME:");
console.log("Watch how HTTP methods, status codes, URLs, and response times are styled:\n");

const apiDX = LogsDX.getInstance({ 
  theme: apiLogsTheme, 
  outputFormat: "ansi" 
});

const apiLogs = [
  "2024-01-15T10:30:42.123Z [INFO] GET /api/users/123 200 45ms",
  "2024-01-15T10:30:43.456Z [ERROR] POST /api/auth/login 401 234ms - Authentication failed",
  "2024-01-15T10:30:44.789Z [WARN] DELETE /api/posts/456 429 12ms - Rate limit exceeded",
  "2024-01-15T10:30:45.012Z [DEBUG] Processing request from 192.168.1.100",
  "2024-01-15T10:30:46.234Z [ERROR] PUT /api/users/789 500 1230ms - Internal server error"
];

apiLogs.forEach(log => {
  console.log(apiDX.processLine(log));
});

console.log("\n" + "=" .repeat(60));

// Hacker Theme Demo
console.log("\n💻 TERMINAL HACKER THEME:");
console.log("Matrix-style green theme with system messages:\n");

const hackerDX = LogsDX.getInstance({ 
  theme: hackerTheme,
  outputFormat: "ansi" 
});

const hackerLogs = [
  "SYSTEM ACCESS GRANTED for user:admin123",
  "SYSTEM BREACH DENIED from 203.0.113.42",
  "[WARN] Anomaly detected in sector 0xff00aa",
  "SYSTEM ACCESS DENIED for user:guest456",
  "[INFO] SECURE connection established"
];

hackerLogs.forEach(log => {
  console.log(hackerDX.processLine(log));
});

console.log("\n" + "=" .repeat(60));
console.log("\n✨ The same themes work in the browser with HTML output!");
console.log("   Try: outputFormat: 'html' instead of 'ansi'\n");