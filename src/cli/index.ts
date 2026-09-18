import fs from "fs";
import path from "path";
import { LogsDX, getThemeNames } from "../index";
import type { CliOptions, CommanderOptions, InteractiveConfig } from "./types";
import type { LogsDXOptions } from "../types";
import { ui } from "./ui";
import {
  runThemeGenerator,
  listColorPalettesCommand,
  listPatternPresetsCommand,
} from "./theme/generator";
import { exportTheme, importTheme, listThemeFiles } from "./theme/generator";
import { createLogger } from "../utils/logger";

const log = createLogger("cli");

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
      if (!location) continue;
      const exists = fs.existsSync(location);
      if (!exists) continue;
      const configContent = fs.readFileSync(location, "utf8");
      const config = JSON.parse(configContent);
      return { ...defaultConfig, ...config };
    }
  } catch (error) {
    log.debug(`Failed to load config: ${error}`);
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
      const isValidFormat = format === "ansi" || format === "html";
      if (isValidFormat) options.format = format;
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
    } else {
      const isInputArgument = !arg?.startsWith("--") && !options.input;
      if (isInputArgument) options.input = arg;
    }
  }

  return options;
}

function getOutputFormat(
  format: CommanderOptions["format"],
): "ansi" | "html" | undefined {
  if (format === "ansi") return "ansi";
  if (format === "html") return "html";
  return undefined;
}

function createCliOptions(
  input: string | undefined,
  rawOptions: CommanderOptions,
): CliOptions {
  return {
    input,
    output: rawOptions.output,
    theme: rawOptions.theme,
    config: rawOptions.config,
    debug: rawOptions.debug ?? false,
    quiet: rawOptions.quiet ?? false,
    listThemes: rawOptions.listThemes ?? false,
    interactive: rawOptions.interactive ?? false,
    preview: rawOptions.preview ?? false,
    noSpinner: rawOptions.noSpinner ?? false,
    generateTheme: rawOptions.generateTheme ?? false,
    listPalettes: rawOptions.listPalettes ?? false,
    listPatterns: rawOptions.listPatterns ?? false,
    exportTheme: rawOptions.exportTheme,
    importTheme: rawOptions.importTheme,
    listThemeFiles: rawOptions.listThemeFiles ?? false,
    format: getOutputFormat(rawOptions.format),
  };
}

function isUserCancellation(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message.includes("User force closed");
}

async function applyInteractiveOptions(options: CliOptions): Promise<boolean> {
  if (!options.interactive) return true;

  try {
    const { runInteractiveMode } = await import("./interactive");
    const interactiveConfig: InteractiveConfig = await runInteractiveMode();
    options.theme = interactiveConfig.theme;
    options.format = interactiveConfig.outputFormat;
    options.preview = interactiveConfig.preview;
    return true;
  } catch (error) {
    if (!isUserCancellation(error)) throw error;
    ui.showInfo("👋 Interactive mode cancelled");
    return false;
  }
}

async function handleThemeCommands(options: CliOptions): Promise<boolean> {
  if (options.listPalettes) {
    listColorPalettesCommand();
    return true;
  }

  if (options.listPatterns) {
    listPatternPresetsCommand();
    return true;
  }

  if (options.listThemeFiles) {
    listThemeFiles();
    return true;
  }

  if (options.exportTheme !== undefined) {
    await exportTheme(options.exportTheme || undefined);
    return true;
  }

  if (options.importTheme !== undefined) {
    await importTheme(options.importTheme || undefined);
    return true;
  }

  if (!options.generateTheme) return false;

  try {
    await runThemeGenerator();
  } catch (error) {
    if (!isUserCancellation(error)) throw error;
    ui.showInfo("👋 Theme generation cancelled");
  }
  return true;
}

async function handleListThemes(options: CliOptions): Promise<boolean> {
  if (!options.listThemes) return false;

  if (options.preview) {
    const { showThemeList } = await import("./interactive");
    await showThemeList();
    return true;
  }

  if (options.quiet) return true;

  ui.showInfo("Available themes:");
  getThemeNames().forEach((theme) => {
    console.log(`  • ${theme}`);
  });
  console.log("\nUse --preview to see themes with sample logs");
  console.log("Use --interactive for guided selection");
  return true;
}

function writeProcessedLine(
  line: string,
  processLine: (value: string) => string,
  quiet: boolean,
): void {
  if (!line.trim()) return;

  const output = processLine(line);
  const hasOutput = Boolean(output);
  const shouldPrint = hasOutput && !quiet;
  if (shouldPrint) console.log(output);
}

function processInputFile(
  input: string,
  options: CliOptions,
  logsDX: LogsDX,
): void {
  try {
    const content = fs.readFileSync(input, "utf8");
    const output = logsDX.processLog(content);

    if (options.output) {
      fs.writeFileSync(options.output, output);
      ui.showSuccess(`Output written to ${options.output}`);
      return;
    }

    if (!options.quiet) console.log(output);
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
}

function processStdin(options: CliOptions, logsDX: LogsDX): void {
  process.stdin.setEncoding("utf8");

  let buffer = "";
  const quiet = options.quiet ?? false;
  const processLine = (line: string): string => logsDX.processLine(line);

  process.stdin.on("data", (data: string) => {
    buffer += data;
    const lines = buffer.split("\n");
    const nextBuffer = lines[lines.length - 1];
    lines.length -= 1;
    buffer = nextBuffer || "";
    lines.forEach((line) => writeProcessedLine(line, processLine, quiet));
  });

  process.stdin.on("end", () => {
    writeProcessedLine(buffer, processLine, quiet);
  });

  process.stdin.on("error", (error: Error) => {
    ui.showError("Failed to read from stdin", error.message);
    process.exit(1);
  });
}

export async function main(
  input: string | undefined,
  rawOptions: CommanderOptions,
): Promise<void> {
  const options = createCliOptions(input, rawOptions);
  const shouldContinue = await applyInteractiveOptions(options);
  if (!shouldContinue) return;

  const handledThemeCommand = await handleThemeCommands(options);
  if (handledThemeCommand) return;

  const config = loadConfig(options.config);
  const outputFormat =
    options.format || (options.output?.endsWith(".html") ? "html" : "ansi");

  const logsDX = await LogsDX.getInstance({
    theme: options.theme || config.theme,
    debug: options.debug || config.debug,
    customRules: config.customRules,
    outputFormat,
  });

  const handledThemeList = await handleListThemes(options);
  if (handledThemeList) return;

  if (input) {
    processInputFile(input, options, logsDX);
    return;
  }

  processStdin(options, logsDX);
}
