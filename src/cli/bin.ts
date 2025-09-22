#!/usr/bin/env node
import { Command } from "commander";
import { main } from "./index";
import { version } from "../../package.json";

const program = new Command();

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
  .action(async (input, options) => await main(input, options));

program.parse();
