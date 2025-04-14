import type { LogLevel, Config } from "@/src/types";

export const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  success: 2,
  trace: 0,
};

export const DEFAULT_CONFIG: Config = {
  levels: LEVEL_PRIORITY,
  defaultRules: [
    { match: /ERROR/, extract: () => ({ level: "error" }) },
    { match: /WARN/, extract: () => ({ level: "warn" }) },
    { match: /INFO/, extract: () => ({ level: "info" }) },
  ],
};
