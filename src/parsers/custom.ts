import {
  type LineParser,
  type LineParseResult,
  type LogLevel,
} from "@/src/types";

export type CustomParserOptions ={
  name: string;
  description?: string;
  canParse?: (line: string) => boolean;
  parse: (line: string) => LineParseResult | undefined;
  validate?: () => boolean;
}

/**
 * Creates a custom parser with the given options
 * @param options Parser options
 * @returns A line parser function
 */
export function createCustomParser(options: CustomParserOptions): LineParser {
  // Validate the parser if a validation function is provided
  if (options.validate && !options.validate()) {
    throw new Error(`Invalid configuration for parser '${options.name}'`);
  }

  // Create the parser function
  const parser: LineParser = (line: string): LineParseResult | undefined => {
    // Check if the parser can handle this line
    if (options.canParse && !options.canParse(line)) {
      return undefined;
    }

    // Parse the line
    return options.parse(line);
  };

  // Add metadata to the parser function
  (parser as any).name = options.name;
  (parser as any).description =
    options.description || `Custom parser: ${options.name}`;

  return parser;
}

/**
 * Creates a parser factory function for registering with the parser registry
 * @param options Parser options
 * @returns A parser factory function
 */
export function createParserFactory(options: CustomParserOptions) {
  return async (): Promise<LineParser> => {
    return createCustomParser(options);
  };
}

/**
 * Helper function to map log levels from various formats to standard levels
 * @param level The log level to map
 * @returns A standardized log level
 */
export function mapLogLevel(level: string): LogLevel {
  const levelMap: Record<string, LogLevel> = {
    // Standard levels
    debug: "debug",
    info: "info",
    warn: "warn",
    warning: "warn",
    error: "error",
    err: "error",
    success: "success",
    trace: "trace",

    // Common variations
    fatal: "error",
    critical: "error",
    notice: "info",
    verbose: "debug",
    silly: "debug",

    // Status-based levels
    fail: "error",
    failed: "error",
    failure: "error",
    pending: "warn",
    in_progress: "info",
    completed: "success",
  };

  const normalizedLevel = level.toLowerCase().trim();
  return levelMap[normalizedLevel] || "info";
}

/**
 * Example: Creates a parser for CSV-formatted logs
 */
export function createCsvLogParser() {
  return createParserFactory({
    name: "csv-logs",
    description: "Parser for CSV-formatted logs",
    canParse: (line: string) => line.startsWith("CSV_LOG:"),
    parse: (line: string): LineParseResult | undefined => {
      // Remove the prefix
      const csvContent = line.substring(8);

      // Parse the CSV-like format
      const parts = csvContent.split(",");
      if (parts.length < 3) {
        return undefined;
      }

      // Extract information
      const timestamp = parts[0]?.trim() || "";
      const level = mapLogLevel(parts[1]?.trim() || "");
      const message = parts[2]?.trim() || "";

      // Create the result
      const result: LineParseResult = {
        timestamp,
        level,
        message,
        format: "csv",
      };

      // Add any additional fields
      for (let i = 3; i < parts.length; i++) {
        const part = parts[i];
        if (part) {
          const [key, value] = part.split("=");
          if (key && value) {
            result[key.trim()] = value.trim();
          }
        }
      }

      return result;
    },
  });
}

/**
 * Example: Creates a parser for application-specific logs
 */
export function createAppLogParser() {
  return createParserFactory({
    name: "app-logs",
    description: "Parser for application-specific logs",
    canParse: (line: string) => line.startsWith("[APP]"),
    parse: (line: string): LineParseResult | undefined => {
      // Match application-specific log format
      const appLogRegex =
        /^\[APP\]\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+\[(\w+)\]\s+(.*)$/;
      const appLogMatch = line.match(appLogRegex);

      if (appLogMatch && appLogMatch[1] && appLogMatch[2] && appLogMatch[3]) {
        return {
          timestamp: appLogMatch[1],
          level: mapLogLevel(appLogMatch[2]),
          message: appLogMatch[3],
          service: "app",
        };
      }

      // Match error stack traces
      const errorRegex = /^\[APP\]\s+ERROR\s+(.*?):\s+(.*)$/;
      const errorMatch = line.match(errorRegex);

      if (errorMatch && errorMatch[1] && errorMatch[2]) {
        return {
          level: "error",
          message: `${errorMatch[1]}: ${errorMatch[2]}`,
          service: "app",
        };
      }

      return undefined;
    },
  });
}
