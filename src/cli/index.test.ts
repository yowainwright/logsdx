import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  processArg,
  parseArgs,
  createOutputStream,
  shouldRender,
  handleLine,
} from "./index";
import type { CliOptions, LogLevel, ParsedLine } from "@/src/types";

// Mock the logger to prevent actual logging during tests
const mockLogger = {
  withConfig: () => ({
    debug: () => {},
    error: () => {},
  }),
};

// Mock the styleLine function
const mockStyleLine = (line: string) => line;

// Mock fs.createWriteStream
const mockWriteStream = {
  write: () => {},
  end: () => {},
  on: () => {},
};

// Mock console.log
const originalConsoleLog = console.log;
let consoleLogCalls = 0;
console.log = () => {
  consoleLogCalls++;
};

// Helper function to create a mock parser
const createMockParser = () => {
  return (line: string): ParsedLine => {
    if (line.includes("ERROR")) return { level: "error" as LogLevel };
    if (line.includes("WARN")) return { level: "warn" as LogLevel };
    if (line.includes("INFO")) return { level: "info" as LogLevel };
    return { level: undefined };
  };
};

// Reset mocks before each test
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
  test("should parse all arguments correctly", () => {
    resetMocks();
    const args = [
      "input.log",
      "--quiet",
      "--debug",
      "--output",
      "output.log",
      "--level=warn",
    ];

    const options = parseArgs(args);

    expect(options.inputFile).toBe("input.log");
    expect(options.flags.has("quiet")).toBe(true);
    expect(options.isDebug).toBe(true);
    expect(options.outputFile).toBe("output.log");
    expect(options.minLevel).toBe("warn");
  });
});

describe("shouldRender", () => {
  test("should return true when minLevel is undefined", () => {
    resetMocks();
    expect(shouldRender("info", undefined)).toBe(true);
  });

  test("should return true when level is undefined", () => {
    resetMocks();
    expect(shouldRender(undefined, "info")).toBe(true);
  });

  test("should return true when level priority is greater than or equal to minLevel", () => {
    resetMocks();
    expect(shouldRender("error", "warn")).toBe(true);
    expect(shouldRender("warn", "warn")).toBe(true);
  });

  test("should return false when level priority is less than minLevel", () => {
    resetMocks();
    expect(shouldRender("info", "warn")).toBe(false);
  });
});

describe("handleLine", () => {
  test("should process line and output to console when not quiet", () => {
    resetMocks();
    const mockParser = createMockParser();
    const options: CliOptions = {
      flags: new Set<string>(),
      inputFile: "",
      outputFile: "",
      minLevel: undefined,
      isDebug: false,
    };

    handleLine(mockParser, "This is an ERROR message", options, process.stdout);

    expect(consoleLogCalls).toBe(1);
  });

  test("should not output to console when quiet flag is set", () => {
    resetMocks();
    const mockParser = createMockParser();
    const options: CliOptions = {
      flags: new Set<string>(["quiet"]),
      inputFile: "",
      outputFile: "",
      minLevel: undefined,
      isDebug: false,
    };

    handleLine(mockParser, "This is an ERROR message", options, process.stdout);

    expect(consoleLogCalls).toBe(0);
  });

  test("should not output when level is below minLevel", () => {
    resetMocks();
    const mockParser = createMockParser();
    const options: CliOptions = {
      flags: new Set<string>(),
      inputFile: "",
      outputFile: "",
      minLevel: "error" as LogLevel,
      isDebug: false,
    };

    handleLine(mockParser, "This is an INFO message", options, process.stdout);

    expect(consoleLogCalls).toBe(0);
  });
});

// Clean up after tests
afterAll(() => {
  console.log = originalConsoleLog;
});
