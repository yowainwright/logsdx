import { type JSONRule, type LogLevel } from "@/src/types";

export const LOG_TYPES = [
  "level",
  "status",
  "severity",
  "timestamp",
  "time",
  "date",
  "@timestamp",
  "message",
  "msg",
  "log",
  "text"
];

export const DEFAULT_JSON_RULES: JSONRule[] = [
  {
    match: "\\{.*\\}",
    lang: "json",
    level: "info" as LogLevel,
    meta: {
      service: "service",
      timestamp: "timestamp",
      message: "message",
      level: "level"
    }
  }
];