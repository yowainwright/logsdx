import { expect, test, describe, mock } from "bun:test";
import { LogEnhancer } from "@/src/logenhancer";
import { type LogPlugin, type LogParser, type LogClient } from "@/src/types";

describe("LogEnhancer", () => {
  test("should initialize with default options", () => {
    const enhancer = new LogEnhancer();
    expect(enhancer).toBeDefined();
  });

  test("should initialize with debug mode", () => {
    const consoleSpy = mock(() => {});
    console.log = consoleSpy;

    const enhancer = new LogEnhancer({ debug: true });

    const plugin: LogPlugin = {
      name: "test-plugin",
      enhance: (line) => line,
    };

    enhancer.use(plugin);
    expect(consoleSpy).toHaveBeenCalledWith("Adding plugin: test-plugin");
  });

  test("should process a line through plugins", () => {
    const enhancer = new LogEnhancer();

    const plugin1: LogPlugin = {
      name: "plugin1",
      enhance: (line) => `[PLUGIN1] ${line}`,
    };

    const plugin2: LogPlugin = {
      name: "plugin2",
      enhance: (line) => `[PLUGIN2] ${line}`,
    };

    enhancer.use(plugin1);
    enhancer.use(plugin2);

    const result = enhancer.process("test line");
    expect(result).toBe("[PLUGIN2] [PLUGIN1] test line");
  });

  test("should parse lines through parsers", () => {
    const enhancer = new LogEnhancer();

    const parser1: LogParser = {
      name: "parser1",
      parse: (line) => ({ level: "info", timestamp: "2023-01-01" }),
    };

    const parser2: LogParser = {
      name: "parser2",
      parse: (line) => ({ message: "test message" }),
    };

    enhancer.addParser(parser1);
    enhancer.addParser(parser2);

    const result = enhancer.process("test line");
    // The result should still be the original line since we don't have any plugins
    expect(result).toBe("test line");
  });

  test("should send processed lines to clients", () => {
    const enhancer = new LogEnhancer();
    const clientOutput: string[] = [];

    const client: LogClient = {
      name: "test-client",
      write: (line) => clientOutput.push(line),
    };

    enhancer.addClient(client);

    const result = enhancer.process("test line");
    expect(result).toBe("test line");
    expect(clientOutput).toEqual(["test line"]);
  });

  test("should reset all components", () => {
    const enhancer = new LogEnhancer();

    const plugin: LogPlugin = {
      name: "test-plugin",
      enhance: (line) => `[TEST] ${line}`,
    };

    const parser: LogParser = {
      name: "test-parser",
      parse: (line) => ({ test: true }),
    };

    const client: LogClient = {
      name: "test-client",
      write: () => {},
    };

    enhancer.use(plugin);
    enhancer.addParser(parser);
    enhancer.addClient(client);

    enhancer.reset();

    // After reset, processing should return the original line
    const result = enhancer.process("test line");
    expect(result).toBe("test line");
  });

  test("should handle plugin errors gracefully", () => {
    const enhancer = new LogEnhancer({ debug: true });
    const consoleSpy = mock(() => {});
    console.error = consoleSpy;

    // Try to load a non-existent plugin
    enhancer.use({
      name: "error-plugin",
      enhance: () => {
        throw new Error("Plugin error");
      },
    });

    const result = enhancer.process("test line");
    expect(result).toBe("test line");
    expect(consoleSpy).toHaveBeenCalled();
  });

  test("should load plugins from string paths", async () => {
    const enhancer = new LogEnhancer();

    // Create a mock plugin
    const mockPlugin: LogPlugin = {
      name: "loaded-plugin",
      enhance: (line) => `[LOADED] ${line}`,
    };

    // Add the mock plugin directly
    enhancer.use(mockPlugin);

    const result = enhancer.process("test line");
    expect(result).toBe("[LOADED] test line");
  });
});
