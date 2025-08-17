import { expect, test, describe, afterAll } from "bun:test";
import { parseArgs, loadConfig } from "./index";
import { cliOptionsSchema, commanderOptionsSchema } from "./types";
import type { LogLevel, ParsedLine } from "../types";
import { Writable } from "stream";
import fs from "fs";
import os from "os";
import path from "path";

interface CliOptions {
  flags: Set<string>;
  inputFile: string;
  outputFile: string;
  minLevel: string | undefined;
  isDebug: boolean;
}
const originalConsoleLog = console.log;
let consoleLogCalls = 0;
console.log = () => {
  consoleLogCalls++;
};

const createMockParser = () => {
  return (line: string): ParsedLine => {
    if (line.includes("ERROR")) return { level: "error" as LogLevel };
    if (line.includes("WARN")) return { level: "warn" as LogLevel };
    if (line.includes("INFO")) return { level: "info" as LogLevel };
    return { level: undefined };
  };
};

function shouldRender(
  level: string | undefined,
  minLevel: LogLevel | undefined,
): boolean {
  if (!minLevel || !level) return true;

  const levelPriorities: Record<string, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    success: 1,
    trace: 0,
  };

  const current = levelPriorities[level] ?? 0;
  const min = levelPriorities[minLevel] ?? 0;
  return current >= min;
}

function processArg(
  arg: string,
  index: number,
  options: CliOptions,
  args: string[],
): number {
  if (arg === "--quiet") {
    options.flags = options.flags || new Set<string>();
    options.flags.add("quiet");
    return 0;
  }

  if (arg === "--debug") {
    options.isDebug = true;
    return 0;
  }

  if (arg === "--output") {
    if (index + 1 < args.length) {
      options.outputFile = args[index + 1];
      return 1;
    }
    return 0;
  }

  if (arg.startsWith("--level=")) {
    const parts = arg.split("=");
    if (parts.length > 1) {
      options.minLevel = parts[1] as string;
    }
    return 0;
  }

  options.inputFile = arg;
  return 0;
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    flags: new Set<string>(),
    inputFile: "",
    outputFile: "",
    minLevel: undefined,
    isDebug: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    const skip = processArg(arg, i, options, args);
    i += skip + 1;
  }

  return options;
}

function handleLine(
  parser: (line: string) => ParsedLine,
  line: string,
  options: CliOptions,
  outputStream: NodeJS.WriteStream | Writable,
): void {
  const parsed = parser(line);
  if (!parsed) return;

  if (options.flags && options.flags.has("quiet")) {
    return;
  }

  if (
    options.minLevel &&
    !shouldRender(parsed.level as LogLevel, options.minLevel as LogLevel)
  ) {
    return;
  }

  const formattedLine = line;

  if (outputStream === process.stdout) {
    console.log(formattedLine);
  } else {
    outputStream.write(formattedLine + "\n");
  }
}

const resetMocks = () => {
  consoleLogCalls = 0;
};

describe("processArg", () => {
  test("should add quiet flag to options", () => {
    resetMocks();
    const options: CliOptions = {
      flags: new Set<string>(),
      inputFile: "",
      outputFile: "",
      minLevel: undefined,
      isDebug: false,
    };

    processArg("--quiet", 0, options, ["--quiet"]);

    expect(options.flags.has("quiet")).toBe(true);
  });

  test("should set isDebug to true", () => {
    resetMocks();
    const options: CliOptions = {
      flags: new Set<string>(),
      inputFile: "",
      outputFile: "",
      minLevel: undefined,
      isDebug: false,
    };

    processArg("--debug", 0, options, ["--debug"]);

    expect(options.isDebug).toBe(true);
  });

  test("should set outputFile", () => {
    resetMocks();
    const options: CliOptions = {
      flags: new Set<string>(),
      inputFile: "",
      outputFile: "",
      minLevel: undefined,
      isDebug: false,
    };

    const result = processArg("--output", 0, options, ["--output", "test.log"]);

    expect(options.outputFile).toBe("test.log");
    expect(result).toBe(1);
  });

  test("should set minLevel", () => {
    resetMocks();
    const options: CliOptions = {
      flags: new Set<string>(),
      inputFile: "",
      outputFile: "",
      minLevel: undefined,
      isDebug: false,
    };

    processArg("--level=warn", 0, options, ["--level=warn"]);

    expect(options.minLevel).toBe("warn");
  });

  test("should set inputFile", () => {
    resetMocks();
    const options: CliOptions = {
      flags: new Set<string>(),
      inputFile: "",
      outputFile: "",
      minLevel: undefined,
      isDebug: false,
    };

    processArg("input.log", 0, options, ["input.log"]);

    expect(options.inputFile).toBe("input.log");
  });
});

