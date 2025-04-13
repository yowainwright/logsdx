import type { LogLevel, LoggerConfig } from "@/src/types";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  trace: 0,
  info: 1,
  success: 1,
  warn: 2,
  error: 3,
};

export class Logger {
  private readonly config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = {
      level: config.level,
      prefix: config.prefix ?? "",
      timestamp: config.timestamp ?? true,
    };
  }

  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = [];

    if (this.config.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(`[${level.toUpperCase()}]`);

    if (this.config.prefix) {
      parts.push(`[${this.config.prefix}]`);
    }

    parts.push(message);

    return parts.join(" ");
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  debug(message: string): void {
    if (this.shouldLog("debug")) {
      console.error(this.formatMessage("debug", message));
    }
  }

  info(message: string): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message));
    }
  }

  warn(message: string): void {
    if (this.shouldLog("warn")) {
      console.error(this.formatMessage("warn", message));
    }
  }

  error(message: string, error?: Error): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message));
      if (error) {
        console.error(error);
      }
    }
  }

  // Create a new logger instance with updated config
  withConfig(config: Partial<LoggerConfig>): Logger {
    return new Logger({
      ...this.config,
      ...config,
    });
  }
}

// Create a default logger instance
export const logger = new Logger({
  level: "info",
  timestamp: true,
});
