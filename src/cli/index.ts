#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { createRegexLineParser } from "@/src/parsers/regex/line";
import { loadJsonRules } from "@/src/parsers/json";
import { styleLine } from "./styles";
import { logger } from "@/src/utils/logger";
import type { LogLevel, ParsedLine, CliOptions } from "@/src/types";
import { DEFAULT_CONFIG } from "@/src/constants";

export const processArg = (
  arg: string,
  index: number,
  options: CliOptions,
  args: string[],
): number => {
  if (!arg) return index;

  if (arg === "--quiet") {
    options.flags.add("quiet");
    return index;
  }

  if (arg === "--debug") {
    options.isDebug = true;
    logger
      .withConfig({ level: "debug", prefix: "CLI" })
      .debug("Debug mode enabled");
    return index;
  }

  if (arg.startsWith("--level=")) {
    const level = arg.split("=")[1];
    if (
      level &&
      (level === "debug" ||
        level === "info" ||
        level === "warn" ||
        level === "error")
    ) {
      options.minLevel = level as LogLevel;
      if (options.isDebug) {
        logger
          .withConfig({ level: "debug", prefix: "CLI" })
          .debug(`Minimum log level set to: ${level}`);
      }
    }
    return index;
  }

  if (arg === "--output" && index + 1 < args.length) {
    const nextArg = args[index + 1];
    if (nextArg && !nextArg.startsWith("--")) {
      options.outputFile = nextArg;
      if (options.isDebug) {
        logger
          .withConfig({ level: "debug", prefix: "CLI" })
          .debug(`Output file set to: ${nextArg}`);
      }
      return index + 1;
    }
  }

  if (!arg.startsWith("--")) {
    options.inputFile = arg;
    if (options.isDebug) {
      logger
        .withConfig({ level: "debug", prefix: "CLI" })
        .debug(`Input file set to: ${arg}`);
    }
  }

  return index;
};

export const parseArgs = (args: string[]): CliOptions => {
  const options: CliOptions = {
    flags: new Set<string>(),
    inputFile: "",
    outputFile: "",
    minLevel: undefined,
    isDebug: false,
  };

  // First pass: handle flags and options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg && arg.startsWith("--")) {
      i = processArg(arg, i, options, args);
    }
  }

  // Second pass: handle input file (first non-flag argument)
  for (const arg of args) {
    if (arg && !arg.startsWith("--") && !options.inputFile) {
      processArg(arg, 0, options, args);
      break;
    }
  }

  return options;
};

export const createOutputStream = (
  outputFile: string,
  isDebug: boolean,
): fs.WriteStream | NodeJS.WriteStream => {
  if (!outputFile) return process.stdout;

  try {
    const stream = fs.createWriteStream(outputFile, { flags: "a" });
    stream.on("error", (error: Error) => {
      logger.error("Error writing to output file:", error);
      process.exit(1);
    });
    if (isDebug) {
      logger
        .withConfig({ level: "debug", prefix: "CLI" })
        .debug(`Created write stream for: ${outputFile}`);
    }
    return stream;
  } catch (error) {
    logger.error("Failed to create output stream:", error as Error);
    process.exit(1);
  }
};

export const getParser = async (options: CliOptions) => {
  const rulePath = path.resolve(process.cwd(), "log_rules.json");

  try {
    if (fs.existsSync(rulePath)) {
      if (options.isDebug) {
        logger
          .withConfig({ level: "debug", prefix: "CLI" })
          .debug(`Loading rules from: ${rulePath}`);
      }
      return await loadJsonRules(rulePath);
    }
  } catch (error) {
    logger.error("Failed to load rules from file:", error as Error);
  }

  if (options.isDebug) {
    logger
      .withConfig({ level: "debug", prefix: "CLI" })
      .debug("Using default regex rules");
  }
  return createRegexLineParser(DEFAULT_CONFIG.defaultRules);
};

