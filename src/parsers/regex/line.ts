import { type RegexParserRule, type LineParser } from "@/src/types";

export function createRegexLineParser(rules: RegexParserRule[]): LineParser {
  return (line) => {
    let result: Record<string, any> | undefined;

    // First, try to match the full log format
    for (const rule of rules) {
      const match = line.match(rule.match);
      if (match) {
        const extracted = rule.extract?.(line, match) || {};
        // If we got a full match with timestamp, level, and message, return it
        if (extracted.timestamp && extracted.level && extracted.message) {
          return extracted;
        }
        // Otherwise, store the partial result, preserving existing values
        result = {
          ...extracted,
          ...result, // This ensures earlier matches take precedence
        };
      }
    }

    // If we have a partial result
    if (result) {
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
        }
      }

      return result;
    }

    return undefined;
  };
}
