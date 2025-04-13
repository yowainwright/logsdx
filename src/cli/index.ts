#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import { styleManager, setTheme } from "@/src/themes/asci/styles";
import { logger } from "@/src/utils/logger";
import type { LogLevel, CliOptions } from "@/src/types";
import { getParser, getRegisteredParsers } from "@/src/parsers/registry";
import { loadConfig } from "@/src/themes/asci/loader";

const program = new Command();

program
  .name("logsdx")
  .description("A powerful log parsing and formatting tool")
  .version("0.0.1");

program
  .option("-q, --quiet", "Suppress all output except errors")
  .option("-d, --debug", "Enable debug mode")
  .option("-l, --level <level>", "Minimum log level to display", "info")
  .option("-p, --parser <parser>", "Parser to use for log parsing", "default")
  .option("-r, --rules <file>", "Path to custom rules file")
  .option("-o, --output <file>", "Path to output file")
  .option("--list-parsers", "List available parsers")
  .option("-t, --theme <theme>", "Theme to use (default, dark, light, minimal, or custom theme name)")
  .option("--list-themes", "List available themes")
  .argument("[input]", "Input file to process (defaults to stdin)")
  .action(async (input: string, options: CliOptions) => {
    try {
      // Handle list parsers command
      if (options.listParsers) {
        const parsers = getRegisteredParsers();
        console.log("Available parsers:");
        parsers.forEach(parser => console.log(`  - ${parser}`));
        process.exit(0);
      }

      // Handle list themes command
      if (options.listThemes) {
        const config = loadConfig();
        const themes = config ? Object.keys(config.customThemes || {}) : [];
        console.log("Available themes:");
        console.log("Built-in themes:");
        console.log("  - default");
        console.log("  - dark");
        console.log("  - light");
        console.log("  - minimal");
        if (themes.length > 0) {
          console.log("Custom themes:");
          themes.forEach(theme => console.log(`  - ${theme}`));
        }
        process.exit(0);
      }

      // Set up debug logging
      if (options.debug) {
        logger.withConfig({ level: "debug", prefix: "CLI" }).debug("Debug mode enabled");
      }

      // Load and apply theme
      const config = loadConfig();
      if (options.theme) {
        if (options.debug) {
          logger.withConfig({ level: "debug", prefix: "CLI" }).debug(`Using theme: ${options.theme}`);
        }
        setTheme(options.theme);
      } else if (config?.theme) {
        if (options.debug) {
          logger.withConfig({ level: "debug", prefix: "CLI" }).debug(`Using theme from config: ${config.theme}`);
        }
        setTheme(config.theme);
      }

      // Validate log level
      if (options.level && !["debug", "info", "warn", "error"].includes(options.level)) {
        throw new Error(`Invalid log level: ${options.level}`);
      }

      // Create input stream
      const inputStream = input ? fs.createReadStream(input) : process.stdin;
      if (input && options.debug) {
        logger.withConfig({ level: "debug", prefix: "CLI" }).debug(`Input file set to: ${input}`);
      }

      // Create output stream
      const outputStream = options.output ? fs.createWriteStream(options.output) : process.stdout;
      if (options.output && options.debug) {
        logger.withConfig({ level: "debug", prefix: "CLI" }).debug(`Output file set to: ${options.output}`);
      }

      // Get parser
      const parser = await getParserForOptions(options);

      // Process input
      let buffer = "";
      inputStream.on("data", (chunk: Buffer | string) => {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          const parsed = parser(line);
          if (!parsed) continue;

          if (shouldRender(parsed.level, options.level as LogLevel)) {
            // Format the line based on the parsed result
            const formattedLine = styleManager.styleLine(line, parsed);
            // Use console.log for stdout, write for file streams
            if (outputStream === process.stdout) {
              console.log(formattedLine);
            } else {
              (outputStream as fs.WriteStream).write(formattedLine + "\n");
            }
          }
        }
      });

      inputStream.on("end", () => {
        if (buffer.trim()) {
          const parsed = parser(buffer);
          if (parsed && shouldRender(parsed.level, options.level as LogLevel)) {
            // Format the line based on the parsed result
            const formattedLine = styleManager.styleLine(buffer, parsed);
            // Use console.log for stdout, write for file streams
            if (outputStream === process.stdout) {
              console.log(formattedLine);
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

    } catch (error) {
      logger.error("Error:", error as Error);
      process.exit(1);
    }
  });

program.parse();

// Helper function to get parser for options
async function getParserForOptions(options: CliOptions) {
  const parserName = options.parser || "default";
  
  try {
    if (options.debug) {
      logger.withConfig({ level: "debug", prefix: "CLI" }).debug(`Using parser: ${parserName}`);
    }
    
    return await getParser(parserName, {
      rulesFile: options.rules
    });
  } catch (error) {
    logger.error(`Error loading parser '${parserName}':`, error as Error);
    logger.info(`Available parsers: ${getRegisteredParsers().join(", ")}`);
    process.exit(1);
  }
}

// Helper function to determine if a line should be rendered
function shouldRender(level: string | undefined, minLevel: LogLevel | undefined): boolean {
  if (!minLevel || !level) return true;
  
  // Define log level priorities
  const levelPriorities: Record<string, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    success: 1,
    trace: 0
  };
  
  const current = levelPriorities[level] ?? 0;
  const min = levelPriorities[minLevel] ?? 0;
  return current >= min;
}
