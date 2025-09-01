#!/usr/bin/env bun

import pino from "pino";
import { getLogsDX } from "../src/index";

// Example 1: Pino with LogsDX styling
console.log("=== Example 1: Pino with LogsDX styling ===\n");

const pinoLogger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: false,
      translateTime: "HH:MM:ss",
      ignore: "pid,hostname",
    },
  },
});

// Demonstrate basic Pino logging
pinoLogger.info("Basic Pino log without LogsDX styling");

// Wrap logger methods to apply logsdx styling
const logsDX = getLogsDX({ theme: "dracula" });
const styledLogger = {
  info: (msg: string) => {
    const styled = logsDX.processLine(`INFO: ${msg}`);
    console.log(styled);
  },
  warn: (msg: string) => {
    const styled = logsDX.processLine(`WARN: ${msg}`);
    console.log(styled);
  },
  error: (msg: string) => {
    const styled = logsDX.processLine(`ERROR: ${msg}`);
    console.log(styled);
  },
};

styledLogger.info("Server started on port 3000");
styledLogger.warn("Memory usage high: 85%");
styledLogger.error("Database connection failed");

// Example 2: Show different themes
console.log("\n\n=== Example 2: LogsDX with different themes ===\n");

const themes = ["oh-my-zsh", "dracula", "github-dark", "solarized-dark"];
const message = "Processing request id=12345";

themes.forEach((themeName) => {
  const themed = getLogsDX({ theme: themeName });
  const styled = themed.processLine(`INFO: ${message}`);
  console.log(`${themeName}: ${styled}`);
});

// Example 3: Using style function directly
console.log("\n\n=== Example 3: Direct style function usage ===\n");


const logMessage = "GET /api/users 200 OK (123ms)";
console.log("Original:", logMessage);
const draculaLogger = getLogsDX({ theme: "dracula" });
console.log("Styled:", draculaLogger.processLine(logMessage));

// Example 4: Winston-style integration
console.log("\n\n=== Example 4: Winston-style format function ===\n");

const githubLogger = getLogsDX({ theme: "github-dark" });
const winstonFormat = (info: any) => {
  const message = `${info.level.toUpperCase()}: ${info.message}`;
  return githubLogger.processLine(message);
};

// Simulate winston logs
const logs = [
  { level: "info", message: "Application started successfully" },
  { level: "warn", message: "API rate limit approaching" },
  { level: "error", message: "Failed to connect to database" },
];

logs.forEach((log) => {
  console.log(winstonFormat(log));
});
