import colors from "./colors";
import type { LogLevel, LoggerConfig } from "./types";
import { LOG_LEVEL_PRIORITY } from "./constants";

let globalConfig: LoggerConfig = {
  level: "info",
};

function shouldLog(messageLevel: LogLevel): boolean {
  return (
    LOG_LEVEL_PRIORITY[messageLevel] <= LOG_LEVEL_PRIORITY[globalConfig.level]
  );
}

function formatMessage(prefix: string | undefined, message: string): string {
  return prefix ? `[${prefix}] ${message}` : message;
}

export function setLogLevel(level: LogLevel): void {
  globalConfig.level = level;
}

export function getLogLevel(): LogLevel {
  return globalConfig.level;
}

function createLogMethod(
  level: LogLevel,
  label: string,
  color: (s: string) => string,
  prefix?: string,
  useStderr = false,
) {
  return (message: string): void => {
    if (!shouldLog(level)) return;
    const output = useStderr ? console.error : console.log;
    output(color(label), formatMessage(prefix, message));
  };
}

export function createLogger(prefix?: string) {
  const print = (message: string): void => {
    if (!shouldLog("info")) return;
    console.log(message);
  };

  return {
    print,
    info: createLogMethod("info", "[info]", colors.blue, prefix),
    success: createLogMethod("info", "[ok]", colors.green, prefix),
    warn: createLogMethod("warn", "[warn]", colors.yellow, prefix),
    error: createLogMethod("error", "[error]", colors.red, prefix, true),
    debug: createLogMethod("debug", "[debug]", colors.gray, prefix),
  };
}

export const logger = createLogger();

export default logger;
export type { LogLevel };
