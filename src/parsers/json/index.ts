import fs from "fs";
import JSON5 from "json5";
import {
  type LineParser,
  type LineParseResult,
  type JSONRule,
  type LogLevel,
} from "@/src/types";
import { logger } from "@/src/utils/logger";

// Default rules for JSON parsing
const DEFAULT_JSON_RULES: JSONRule[] = [
  {
    match: "\\{.*\\}",
    lang: "json",
    level: "info",
    meta: {
      service: "service",
      timestamp: "timestamp",
      message: "message",
      level: "level"
    }
  }
];

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

/**
 * Loads JSON rules from a file or uses default rules
 * @param filePath Optional path to a custom rules file
 * @returns A line parser function
 */
export async function loadJsonRules(
  filePath?: string,
): Promise<LineParser> {
  let rules: JSONRule[] = DEFAULT_JSON_RULES;
  
  // If a file path is provided, try to load custom rules
  if (filePath) {
    try {
      const data = fs.readFileSync(filePath, "utf-8");
      const customRules = JSON5.parse(data);
      if (Array.isArray(customRules) && customRules.length > 0) {
        rules = customRules;
      }
    } catch (error) {
      logger.warn(`Failed to load custom JSON rules: ${JSON5.stringify(error)}`);
      logger.info("Using default JSON rules instead");
    }
  }

  // Create a direct JSON parser using JSON5
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