describe("parseArgs", () => {
  test("should parse basic theme argument", () => {
    const args = ["--theme", "dracula"];
    const result = parseArgs(args);

    expect(result.theme).toBe("dracula");
    expect(result.debug).toBe(false);
    expect(result.quiet).toBe(false);
  });

  test("should parse debug flag", () => {
    const args = ["--debug"];
    const result = parseArgs(args);

    expect(result.debug).toBe(true);
  });

  test("should parse quiet flag", () => {
    const args = ["--quiet"];
    const result = parseArgs(args);

    expect(result.quiet).toBe(true);
  });

  test("should parse list-themes flag", () => {
    const args = ["--list-themes"];
    const result = parseArgs(args);

    expect(result.listThemes).toBe(true);
  });

  test("should parse interactive flag", () => {
    const args = ["--interactive"];
    const result = parseArgs(args);

    expect(result.interactive).toBe(true);
  });

  test("should parse interactive short flag", () => {
    const args = ["-i"];
    const result = parseArgs(args);

    expect(result.interactive).toBe(true);
  });

  test("should parse preview flag", () => {
    const args = ["--preview"];
    const result = parseArgs(args);

    expect(result.preview).toBe(true);
  });

  test("should parse preview short flag", () => {
    const args = ["-p"];
    const result = parseArgs(args);

    expect(result.preview).toBe(true);
  });

  test("should parse no-spinner flag", () => {
    const args = ["--no-spinner"];
    const result = parseArgs(args);

    expect(result.noSpinner).toBe(true);
  });

  test("should parse output argument", () => {
    const args = ["--output", "result.log"];
    const result = parseArgs(args);

    expect(result.output).toBe("result.log");
  });

  test("should parse config argument", () => {
    const args = ["--config", "my-config.json"];
    const result = parseArgs(args);

    expect(result.config).toBe("my-config.json");
  });

  test("should parse format argument with ansi", () => {
    const args = ["--format", "ansi"];
    const result = parseArgs(args);

    expect(result.format).toBe("ansi");
  });

  test("should parse format argument with html", () => {
    const args = ["--format", "html"];
    const result = parseArgs(args);

    expect(result.format).toBe("html");
  });

  test("should ignore invalid format argument", () => {
    const args = ["--format", "invalid"];
    const result = parseArgs(args);

    expect(result.format).toBeUndefined();
  });

  test("should parse input file", () => {
    const args = ["input.log"];
    const result = parseArgs(args);

    expect(result.input).toBe("input.log");
  });

  test("should parse complex argument combination", () => {
    const args = [
      "input.log",
      "--theme",
      "oh-my-zsh",
      "--debug",
      "--output",
      "styled.log",
      "--format",
      "ansi",
      "--config",
      ".logsdxrc.json",
    ];
    const result = parseArgs(args);

    expect(result.input).toBe("input.log");
    expect(result.theme).toBe("oh-my-zsh");
    expect(result.debug).toBe(true);
    expect(result.output).toBe("styled.log");
    expect(result.format).toBe("ansi");
    expect(result.config).toBe(".logsdxrc.json");
    expect(result.quiet).toBe(false);
    expect(result.interactive).toBe(false);
  });

  test("should handle missing argument values gracefully", () => {
    const args = ["--theme"];
    const result = parseArgs(args);

    expect(result.theme).toBeUndefined();
  });
});

describe("loadConfig", () => {
  test("should return default config when no file exists", () => {
    const config = loadConfig("/nonexistent/config.json");

    expect(config.theme).toBe("oh-my-zsh");
    expect(config.outputFormat).toBe("ansi");
    expect(config.debug).toBe(false);
  });

  test("should load config from specified file", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
    const configFile = path.join(tempDir, "test-config.json");

    const testConfig = {
      theme: "dracula",
      outputFormat: "html" as const,
      debug: true,
      customRules: {
        testRule: { color: "red" },
      },
    };

    fs.writeFileSync(configFile, JSON.stringify(testConfig));

    try {
      const config = loadConfig(configFile);

      expect(config.theme).toBe("dracula");
      expect(config.outputFormat).toBe("html");
      expect(config.debug).toBe(true);
      expect(config.customRules).toEqual({ testRule: { color: "red" } });
    } finally {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  test("should merge config with defaults", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
    const configFile = path.join(tempDir, "partial-config.json");

    const partialConfig = {
      theme: "custom-theme",
    };

    fs.writeFileSync(configFile, JSON.stringify(partialConfig));

    try {
      const config = loadConfig(configFile);

      expect(config.theme).toBe("custom-theme");
      expect(config.outputFormat).toBe("ansi");
      expect(config.debug).toBe(false);
    } finally {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  test("should handle invalid JSON gracefully", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
    const configFile = path.join(tempDir, "invalid-config.json");

    fs.writeFileSync(configFile, "{ invalid json }");

    try {
      const config = loadConfig(configFile);

      expect(config.theme).toBe("oh-my-zsh");
      expect(config.outputFormat).toBe("ansi");
      expect(config.debug).toBe(false);
    } finally {
      fs.rmSync(tempDir, { recursive: true });
    }
  });
});

describe("Zod schema validation", () => {
  test("cliOptionsSchema should validate valid options", () => {
    const validOptions = {
      theme: "dracula",
      debug: true,
      output: "result.log",
      format: "ansi" as const,
    };

    const result = cliOptionsSchema.parse(validOptions);
    expect(result.theme).toBe("dracula");
    expect(result.debug).toBe(true);
    expect(result.output).toBe("result.log");
    expect(result.format).toBe("ansi");
  });

  test("cliOptionsSchema should apply defaults", () => {
    const minimalOptions = {};

    const result = cliOptionsSchema.parse(minimalOptions);
    expect(result.debug).toBe(false);
    expect(result.quiet).toBe(false);
    expect(result.listThemes).toBe(false);
    expect(result.interactive).toBe(false);
    expect(result.preview).toBe(false);
    expect(result.noSpinner).toBe(false);
  });

  test("cliOptionsSchema should reject invalid format", () => {
    const invalidOptions = {
      format: "invalid",
    };

    expect(() => cliOptionsSchema.parse(invalidOptions)).toThrow();
  });

  test("commanderOptionsSchema should validate commander options", () => {
    const commanderOptions = {
      theme: "oh-my-zsh",
      debug: true,
      interactive: false,
      format: "html",
    };

    const result = commanderOptionsSchema.parse(commanderOptions);
    expect(result.theme).toBe("oh-my-zsh");
    expect(result.debug).toBe(true);
    expect(result.interactive).toBe(false);
    expect(result.format).toBe("html");
  });
});
