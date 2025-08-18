import { Command } from "commander";
import fs from "fs";
import path from "path";
import { LogsDX, getThemeNames } from "@/src/index";
import {
  type CliOptions,
  type CommanderOptions,
  cliOptionsSchema,
} from "@/src/cli/types";
import type { LogsDXOptions } from "@/src/types";
import { version } from "../../package.json";
import { ui } from "./ui";
import type { InteractiveConfig } from "./interactive";
import {
  runThemeGenerator,
  listColorPalettesCommand,
  listPatternPresetsCommand,
} from "./theme/generator";
import { exportTheme, importTheme, listThemeFiles } from "./theme/transporter";

export function loadConfig(configPath?: string): LogsDXOptions {
  const defaultConfig: LogsDXOptions = {
    theme: "oh-my-zsh",
    outputFormat: "ansi",
    debug: false,
    customRules: {},
  };

  try {
    const configLocations = [
      configPath,
      "./.logsdxrc",
      "./.logsdxrc.json",
      path.join(process.env.HOME || "", ".logsdxrc"),
      path.join(process.env.HOME || "", ".logsdxrc.json"),
    ].filter(Boolean);

    for (const location of configLocations) {
      if (location && fs.existsSync(location)) {
        const configContent = fs.readFileSync(location, "utf8");
        const config = JSON.parse(configContent);
        return { ...defaultConfig, ...config };
      }
    }
  } catch (error) {
    console.warn(`Failed to load config: ${error}`);
  }

  return defaultConfig;
}

const ARG_HANDLERS = {
  "--theme": (args: string[], i: number, options: CliOptions) => {
    const nextIndex = i + 1;
    if (nextIndex < args.length) {
      options.theme = args[nextIndex];
      return nextIndex;
    }
    return i;
  },
  "--debug": (args: string[], i: number, options: CliOptions) => {
    options.debug = true;
    return i;
  },
  "--quiet": (args: string[], i: number, options: CliOptions) => {
    options.quiet = true;
    return i;
  },
  "--list-themes": (args: string[], i: number, options: CliOptions) => {
    options.listThemes = true;
    return i;
  },
  "--output": (args: string[], i: number, options: CliOptions) => {
    const nextIndex = i + 1;
    if (nextIndex < args.length) {
      options.output = args[nextIndex];
      return nextIndex;
    }
    return i;
  },
  "--config": (args: string[], i: number, options: CliOptions) => {
    const nextIndex = i + 1;
    if (nextIndex < args.length) {
      options.config = args[nextIndex];
      return nextIndex;
    }
    return i;
  },
  "--interactive": (args: string[], i: number, options: CliOptions) => {
    options.interactive = true;
    return i;
  },
  "-i": (args: string[], i: number, options: CliOptions) => {
    options.interactive = true;
    return i;
  },
  "--preview": (args: string[], i: number, options: CliOptions) => {
    options.preview = true;
    return i;
  },
  "-p": (args: string[], i: number, options: CliOptions) => {
    options.preview = true;
    return i;
  },
  "--no-spinner": (args: string[], i: number, options: CliOptions) => {
    options.noSpinner = true;
    return i;
  },
  "--format": (args: string[], i: number, options: CliOptions) => {
    const nextIndex = i + 1;
    if (nextIndex < args.length) {
      const format = args[nextIndex];
      if (format === "ansi" || format === "html") {
        options.format = format;
      }
      return nextIndex;
    }
    return i;
  },
  "--generate-theme": (args: string[], i: number, options: CliOptions) => {
    options.generateTheme = true;
    return i;
  },
  "--list-palettes": (args: string[], i: number, options: CliOptions) => {
    options.listPalettes = true;
    return i;
  },
  "--list-patterns": (args: string[], i: number, options: CliOptions) => {
    options.listPatterns = true;
    return i;
  },
  "--export-theme": (args: string[], i: number, options: CliOptions) => {
    const nextIndex = i + 1;
    if (nextIndex < args.length) {
      options.exportTheme = args[nextIndex];
      return nextIndex;
    }
    options.exportTheme = "";
    return i;
  },
  "--import-theme": (args: string[], i: number, options: CliOptions) => {
    const nextIndex = i + 1;
    if (nextIndex < args.length) {
      options.importTheme = args[nextIndex];
      return nextIndex;
    }
    options.importTheme = "";
    return i;
  },
  "--list-theme-files": (args: string[], i: number, options: CliOptions) => {
    options.listThemeFiles = true;
    return i;
  },
} as const;

