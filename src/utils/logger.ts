import colors from "./colors";

export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
}

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

export function createLogger(prefix?: string) {
  return {
    info(message: string): void {
      if (shouldLog("info")) {
        console.log(colors.blue("ℹ"), formatMessage(prefix, message));
      }
    },

    success(message: string): void {
      if (shouldLog("info")) {
        console.log(colors.green("✔"), formatMessage(prefix, message));
      }
    },

    warn(message: string): void {
      if (shouldLog("warn")) {
        console.log(colors.yellow("⚠"), formatMessage(prefix, message));
      }
    },

    error(message: string): void {
      if (shouldLog("error")) {
        console.error(colors.red("✖"), formatMessage(prefix, message));
      }
    },

    debug(message: string): void {
      if (shouldLog("debug")) {
        console.log(colors.gray("⚙"), formatMessage(prefix, message));
      }
    },
  };
}

export const logger = createLogger();

export default logger;
