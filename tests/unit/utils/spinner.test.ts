import { expect, test, describe, beforeEach, afterEach, mock } from "bun:test";
import spinner from "../../../src/utils/spinner";

describe("spinner", () => {
  let stdoutWrite: typeof process.stdout.write;
  let mockWrites: string[] = [];

  beforeEach(() => {
    mockWrites = [];
    stdoutWrite = process.stdout.write;
    process.stdout.write = mock((chunk: string) => {
      mockWrites.push(chunk);
      return true;
    }) as any;
  });

  afterEach(() => {
    process.stdout.write = stdoutWrite;
  });

  test("should create spinner instance", () => {
    const s = spinner("Loading...");

    expect(s).toBeDefined();
    expect(typeof s.start).toBe("function");
    expect(typeof s.succeed).toBe("function");
    expect(typeof s.fail).toBe("function");
    expect(typeof s.stop).toBe("function");
    expect(s.text).toBe("Loading...");
  });

  test("should update text property", () => {
    const s = spinner("Initial");
    s.text = "Updated";
    expect(s.text).toBe("Updated");
  });

  test("start should return self for chaining", () => {
    const s = spinner("Test");
    expect(s.start()).toBe(s);
    s.stop();
  });

  test("stop should return self for chaining", () => {
    const s = spinner("Test");
    s.start();
    expect(s.stop()).toBe(s);
  });

  test("succeed should stop spinner and show success", () => {
    const s = spinner("Loading...");
    s.start();
    s.succeed("Done!");

    const output = mockWrites.join("");
    expect(output).toContain("✔");
    expect(output).toContain("Done!");
  });

  test("succeed without text should use current text", () => {
    const s = spinner("Loading...");
    s.start();
    s.succeed();

    const output = mockWrites.join("");
    expect(output).toContain("✔");
    expect(output).toContain("Loading...");
  });

  test("fail should stop spinner and show error", () => {
    const s = spinner("Loading...");
    s.start();
    s.fail("Failed!");

    const output = mockWrites.join("");
    expect(output).toContain("✖");
    expect(output).toContain("Failed!");
  });

  test("fail without text should use current text", () => {
    const s = spinner("Loading...");
    s.start();
    s.fail();

    const output = mockWrites.join("");
    expect(output).toContain("✖");
    expect(output).toContain("Loading...");
  });

  test("stop should clear line and show cursor", () => {
    const s = spinner("Test");
    s.start();
    mockWrites = [];
    s.stop();

    const output = mockWrites.join("");
    expect(output).toContain("\x1B[K"); // Clear line
    expect(output).toContain("\x1B[?25h"); // Show cursor
  });

  test("start should hide cursor and write frames", async () => {
    const s = spinner("Test");
    s.start();

    await new Promise((r) => setTimeout(r, 100));
    s.stop();

    const output = mockWrites.join("");
    expect(output).toContain("\x1B[?25l"); // Hide cursor
    expect(output).toContain("Test");
  });

  test("should not start twice", () => {
    const s = spinner("Test");
    s.start();
    const firstWriteCount = mockWrites.length;
    s.start();
    expect(mockWrites.length).toBe(firstWriteCount);
    s.stop();
  });
});
