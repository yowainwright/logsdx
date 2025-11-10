#!/usr/bin/env node
import { createCLI } from "../utils/cli";
import { main } from "./index";
import type { CommanderOptions } from "./types";
import { version } from "../../package.json";

const program = createCLI();

program
  .name("logsdx")
  .description("A powerful log processing and styling tool")
  .version(version)
  .option("-t, --theme <theme>", "Theme to use for styling")
  .option("-d, --debug", "Enable debug mode")
  .option("-o, --output <file>", "Output file path")
  .option("-c, --config <file>", "Path to config file")
  .option("-i, --interactive", "Launch interactive theme selector")
  .option("-p, --preview", "Show theme previews with sample logs")
  .option("--format <format>", "Output format (ansi|html)")
  .option("--list-themes", "List available themes")
  .option("--no-spinner", "Disable progress indicators")
  .option("--generate-theme", "Launch interactive theme generator")
  .option("--list-palettes", "List available color palettes")
  .option("--list-patterns", "List available pattern presets")
  .option("--export-theme [theme]", "Export a theme to JSON file")
  .option("--import-theme [file]", "Import a theme from JSON file")
  .option("--list-theme-files", "List theme files in current directory")
  .argument(
    "[input]",
    "Input file (optional, reads from stdin if not provided)",
  )
  .action(
    async (input: string | undefined, options: any) =>
      await main(input, options as CommanderOptions),
  );

program.parse();
