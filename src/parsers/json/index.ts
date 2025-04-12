import fs from "fs";
import path from "path";
import JSON5 from "json5";
import { type RegexParserRule } from "@/src/types";
import { createRegexLineParser } from "@/src/parsers/regex/line";
import {
  type LineParser,
  type LineParseResult,
  type JSONRule,
} from "@/src/types";

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
      console.error("Failed to load custom JSON rules:", error);
      console.log("Using default JSON rules instead");
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
        level: json.level || json.status || json.severity || "info",
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
