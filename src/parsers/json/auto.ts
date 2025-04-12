import { type LineParser, type LineParseResult, type LogLevel } from "@/src/types";
import JSON5 from "json5";

/**
 * Creates a parser that automatically detects and parses JSON logs
 * @returns A line parser function
 */
export function createAutoJsonParser(): LineParser {
  return (line: string): LineParseResult | undefined => {
    try {
      // Check if the line looks like JSON
      if (!line.trim().startsWith("{") || !line.trim().endsWith("}")) {
        return undefined;
      }

      // Parse the JSON using JSON5
      const json = JSON5.parse(line);

      // Extract common log fields
      const result: LineParseResult = {
        level: mapLogLevel(json.level || json.status || json.severity || "info"),
        timestamp: json.timestamp || json.time || json.date || json["@timestamp"],
        message: json.message || json.msg || json.log || json.text,
        language: "json",
      };

      // Add all other fields as metadata
      for (const [key, value] of Object.entries(json)) {
        if (!["level", "status", "severity", "timestamp", "time", "date", "@timestamp", "message", "msg", "log", "text"].includes(key)) {
          result[key] = value;
        }
      }

      return result;
    } catch (error) {
      // If parsing fails, return undefined to let other parsers handle it
      return undefined;
    }
  };
}

/**
 * Maps various log level formats to our standard log levels
 * @param level The log level to map
 * @returns A standardized log level
 */
function mapLogLevel(level: string): LogLevel {
  const levelMap: Record<string, LogLevel> = {
    // Standard levels
    debug: "debug",
    info: "info",
    warn: "warn",
    warning: "warn",
    error: "error",
    err: "error",
    success: "success",
    trace: "trace",
    
    // Common variations
    fatal: "error",
    critical: "error",
    notice: "info",
    verbose: "debug",
    silly: "debug",
    
    // Status-based levels
    fail: "error",
    failed: "error",
    failure: "error",
    pending: "warn",
    in_progress: "info",
    completed: "success",
  };

  const normalizedLevel = level.toLowerCase().trim();
  return levelMap[normalizedLevel] || "info";
} 