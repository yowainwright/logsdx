import { describe, expect, test, spyOn, afterEach } from "bun:test";
import { logger } from "../../../src/utils/logger";

describe("logger", () => {
  afterEach(() => {});

  test("info() logs with blue info icon", () => {
    const spy = spyOn(console, "log");
    logger.info("test message");
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("ℹ"),
      "test message",
    );
    spy.mockRestore();
  });

  test("success() logs with green check icon", () => {
    const spy = spyOn(console, "log");
    logger.success("operation completed");
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("✔"),
      "operation completed",
    );
    spy.mockRestore();
  });

  test("warn() logs with yellow warning icon", () => {
    const spy = spyOn(console, "log");
    logger.warn("warning message");
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("⚠"),
      "warning message",
    );
    spy.mockRestore();
  });

  test("error() logs with red X icon", () => {
    const spy = spyOn(console, "error");
    logger.error("error message");
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("✖"),
      "error message",
    );
    spy.mockRestore();
  });

  test("debug() logs with gray gear icon", () => {
    const spy = spyOn(console, "log");
    logger.debug("debug message");
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("⚙"),
      "debug message",
    );
    spy.mockRestore();
  });

  test("all methods handle empty strings", () => {
    const logSpy = spyOn(console, "log");
    const errorSpy = spyOn(console, "error");

    logger.info("");
    logger.success("");
    logger.warn("");
    logger.error("");
    logger.debug("");

    expect(logSpy).toHaveBeenCalledTimes(4);
    expect(errorSpy).toHaveBeenCalledTimes(1);

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("all methods handle multiline strings", () => {
    const logSpy = spyOn(console, "log");
    const multiline = "line1\nline2\nline3";

    logger.info(multiline);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("ℹ"),
      multiline,
    );

    logSpy.mockRestore();
  });
});
