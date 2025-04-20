import { test, expect, describe } from "bun:test";
import { registerParser, getParser, getRegisteredParsers } from "./registry";
import { type LineParser, type LineParseResult } from "@/src/types";

describe("Parser Registry", () => {
  test("getRegisteredParsers returns default parsers", () => {
    const parsers = getRegisteredParsers();
    expect(parsers).toContain("default");
    expect(parsers).toContain("regex");
    expect(parsers).toContain("json");
  });

  test("registerParser adds a new parser", async () => {
    const customParser: LineParser = (
      line: string,
    ): LineParseResult | undefined => {
      if (line.startsWith("[CUSTOM]")) {
        return {
          level: "info",
          message: line.substring(8).trim(),
        };
      }
      return undefined;
    };

    registerParser("custom", async () => customParser);

    const parsers = getRegisteredParsers();
    expect(parsers).toContain("custom");
  });

  test("getParser returns registered parser", async () => {
    const customParser: LineParser = (
      line: string,
    ): LineParseResult | undefined => {
      if (line.startsWith("[CUSTOM]")) {
        return {
          level: "info",
          message: line.substring(8).trim(),
        };
      }
      return undefined;
    };

    registerParser("custom", async () => customParser);

    const parser = await getParser("custom");
    expect(parser).toBeDefined();

    const result = parser("[CUSTOM] Hello, world!");
    expect(result).toEqual({
      level: "info",
      message: "Hello, world!",
    });
  });

  test("getParser throws error for non-existent parser", async () => {
    await expect(getParser("non-existent")).rejects.toThrow(
      "Parser 'non-existent' not found",
    );
  });

  test("parser with options", async () => {
    const parserWithOptions = async (options?: { prefix?: string }) => {
      const prefix = options?.prefix || "[CUSTOM]";
      return (line: string): LineParseResult | undefined => {
        if (line.startsWith(prefix)) {
          return {
            level: "info",
            message: line.substring(prefix.length).trim(),
          };
        }
        return undefined;
      };
    };

    registerParser("custom-with-options", parserWithOptions);

    const parser = await getParser("custom-with-options", { prefix: "[TEST]" });
    expect(parser).toBeDefined();

    const result = parser("[TEST] Hello, world!");
    expect(result).toEqual({
      level: "info",
      message: "Hello, world!",
    });
  });

  test("default parser is available", async () => {
    const parser = await getParser("default");
    expect(parser).toBeDefined();

    const result = parser("2024-03-14T12:34:56Z [INFO] Hello, world!");
    expect(result).toBeDefined();
    expect(result?.level).toBe("info");
  });

  test("regex parser is available", async () => {
    const parser = await getParser("regex");
    expect(parser).toBeDefined();

    const result = parser("2024-03-14T12:34:56.000Z [INFO] Hello, world!");
    expect(result).toBeDefined();
    expect(result?.timestamp).toBe("2024-03-14T12:34:56.000Z");
    expect(result?.level).toBe("info");
    expect(result?.message).toBe("Hello, world!");
  });

  test("json parser is available", async () => {
    const parser = await getParser("json");
    expect(parser).toBeDefined();

    const result = parser('{"level":"info","message":"Hello, world!"}');
    expect(result).toBeDefined();
    expect(result?.level).toBe("info");
    expect(result?.message).toBe("Hello, world!");
    expect(result?.language).toBe("json");
  });

  test("json parser with custom rules file", async () => {
    const parser = await getParser("json", { rulesFile: "custom-rules.json" });
    expect(parser).toBeDefined();

    const result = parser('{"level":"info","message":"Hello, world!"}');
    expect(result).toBeDefined();
    expect(result?.level).toBe("info");
    expect(result?.message).toBe("Hello, world!");
    expect(result?.language).toBe("json");
  });

  test("multiple parsers can be registered", async () => {
    const parser1: LineParser = (line: string): LineParseResult | undefined => {
      if (line.startsWith("[PARSER1]")) {
        return {
          level: "info",
          message: line.substring(9).trim(),
        };
      }
      return undefined;
    };

    const parser2: LineParser = (line: string): LineParseResult | undefined => {
      if (line.startsWith("[PARSER2]")) {
        return {
          level: "info",
          message: line.substring(9).trim(),
        };
      }
      return undefined;
    };

    registerParser("parser1", async () => parser1);
    registerParser("parser2", async () => parser2);

    const parsers = getRegisteredParsers();
    expect(parsers).toContain("parser1");
    expect(parsers).toContain("parser2");

    const p1 = await getParser("parser1");
    const p2 = await getParser("parser2");

    expect(p1("[PARSER1] Hello from parser 1")).toEqual({
      level: "info",
      message: "Hello from parser 1",
    });

    expect(p2("[PARSER2] Hello from parser 2")).toEqual({
      level: "info",
      message: "Hello from parser 2",
    });
  });
});
