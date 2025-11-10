import { describe, expect, test } from "bun:test";
import gradient, { gradient as namedGradient } from "../../../src/utils/gradient";

describe("gradient", () => {
  test("creates a gradient function", () => {
    const grad = gradient(["#FF0000", "#00FF00"]);
    expect(typeof grad).toBe("function");
  });

  test("applies cyan color to text", () => {
    const grad = gradient(["#FF0000", "#00FF00"]);
    const result = grad("test text");
    expect(result).toContain("\x1B[36m");
    expect(result).toContain("test text");
    expect(result).toContain("\x1B[0m");
  });

  test("gradient function has multiline method", () => {
    const grad = gradient(["#FF0000"]);
    expect(typeof grad.multiline).toBe("function");
  });

  test("multiline applies gradient to each line", () => {
    const grad = gradient(["#FF0000"]);
    const result = grad.multiline("line1\nline2\nline3");

    expect(result).toContain("\x1B[36m");
    expect(result).toContain("line1");
    expect(result).toContain("line2");
    expect(result).toContain("line3");
    expect(result).toContain("\x1B[0m");

    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    lines.forEach(line => {
      expect(line).toMatch(/\x1B\[36m.*\x1B\[0m/);
    });
  });

  test("multiline handles empty string", () => {
    const grad = gradient(["#FF0000"]);
    const result = grad.multiline("");
    expect(result).toBe("\x1B[36m\x1B[0m");
  });

  test("multiline handles single line", () => {
    const grad = gradient(["#FF0000"]);
    const result = grad.multiline("single line");
    expect(result).toBe("\x1B[36msingle line\x1B[0m");
  });

  test("works with multiple colors array", () => {
    const grad = gradient(["#FF0000", "#00FF00", "#0000FF"]);
    const result = grad("test");
    expect(result).toContain("test");
  });

  test("works with single color array", () => {
    const grad = gradient(["#FF0000"]);
    const result = grad("test");
    expect(result).toContain("test");
  });

  test("works with empty colors array", () => {
    const grad = gradient([]);
    const result = grad("test");
    expect(result).toContain("test");
  });

  test("named export works same as default", () => {
    const grad1 = gradient(["#FF0000"]);
    const grad2 = namedGradient(["#FF0000"]);

    expect(grad1("test")).toBe(grad2("test"));
    expect(grad1.multiline("test")).toBe(grad2.multiline("test"));
  });

  test("handles special characters in text", () => {
    const grad = gradient(["#FF0000"]);
    const result = grad("test!@#$%^&*()");
    expect(result).toContain("test!@#$%^&*()");
  });

  test("multiline handles consecutive newlines", () => {
    const grad = gradient(["#FF0000"]);
    const result = grad.multiline("line1\n\n\nline2");
    const lines = result.split("\n");
    expect(lines).toHaveLength(4);
    expect(lines[1]).toBe("\x1B[36m\x1B[0m");
  });
});
