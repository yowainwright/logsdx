import { type LogLevel } from "@logsdx/parser-core";
import { type RegexParserRule } from "./types";

export const logParserRules: RegexParserRule[] = [
  // Language markers
  {
    match: /^\[json\]/i,
    extract: () => ({ lang: "json" }),
  },
  {
    match: /^\[sql\]/i,
    extract: () => ({ lang: "sql" }),
  },
  {
    match: /^\[lang:(\w+)\]/i,
    extract: (_line, match) => ({ lang: match[1]?.toLowerCase() }),
  },

  // Log levels with various formats
  {
    match: /\[(ERROR|ERR|FATAL|CRITICAL)\]/i,
    extract: () => ({ level: "error" as LogLevel }),
  },
  {
    match: /\[(WARN|WARNING|ATTENTION)\]/i,
    extract: () => ({ level: "warn" as LogLevel }),
  },
  {
    match: /\[(INFO|INFORMATION)\]/i,
    extract: () => ({ level: "info" as LogLevel }),
  },
  {
    match: /\[(DEBUG|TRACE|VERBOSE)\]/i,
    extract: () => ({ level: "debug" as LogLevel }),
  },
  {
    match: /\[(SUCCESS|SUCCEEDED|COMPLETED)\]/i,
    extract: () => ({ level: "success" as LogLevel }),
  },

  // Common log formats
  {
    match:
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+\[(\w+)\]\s+(.*)$/,
    extract: (_line, match) => ({
      timestamp: match[1],
      level: match[2]?.toLowerCase() as LogLevel,
      message: match[3],
    }),
  },
  {
    match:
      /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s+\[(\w+)\]\s+(.*)$/,
    extract: (_line, match) => ({
      timestamp: match[1],
      level: match[2]?.toLowerCase() as LogLevel,
      message: match[3],
    }),
  },
  {
    match:
      /^\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\]\s+\[(\w+)\]\s+(.*)$/,
    extract: (_line, match) => ({
      timestamp: match[1],
      level: match[2]?.toLowerCase() as LogLevel,
      message: match[3],
    }),
  },

  // Simple level detection (fallback)
  {
    match: /\b(ERROR|ERR|FATAL|CRITICAL)\b/i,
    extract: () => ({ level: "error" as LogLevel }),
  },
  {
    match: /\b(WARN|WARNING|ATTENTION)\b/i,
    extract: () => ({ level: "warn" as LogLevel }),
  },
  {
    match: /\b(INFO|INFORMATION)\b/i,
    extract: () => ({ level: "info" as LogLevel }),
  },
  {
    match: /\b(DEBUG|TRACE|VERBOSE)\b/i,
    extract: () => ({ level: "debug" as LogLevel }),
  },
  {
    match: /\b(SUCCESS|SUCCEEDED|COMPLETED)\b/i,
    extract: () => ({ level: "success" as LogLevel }),
  },
];
