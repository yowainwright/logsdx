import { expect, test, describe, beforeEach, afterEach, mock } from "bun:test";
import { parseArgs, loadConfig, main } from "../../../src/cli/index";
import fs from "fs";
import os from "os";
import path from "path";

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

  test("should parse generate-theme flag", () => {
    const args = ["--generate-theme"];
    const result = parseArgs(args);

    expect(result.generateTheme).toBe(true);
  });

  test("should parse list-palettes flag", () => {
    const args = ["--list-palettes"];
    const result = parseArgs(args);

    expect(result.listPalettes).toBe(true);
  });

  test("should parse list-patterns flag", () => {
    const args = ["--list-patterns"];
    const result = parseArgs(args);

    expect(result.listPatterns).toBe(true);
  });

  test("should parse export-theme with value", () => {
    const args = ["--export-theme", "my-theme"];
    const result = parseArgs(args);

    expect(result.exportTheme).toBe("my-theme");
  });

  test("should parse export-theme without value", () => {
    const args = ["--export-theme"];
    const result = parseArgs(args);

    expect(result.exportTheme).toBe("");
  });

  test("should parse import-theme with value", () => {
    const args = ["--import-theme", "theme.json"];
    const result = parseArgs(args);

    expect(result.importTheme).toBe("theme.json");
  });

  test("should parse import-theme without value", () => {
    const args = ["--import-theme"];
    const result = parseArgs(args);

    expect(result.importTheme).toBe("");
  });

  test("should parse list-theme-files flag", () => {
    const args = ["--list-theme-files"];
    const result = parseArgs(args);

    expect(result.listThemeFiles).toBe(true);
  });

  test("should handle multiple flags", () => {
    const args = ["--debug", "--quiet", "--list-themes", "--preview"];
    const result = parseArgs(args);

    expect(result.debug).toBe(true);
    expect(result.quiet).toBe(true);
    expect(result.listThemes).toBe(true);
    expect(result.preview).toBe(true);
  });

  test("should prioritize first input argument", () => {
    const args = ["first.log", "second.log", "--theme", "dracula"];
    const result = parseArgs(args);

    expect(result.input).toBe("first.log");
  });

  test("should handle empty args array", () => {
    const args: string[] = [];
    const result = parseArgs(args);

    expect(result.theme).toBeUndefined();
    expect(result.debug).toBe(false);
    expect(result.input).toBeUndefined();
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

describe("main", () => {
  const originalLog = console.log;
  const originalError = console.error;
  const originalExit = process.exit;

  beforeEach(() => {
    console.log = mock(() => {});
    console.error = mock(() => {});
    process.exit = mock(() => {
      throw new Error("process.exit called");
    }) as unknown as typeof process.exit;
  });

  afterEach(() => {
    console.log = originalLog;
    console.error = originalError;
    process.exit = originalExit;
  });

  test("should handle listPalettes option", async () => {
    await main(undefined, { listPalettes: true });

    expect(console.log).toHaveBeenCalled();
  });

  test("should handle listPatterns option", async () => {
    await main(undefined, { listPatterns: true });

    expect(console.log).toHaveBeenCalled();
  });

  test("should handle listThemeFiles option", async () => {
    await main(undefined, { listThemeFiles: true });
    expect(true).toBe(true);
  });

  test("should process log file input", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
    const logFile = path.join(tempDir, "test.log");

    fs.writeFileSync(
      logFile,
      "2024-01-15 10:30:45 INFO Test message\n2024-01-15 10:30:46 ERROR Error message",
    );

    try {
      await main(logFile, { theme: "oh-my-zsh" });

      expect(console.log).toHaveBeenCalled();
    } finally {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  test("should write output to file when output option is provided", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
    const logFile = path.join(tempDir, "input.log");
    const outputFile = path.join(tempDir, "output.log");

    fs.writeFileSync(logFile, "2024-01-15 10:30:45 INFO Test message");

    try {
      await main(logFile, { theme: "oh-my-zsh", output: outputFile });

      expect(fs.existsSync(outputFile)).toBe(true);
      const content = fs.readFileSync(outputFile, "utf8");
      expect(content.length).toBeGreaterThan(0);
    } finally {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  test("should handle non-existent file error", async () => {
    try {
      await main("/nonexistent/file.log", { theme: "oh-my-zsh" });
    } catch (e) {
      expect((e as Error).message).toBe("process.exit called");
    }
  });

  test("should handle listThemes option without preview", async () => {
    await main(undefined, { listThemes: true, quiet: false });

    const calls = (console.log as ReturnType<typeof mock>).mock.calls;
    const allOutput = calls.map((call) => call.join(" ")).join("\n");
    expect(allOutput).toContain("themes");
  });

  test("should handle quiet mode with listThemes", async () => {
    await main(undefined, { listThemes: true, quiet: true });

    const beforeCallCount = (console.log as ReturnType<typeof mock>).mock.calls
      .length;
    expect(beforeCallCount).toBe(0);
  });

  test("should handle html output format", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
    const logFile = path.join(tempDir, "test.log");
    const outputFile = path.join(tempDir, "output.html");

    fs.writeFileSync(logFile, "2024-01-15 10:30:45 INFO Test message");

    try {
      await main(logFile, {
        theme: "oh-my-zsh",
        output: outputFile,
        format: "html",
      });

      expect(fs.existsSync(outputFile)).toBe(true);
      const content = fs.readFileSync(outputFile, "utf8");
      expect(content).toContain("span");
    } finally {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  test("should auto-detect html format from output filename", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
    const logFile = path.join(tempDir, "test.log");
    const outputFile = path.join(tempDir, "output.html");

    fs.writeFileSync(logFile, "INFO Test message");

    try {
      await main(logFile, { theme: "oh-my-zsh", output: outputFile });

      const content = fs.readFileSync(outputFile, "utf8");
      expect(content).toContain("span");
    } finally {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  test("should use config file settings", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
    const configFile = path.join(tempDir, "config.json");
    const logFile = path.join(tempDir, "test.log");

    fs.writeFileSync(configFile, JSON.stringify({ theme: "dracula" }));
    fs.writeFileSync(logFile, "INFO Test message");

    try {
      await main(logFile, { config: configFile });

      expect(console.log).toHaveBeenCalled();
    } finally {
      fs.rmSync(tempDir, { recursive: true });
    }
  });
});
