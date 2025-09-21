# Getting Started with LogsDX

This guide will walk you through setting up and using LogsDX in your project step by step.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Verification](#quick-verification)
- [Step-by-Step Tutorial](#step-by-step-tutorial)
  - [Step 1: Basic Log Styling](#step-1-basic-log-styling)
  - [Step 2: Processing Log Files](#step-2-processing-log-files)
  - [Step 3: Real-time Log Streaming](#step-3-real-time-log-streaming)
  - [Step 4: Browser Integration](#step-4-browser-integration)
  - [Step 5: Custom Theme Creation](#step-5-custom-theme-creation)
  - [Step 6: Integration with Winston Logger](#step-6-integration-with-winston-logger)
  - [Step 7: Using the CLI Tool](#step-7-using-the-cli-tool)
- [Common Patterns](#common-patterns)
  - [Pattern 1: Environment-based Themes](#pattern-1-environment-based-themes)
  - [Pattern 2: Multiple Output Formats](#pattern-2-multiple-output-formats)
  - [Pattern 3: Conditional Styling](#pattern-3-conditional-styling)
  - [Pattern 4: Log Level Filtering](#pattern-4-log-level-filtering)
- [Testing Your Setup](#testing-your-setup)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)
- [Resources](#resources)
- [Quick Reference](#quick-reference)

## Prerequisites

- **Node.js 18+** or **Bun 1.0+**
- Basic knowledge of JavaScript/TypeScript
- A project with logs to style

## Installation

Choose your package manager:

```bash
# Using npm
npm install logsdx

# Using bun (recommended for faster installation)
bun add logsdx

# Using yarn
yarn add logsdx

# Using pnpm
pnpm add logsdx
```

## Quick Verification

After installation, verify LogsDX is working:

```javascript
// test-logsdx.js
import { getLogsDX } from "logsdx";

const logger = getLogsDX("dracula");
console.log(logger.processLine("ERROR: Test message"));
```

Run it:
```bash
node test-logsdx.js
# You should see "ERROR" in red and "Test message" in styled text
```

## Step-by-Step Tutorial

### Step 1: Basic Log Styling

Let's start with the simplest use case - styling console output:

```javascript
// 1-basic.js
import { getLogsDX } from "logsdx";

// Create a logger with the 'nord' theme
const logger = getLogsDX("nord");

// Style different log levels
console.log(logger.processLine("INFO: Application starting..."));
console.log(logger.processLine("WARN: Config file not found, using defaults"));
console.log(logger.processLine("ERROR: Database connection failed"));
console.log(logger.processLine("SUCCESS: Server started on port 3000"));
```

### Step 2: Processing Log Files

Read and style existing log files:

```javascript
// 2-files.js
import { getLogsDX } from "logsdx";
import fs from "fs";

const logger = getLogsDX("dracula");

// Read a log file
const logContent = fs.readFileSync("app.log", "utf-8");
const lines = logContent.split("\n");

// Process and display styled logs
const styledLines = logger.processLines(lines);
styledLines.forEach(line => console.log(line));

// Or save to a new file (ANSI codes included)
fs.writeFileSync("styled-app.log", styledLines.join("\n"));
```

### Step 3: Real-time Log Streaming

Style logs as they're generated:

```javascript
// 3-streaming.js
import { getLogsDX } from "logsdx";
import { createReadStream } from "fs";
import { createInterface } from "readline";

const logger = getLogsDX("monokai");

// Stream and style logs line by line
const rl = createInterface({
  input: createReadStream("server.log"),
  crlfDelay: Infinity
});

rl.on("line", (line) => {
  console.log(logger.processLine(line));
});
```

### Step 4: Browser Integration

For web applications, use HTML output:

```javascript
// 4-browser.js
import { LogsDX } from "logsdx";

// Configure for HTML output
const logger = LogsDX.getInstance({
  theme: "github-dark",
  outputFormat: "html",
  htmlStyleFormat: "css"
});

// Generate HTML with inline styles
const htmlLog = logger.processLine("ERROR: User authentication failed");
// Returns: <span style="color:#ff5555;font-weight:bold">ERROR</span>: User authentication failed

// For React/Vue/Angular
document.getElementById("log-container").innerHTML = htmlLog;
```

### Step 5: Custom Theme Creation

Create a theme tailored to your needs:

```javascript
// 5-custom-theme.js
import { getLogsDX } from "logsdx";

const customTheme = {
  name: "my-app-theme",
  mode: "dark",
  schema: {
    defaultStyle: {
      color: "#ffffff"
    },
    matchWords: {
      // Log levels
      "FATAL": { color: "#ff0000", styleCodes: ["bold", "underline"] },
      "ERROR": { color: "#ff5555", styleCodes: ["bold"] },
      "WARN": { color: "#ffaa00" },
      "INFO": { color: "#00aaff" },
      "DEBUG": { color: "#888888", styleCodes: ["dim"] },

      // Custom keywords
      "DATABASE": { color: "#00ff00", styleCodes: ["italic"] },
      "API": { color: "#ff00ff", styleCodes: ["italic"] },
      "CACHE": { color: "#ffff00" }
    },
    matchPatterns: [
      // Highlight timestamps
      {
        name: "timestamp",
        pattern: "\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}",
        options: { color: "#666666", styleCodes: ["dim"] }
      },
      // Highlight IPs
      {
        name: "ip",
        pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
        options: { color: "#cyan" }
      },
      // Highlight UUIDs
      {
        name: "uuid",
        pattern: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
        options: { color: "#magenta", styleCodes: ["italic"] }
      }
    ]
  }
};

const logger = getLogsDX(customTheme);
console.log(logger.processLine("2024-01-15T10:30:00 ERROR: DATABASE connection to 192.168.1.100 failed"));
```

### Step 6: Integration with Winston Logger

```javascript
// 6-winston.js
import winston from "winston";
import { getLogsDX } from "logsdx";

const logsDX = getLogsDX("dracula");

// Create a custom Winston format
const logsDXFormat = winston.format.printf(({ level, message, timestamp }) => {
  const logLine = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  return logsDX.processLine(logLine);
});

// Configure Winston with LogsDX
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    logsDXFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Use Winston as normal - output will be styled
logger.info("Application started");
logger.error("Connection failed");
logger.warn("Low memory");
```

### Step 7: Using the CLI Tool

After installing LogsDX globally, use the CLI:

```bash
# Install globally for CLI access
npm install -g logsdx

# Basic usage
logsdx server.log

# With specific theme
logsdx server.log --theme dracula

# Process from stdin
tail -f /var/log/app.log | logsdx

# Save styled output
logsdx input.log --output styled.log --theme nord

# List all themes
logsdx --list-themes
```

## Common Patterns

### Pattern 1: Environment-based Themes

```javascript
import { getLogsDX } from "logsdx";

const theme = process.env.NODE_ENV === "production" ? "github-dark" : "dracula";
const logger = getLogsDX(theme);
```

### Pattern 2: Multiple Output Formats

```javascript
import { getLogsDX } from "logsdx";

const terminalLogger = getLogsDX("nord", { outputFormat: "ansi" });
const htmlLogger = getLogsDX("nord", { outputFormat: "html" });

const line = "ERROR: Critical failure";

// For terminal
console.log(terminalLogger.processLine(line));

// For web dashboard
const htmlOutput = htmlLogger.processLine(line);
```

### Pattern 3: Conditional Styling

```javascript
import { getLogsDX } from "logsdx";
import chalk from "chalk";

const logger = getLogsDX("dracula");

function log(message, level = "INFO") {
  const styledMessage = logger.processLine(`${level}: ${message}`);

  if (level === "ERROR") {
    console.error(styledMessage);
  } else {
    console.log(styledMessage);
  }
}

log("Server started", "INFO");
log("Database error", "ERROR");
```

### Pattern 4: Log Level Filtering

```javascript
import { getLogsDX } from "logsdx";

const logger = getLogsDX("nord");
const MIN_LEVEL = process.env.LOG_LEVEL || "INFO";

const levels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

function shouldLog(line) {
  const match = line.match(/^(ERROR|WARN|INFO|DEBUG):/);
  if (!match) return true;

  const lineLevel = match[1];
  return levels[lineLevel] <= levels[MIN_LEVEL];
}

function processLog(line) {
  if (shouldLog(line)) {
    console.log(logger.processLine(line));
  }
}
```

## Testing Your Setup

Create a test file to verify everything works:

```javascript
// test-setup.js
import { getLogsDX, getThemeNames, validateTheme } from "logsdx";

// Test 1: List available themes
console.log("Available themes:", getThemeNames());

// Test 2: Process different log types
const logger = getLogsDX("dracula");
const testLines = [
  "INFO: Server starting on port 3000",
  "WARN: Deprecated API used",
  "ERROR: Connection timeout at 192.168.1.1",
  "DEBUG: Cache miss for key abc-123-def",
  "2024-01-15T10:30:00Z ERROR: Database connection failed"
];

console.log("\nStyled output:");
testLines.forEach(line => {
  console.log(logger.processLine(line));
});

// Test 3: Validate custom theme
const customTheme = {
  name: "test",
  mode: "dark",
  schema: {
    defaultStyle: { color: "#fff" },
    matchWords: {
      "ERROR": { color: "#f00" }
    }
  }
};

const validation = validateTheme(customTheme);
console.log("\nTheme valid:", validation.success);
```

## Troubleshooting

### Issue: Colors not showing in terminal

**Solution:** Ensure your terminal supports ANSI colors. Set `FORCE_COLOR=1` environment variable:

```bash
FORCE_COLOR=1 node your-script.js
```

### Issue: CLI command not found

**Solution:** Install globally or use npx:

```bash
# Global install
npm install -g logsdx

# Or use npx
npx logsdx your-log-file.log
```

### Issue: Custom theme not working

**Solution:** Validate your theme:

```javascript
import { validateTheme } from "logsdx";

const result = validateTheme(yourTheme);
if (!result.success) {
  console.error("Theme validation errors:", result.error);
}
```

### Issue: HTML output shows raw tags

**Solution:** Use proper HTML rendering:

```javascript
// React
<div dangerouslySetInnerHTML={{ __html: logger.processLine(log) }} />

// Vanilla JS
element.innerHTML = logger.processLine(log);
```

## Next Steps

1. **Explore Themes**: Try different built-in themes to find your favorite
2. **Create Custom Themes**: Build themes that match your brand
3. **Integrate with Loggers**: Add LogsDX to your existing logging setup
4. **Share Themes**: Contribute your themes to the community

## Resources

- [API Documentation](../README.md#api-reference)
- [Theme Creation Guide](../README.md#creating-custom-themes)
- [GitHub Repository](https://github.com/yowainwright/logsdx)
- [Report Issues](https://github.com/yowainwright/logsdx/issues)

## Quick Reference

```javascript
import {
  getLogsDX,           // Get logger instance
  LogsDX,              // Class for singleton pattern
  getThemeNames,       // List available themes
  getTheme,            // Get theme by name
  getAllThemes,        // Get all theme objects
  registerTheme,       // Register custom theme
  validateTheme,       // Validate theme structure
  createTheme,         // Create theme helper
  renderLightBox,      // Light theme rendering
  checkWCAGCompliance, // Accessibility check
} from "logsdx";

// Configuration options
const options = {
  outputFormat: "ansi",     // "ansi" | "html"
  htmlStyleFormat: "css",   // "css" | "className"
  debug: false             // Enable debug output
};
```