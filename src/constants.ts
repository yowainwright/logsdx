import type { LogLevel, Config, ThemeStyles } from "./types";
import { ANSI } from "./cli/styles";

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

export const INK_DEFAULT_THEME: ThemeStyles = {
  error: ["brightRed", "bold"],
  warn: ["yellow"],
  info: ["blue"],
  debug: ["dim", "gray"],
  success: ["green"],
  trace: ["dim", "white"],
} as const;
