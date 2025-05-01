#!/usr/bin/env node

import { Command } from "commander";
import winston from "winston";
import fs from "fs";
import { ParsedLine, CliOptions, StyleManager, Config, OutputStreamType, LogLevel } from "@/cli/types";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      level: 'info'
    })
  ]
});

const styleManager: StyleManager = {
  styleLine: (line: string, parsed: ParsedLine, parserName: string) => {
    return line;
  }
};

function loadConfig(): Config {
  return { theme: 'default', customThemes: {} };
}

function shouldRender(level: LogLevel, minLevel: string = 'info'): boolean {
  const levels: Record<LogLevel, number> = {
    error: 3,
    warn: 2,
    info: 1,
    debug: 0
  };
  return levels[level] >= levels[minLevel as LogLevel];
}

const program = new Command();

program
  .name("logsdx")
  .description("A powerful log parsing and formatting tool")
  .version("0.0.1")
  .option("-q, --quiet", "Suppress all output except errors")
  .option("-d, --debug", "Enable debug mode")
  .option("-l, --level <level>", "Minimum log level to display", "info")
  .option("-p, --parser <parser>", "Parser to use for log parsing", "default")
  .option("-r, --rules <file>", "Path to custom rules file")
  .option("-o, --output <file>", "Path to output file")
  .option("--list-parsers", "List available parsers")
  .option("-t, --theme <theme>", "Theme to use")
  .option("--list-themes", "List available themes")
  .enablePositionalOptions()
  .configureOutput({
    writeOut: (str) => process.stdout.write(str),
    writeErr: (str) => process.stderr.write(str),
    outputError: (str, write) => write(str)
  })
  .action(async (options: CliOptions) => {
    if (options.debug) {
      logger.level = 'debug';
      logger.debug("Debug mode enabled");
    }

    if (options.quiet) {
      logger.silent = true;
    }

    if (options.listParsers) {
      const parsers = getRegisteredParsers();
      logger.info("Available parsers:");
      parsers.forEach((parser) => logger.info(`  - ${parser}`));
      process.exit(0);
    }

    if (options.listThemes) {
      const config = loadConfig();
      const themes = config ? Object.keys(config.customThemes || {}) : [];
      logger.info("Available themes:");
      logger.info("Built-in themes:");
      logger.info("  - default");
      logger.info("  - dark");
      logger.info("  - light");
      logger.info("  - minimal");
      logger.info("  - dracula");
      if (themes.length > 0) {
        logger.info("Custom themes:");
        themes.forEach((theme) => logger.info(`  - ${theme}`));
      }
      process.exit(0);
    }

    const config = loadConfig();
    if (options.theme) {
      logger.debug(`Using theme: ${options.theme}`);
      setTheme(options.theme);
    } else if (config?.theme) {
      logger.debug(`Using theme from config: ${config.theme}`);
      setTheme(config.theme);
    }

    if (options.level && !["debug", "info", "warn", "error"].includes(options.level)) {
      throw new Error(`Invalid log level: ${options.level}`);
    }

    const parserFn = await getParser(options.parser || "default");
    const parser = await parserFn();

    const inputStream = process.stdin;
    const outputStream: OutputStreamType = options.output ? fs.createWriteStream(options.output) : process.stdout;

    let buffer = "";

    inputStream.on("data", (chunk: Buffer) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;

        const parsed = parser(line);
        const level = parsed?.level || "info";

        if (shouldRender(level, options.level as LogLevel)) {
          const formattedLine = styleManager.styleLine(line, parsed, options.parser || "default");

          if (outputStream === process.stdout) {
            process.stdout.write(formattedLine + "\n");
          } else {
            (outputStream as fs.WriteStream).write(formattedLine + "\n");
          }
        }
      }
    });

    inputStream.on("end", () => {
      if (buffer.trim()) {
        const parsed = parser(buffer);
        const level = parsed?.level || "info";

        if (shouldRender(level, options.level as LogLevel)) {
          const formattedLine = styleManager.styleLine(buffer, parsed, options.parser || "default");

          if (outputStream === process.stdout) {
            process.stdout.write(formattedLine + "\n");
          } else {
            (outputStream as fs.WriteStream).write(formattedLine + "\n");
          }
        }
      }
      if (options.output) {
        (outputStream as fs.WriteStream).end();
      }
    });

    inputStream.on("error", (error: Error) => {
      logger.error("Error reading input:", error);
      process.exit(1);
    });
  });

// Add autocomplete support
program.complete = () => {
  return {
    // Provide completion suggestions
    "--level": ["debug", "info", "warn", "error"],
    "--theme": ["default", "dark", "light", "minimal", "dracula"],
    "--parser": getRegisteredParsers()
  };
};

program.parse();
