import { type LineParser } from "@logsdx/parser-core";
import { type RegexParserRule } from "./types";

export function createRegexLineParser(rules: RegexParserRule[]): LineParser {
  return (line) => {
    let result: Record<string, any> = {
      message: line,
      level: "info"
    };

    // First, try to match the full log format
    for (const rule of rules) {
      const match = line.match(rule.match);
      if (match) {
        const extracted = rule.extract?.(line, match) || {};
        // Merge the extracted values with the result
        result = {
          ...result,
          ...extracted
        };
      }
    }

    // Try to extract timestamp if not already present
    if (!result.timestamp) {
      const timestampMatch = line.match(
        /(\d{4}-\d{2}-\d{2}(?:T|\s+)\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/,
      );
      if (timestampMatch) {
        result.timestamp = timestampMatch[1];
      }
    }

    // Try to extract message if not already present
    if (!result.message) {
      // Look for message after timestamp and level markers
      const messageMatch = line.match(
        /(?:\]|\d{2}(?:Z|[+-]\d{2}:?\d{2})?)\s+(?:\[\w+\])?\s+(.+)$/,
      );
      if (messageMatch) {
        result.message = messageMatch[1];
      } else {
        // If we still don't have a message, use the original line
        result.message = line;
      }
    }

    return result;
  };
}