export const shouldRender = (
  level: string | undefined,
  minLevel: LogLevel | undefined,
): boolean => {
  if (!minLevel || !level) return true;
  const current = DEFAULT_CONFIG.levels[level as LogLevel] ?? 0;
  const min = DEFAULT_CONFIG.levels[minLevel] ?? 0;
  return current >= min;
};

export const handleLine = (
  parser: ReturnType<typeof createRegexLineParser>,
  line: string,
  options: CliOptions,
  output: fs.WriteStream | NodeJS.WriteStream,
): void => {
  try {
    const parsed = parser(line) as ParsedLine;
    const level = parsed?.level;
    const styled = styleLine(line, level);

    if (shouldRender(level, options.minLevel)) {
      if (!options.flags.has("quiet")) console.log(styled);
      if (output !== process.stdout) {
        const writeStream = output as fs.WriteStream;
        writeStream.write(styled + "\n", (error: Error | null | undefined) => {
          if (error) {
            logger.error("Error writing to output file:", error);
            process.exit(1);
          }
        });
      }
    }
  } catch (error) {
    logger.error("Error processing line:", error as Error);
  }
};

export const processFile = async (
  inputFile: string,
  parser: ReturnType<typeof createRegexLineParser>,
  options: CliOptions,
  output: fs.WriteStream | NodeJS.WriteStream,
): Promise<void> => {
  try {
    if (options.isDebug) {
      logger
        .withConfig({ level: "debug", prefix: "CLI" })
        .debug(`Reading from file: ${inputFile}`);
    }
    const content = fs.readFileSync(inputFile, "utf-8");
    const lines = content.split("\n");
    if (options.isDebug) {
      logger
        .withConfig({ level: "debug", prefix: "CLI" })
        .debug(`Processing ${lines.length} lines from file`);
    }
    lines.forEach((line) => handleLine(parser, line, options, output));
  } catch (error) {
    logger.error("Error reading input file:", error as Error);
    process.exit(1);
  }
};

export const processStdin = (
  parser: ReturnType<typeof createRegexLineParser>,
  options: CliOptions,
  output: fs.WriteStream | NodeJS.WriteStream,
): void => {
  if (options.isDebug) {
    logger
      .withConfig({ level: "debug", prefix: "CLI" })
      .debug("Reading from stdin");
  }
  let buffer = "";

  process.stdin.setEncoding("utf8");

  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    lines.forEach((line) => handleLine(parser, line, options, output));
  });

  process.stdin.on("error", (error: Error) => {
    logger.error("Error reading from stdin:", error);
    process.exit(1);
  });

  process.stdin.on("end", () => {
    if (buffer) handleLine(parser, buffer, options, output);
    if (output !== process.stdout) {
      (output as fs.WriteStream).end();
    }
  });
};

// Handle process termination
let globalOptions: CliOptions | null = null;

process.on("SIGINT", () => {
  if (globalOptions?.isDebug) {
    logger
      .withConfig({ level: "debug", prefix: "CLI" })
      .debug("Received SIGINT, shutting down");
  }
  if (process.stdout !== process.stdout) {
    (process.stdout as unknown as fs.WriteStream).end();
  }
  process.exit(0);
});

export const main = async (): Promise<void> => {
  try {
    const options = parseArgs(process.argv.slice(2));
    globalOptions = options; // Set global options for signal handlers
    const parser = await getParser(options);
    const output = createOutputStream(options.outputFile, options.isDebug);

    if (options.inputFile) {
      await processFile(options.inputFile, parser, options, output);
    } else {
      processStdin(parser, options, output);
    }
  } catch (error) {
    logger.error("Fatal error:", error as Error);
    process.exit(1);
  }
};

// Only run main if this file is being executed directly
if (require.main === module) {
  main().catch((error) => {
    logger.error("Unhandled error:", error as Error);
    process.exit(1);
  });
}
