import { type ParsedLog } from "./types";

/**
 * Default line parser that does minimal parsing
 * @param line The log line to parse
 * @returns A parsed log object with minimal structure
 */
export const defaultLineParser = (line: string): ParsedLog => {
  return {
    message: line,
    level: "info",
    timestamp: new Date().toISOString(),
  };
};
