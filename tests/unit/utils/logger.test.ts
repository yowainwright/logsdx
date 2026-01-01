import { describe, expect, test, spyOn, afterEach, beforeEach } from "bun:test";
import { logger, setLogLevel, getLogLevel } from "../../../src/utils/logger";
import type { LogLevel } from "../../../src/utils/logger";

describe("logger", () => {
  let originalLevel: LogLevel;

  beforeEach(() => {
    originalLevel = getLogLevel();
  });

  afterEach(() => {
    setLogLevel(originalLevel);
  });

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

  test("debug() logs with gray gear icon when log level is debug", () => {
    setLogLevel("debug");
    const spy = spyOn(console, "log");
    logger.debug("debug message");
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("⚙"),
      "debug message",
    );
    spy.mockRestore();
  });

  test("debug() does not log when log level is info", () => {
    setLogLevel("info");
    const spy = spyOn(console, "log");
    logger.debug("debug message");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test("all methods handle empty strings at debug level", () => {
    setLogLevel("debug");
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

  test("setLogLevel and getLogLevel work correctly", () => {
    setLogLevel("error");
    expect(getLogLevel()).toBe("error");

    setLogLevel("debug");
    expect(getLogLevel()).toBe("debug");
  });

  test("silent level suppresses all output", () => {
    setLogLevel("silent");
    const logSpy = spyOn(console, "log");
    const errorSpy = spyOn(console, "error");

    logger.info("info");
    logger.success("success");
    logger.warn("warn");
    logger.error("error");
    logger.debug("debug");

    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("error level only shows errors", () => {
    setLogLevel("error");
    const logSpy = spyOn(console, "log");
    const errorSpy = spyOn(console, "error");

    logger.info("info");
    logger.warn("warn");
    logger.error("error");

    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("warn level shows warn and error", () => {
    setLogLevel("warn");
    const logSpy = spyOn(console, "log");
    const errorSpy = spyOn(console, "error");

    logger.info("info");
    logger.warn("warn");
    logger.error("error");

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