export function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    theme: undefined,
    debug: false,
    quiet: false,
    listThemes: false,
    interactive: false,
    preview: false,
    noSpinner: false,
    generateTheme: false,
    listPalettes: false,
    listPatterns: false,
    exportTheme: undefined,
    importTheme: undefined,
    listThemeFiles: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg in ARG_HANDLERS) {
      i = ARG_HANDLERS[arg as keyof typeof ARG_HANDLERS](args, i, options);
    } else if (!arg?.startsWith("--") && !options.input) {
      options.input = arg;
    }
  }

  return options;
}

export async function main(
  input: string | undefined,
  rawOptions: CommanderOptions,
): Promise<void> {
  const validatedOptions = cliOptionsSchema.parse(rawOptions);

  const options: CliOptions = cliOptionsSchema.parse({
    input,
    output: validatedOptions.output,
    theme: validatedOptions.theme,
    config: validatedOptions.config,
    debug: validatedOptions.debug,
    quiet: validatedOptions.quiet,
    listThemes: validatedOptions.listThemes,
    interactive: validatedOptions.interactive,
    preview: validatedOptions.preview,
    noSpinner: validatedOptions.noSpinner,
    generateTheme: validatedOptions.generateTheme,
    listPalettes: validatedOptions.listPalettes,
    listPatterns: validatedOptions.listPatterns,
    exportTheme: validatedOptions.exportTheme,
    importTheme: validatedOptions.importTheme,
    listThemeFiles: validatedOptions.listThemeFiles,
    format:
      validatedOptions.format === "ansi" || validatedOptions.format === "html"
        ? validatedOptions.format
        : undefined,
  });
  if (options.interactive) {
    try {
      const { runInteractiveMode } = await import("./interactive");
      const interactiveConfig: InteractiveConfig = await runInteractiveMode();
      options.theme = interactiveConfig.theme;
      options.format = interactiveConfig.outputFormat;
      options.preview = interactiveConfig.preview;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("User force closed")
      ) {
        ui.showInfo("👋 Interactive mode cancelled");
        return;
      }
      throw error;
    }
  }

  if (options.listPalettes) {
    listColorPalettesCommand();
    return;
  }

  if (options.listPatterns) {
    listPatternPresetsCommand();
    return;
  }

  if (options.listThemeFiles) {
    listThemeFiles();
    return;
  }

  if (options.exportTheme !== undefined) {
    await exportTheme(options.exportTheme || undefined);
    return;
  }

  if (options.importTheme !== undefined) {
    await importTheme(options.importTheme || undefined);
    return;
  }

  if (options.generateTheme) {
    try {
      await runThemeGenerator();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("User force closed")
      ) {
        ui.showInfo("👋 Theme generation cancelled");
        return;
      }
      throw error;
    }
    return;
  }

  const config = loadConfig(options.config);
  const outputFormat =
    options.format || (options.output?.endsWith(".html") ? "html" : "ansi");

  const logsDX = LogsDX.getInstance({
    theme: options.theme || config.theme,
    debug: options.debug || config.debug,
    customRules: config.customRules,
    outputFormat,
  });

  if (options.listThemes) {
    if (options.preview) {
      const { showThemeList } = await import("./interactive");
      showThemeList();
    } else if (!options.quiet) {
      ui.showInfo("Available themes:");
      getThemeNames().forEach((theme) => {
        console.log(`  • ${theme}`);
      });
      console.log("\n💡 Use --preview to see themes with sample logs");
      console.log("💡 Use --interactive for guided selection");
    }
    return;
  }

  const processLine = (line: string): string => {
    return logsDX.processLine(line);
  };

  if (input) {
    try {
      const content = fs.readFileSync(input, "utf8");
      const output = logsDX.processLog(content);

      if (options.output) {
        fs.writeFileSync(options.output, output);
        ui.showSuccess(`Output written to ${options.output}`);
      } else if (!options.quiet) {
        console.log(output);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes("ENOENT")) {
        ui.showError(
          `File not found: ${input}`,
          "Check the file path and try again",
        );
      } else {
        ui.showError(`Failed to process file: ${errorMsg}`);
      }
      process.exit(1);
    }
  } else {
    process.stdin.setEncoding("utf8");

    let buffer = "";

    process.stdin.on("data", (data: string) => {
      buffer += data;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      lines.forEach((line) => {
        if (line.trim()) {
          const output = processLine(line);
          if (output && !options.quiet) {
            console.log(output);
          }
        }
      });
    });

    process.stdin.on("end", () => {
      if (buffer.trim()) {
        const output = processLine(buffer);
        if (output && !options.quiet) {
          console.log(output);
        }
      }
    });

    process.stdin.on("error", (error: Error) => {
      ui.showError("Failed to read from stdin", error.message);
      process.exit(1);
    });
  }
}

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

if (require.main === module) {
  program.parse();
}
