import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { EventEmitter } from "events";

class MockReadline extends EventEmitter {
  private responses: string[] = [];
  private responseIndex = 0;

  setResponses(responses: string[]) {
    this.responses = responses;
    this.responseIndex = 0;
  }

  question(prompt: string, callback: (answer: string) => void) {
    const response = this.responses[this.responseIndex++] || "";
    setImmediate(() => callback(response));
  }

  close() {}
}

const mockRl = new MockReadline();

const originalCreateInterface = require("readline").createInterface;

beforeEach(() => {
  require("readline").createInterface = mock(() => mockRl);
});

afterEach(() => {
  require("readline").createInterface = originalCreateInterface;
  mockRl.removeAllListeners();
});

describe("prompts (with mocks)", () => {
  describe("input", () => {
    it("should return user input", async () => {
      mockRl.setResponses(["test value"]);

      const { input } = await import("../../../src/utils/prompts");
      const result = await input({ message: "Enter value" });

      expect(result).toBe("test value");
    });

    it("should return default value when empty", async () => {
      mockRl.setResponses([""]);

      const { input } = await import("../../../src/utils/prompts");
      const result = await input({
        message: "Enter value",
        default: "default",
      });

      expect(result).toBe("default");
    });

    it("should validate input", async () => {
      mockRl.setResponses(["invalid", "valid"]);

      const { input } = await import("../../../src/utils/prompts");
      const validate = (val: string) => val === "valid" || "Must be valid";
      const result = await input({
        message: "Enter value",
        validate,
      });

      expect(result).toBe("valid");
    });
  });

  describe("select", () => {
    it("should return selected choice", async () => {
      mockRl.setResponses(["2"]);

      const originalLog = console.log;
      console.log = mock(() => {});

      const { select } = await import("../../../src/utils/prompts");
      const result = await select({
        message: "Choose",
        choices: ["a", "b", "c"],
      });

      console.log = originalLog;
      expect(result).toBe("b");
    });

    it("should use default when empty input", async () => {
      mockRl.setResponses([""]);

      const originalLog = console.log;
      console.log = mock(() => {});

      const { select } = await import("../../../src/utils/prompts");
      const result = await select({
        message: "Choose",
        choices: ["a", "b", "c"],
        default: "b",
      });

      console.log = originalLog;
      expect(result).toBe("b");
    });
  });

  describe("checkbox", () => {
    it("should return selected values", async () => {
      mockRl.setResponses(["1,3"]);

      const originalLog = console.log;
      console.log = mock(() => {});

      const { checkbox } = await import("../../../src/utils/prompts");
      const result = await checkbox({
        message: "Select",
        choices: [
          { name: "A", value: "a" },
          { name: "B", value: "b" },
          { name: "C", value: "c" },
        ],
      });

      console.log = originalLog;
      expect(result).toEqual(["a", "c"]);
    });
  });

  describe("confirm", () => {
    it("should return true for yes", async () => {
      mockRl.setResponses(["y"]);

      const { confirm } = await import("../../../src/utils/prompts");
      const result = await confirm({ message: "Confirm?" });

      expect(result).toBe(true);
    });

    it("should return false for no", async () => {
      mockRl.setResponses(["n"]);

      const { confirm } = await import("../../../src/utils/prompts");
      const result = await confirm({ message: "Confirm?" });

      expect(result).toBe(false);
    });

    it("should use default when empty", async () => {
      mockRl.setResponses([""]);

      const { confirm } = await import("../../../src/utils/prompts");
      const result = await confirm({
        message: "Confirm?",
        default: true,
      });

      expect(result).toBe(true);
    });
  });
});
