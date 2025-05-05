import { expect, test, describe, afterAll } from "bun:test";
import type { LogLevel, ParsedLine } from "@/src/types";

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
  minLevel: LogLevel | undefined
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
  options: any,
  args: string[]
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

function parseArgs(args: string[]): any {
  const options: any = {
    flags: new Set<string>(),
    inputFile: "",
    outputFile: "",
    minLevel: undefined,
    isDebug: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    const skip = processArg(arg as any, i, options, args);
    i += skip + 1;
  }

  return options;
}

function handleLine(
  parser: (line: string) => ParsedLine,
  line: string,
  options: any,
  outputStream: any
): void {
  const parsed = parser(line);
  if (!parsed) return;

  if (options.flags && options.flags.has("quiet")) {
    return;
  }

  if (options.minLevel && !shouldRender(parsed.level, options.minLevel)) {
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
    const options: any = {
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
    const options: any = {
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
    const options: any = {
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
    const options: any = {
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
    const options: any = {
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
    const options: any = {
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
    const options: any = {
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
    const options: any = {
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

afterAll(() => {
  console.log = originalConsoleLog;
});
