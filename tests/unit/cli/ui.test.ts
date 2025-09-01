import { expect, test, describe, beforeEach } from "bun:test";
import { CliUI } from "../../../src/cli/ui";

describe("CliUI", () => {
  let ui: CliUI;

  beforeEach(() => {
    ui = new CliUI();
  });

  describe("createSpinner", () => {
    test("should create spinner when not disabled", () => {
      const spinner = ui.createSpinner("Loading...", false);

      expect(spinner).toBeDefined();
      expect(typeof spinner.start).toBe("function");
      expect(typeof spinner.succeed).toBe("function");
      expect(typeof spinner.fail).toBe("function");
      expect(typeof spinner.stop).toBe("function");
    });

    test("should create mock spinner when disabled", () => {
      const spinner = ui.createSpinner("Loading...", true);

      expect(spinner).toBeDefined();
      expect(typeof spinner.start).toBe("function");
      expect(typeof spinner.succeed).toBe("function");
      expect(typeof spinner.fail).toBe("function");
      expect(typeof spinner.stop).toBe("function");
      expect(spinner.text).toBe("Loading...");
    });

    test("mock spinner methods should return self", () => {
      const spinner = ui.createSpinner("Test", true);

      expect(spinner.start()).toBe(spinner);
      expect(spinner.succeed()).toBe(spinner);
      expect(spinner.fail()).toBe(spinner);
      expect(spinner.stop()).toBe(spinner);
    });
  });

  describe("createProgressBar", () => {
    test("should create progress bar when not disabled", () => {
      const progressBar = ui.createProgressBar(100, false);

      expect(progressBar).toBeDefined();
      expect(typeof progressBar.start).toBe("function");
      expect(typeof progressBar.update).toBe("function");
      expect(typeof progressBar.stop).toBe("function");
    });

    test("should create mock progress bar when disabled", () => {
      const progressBar = ui.createProgressBar(100, true);

      expect(progressBar).toBeDefined();
      expect(typeof progressBar.start).toBe("function");
      expect(typeof progressBar.update).toBe("function");
      expect(typeof progressBar.stop).toBe("function");
    });

    test("mock progress bar methods should not throw", () => {
      const progressBar = ui.createProgressBar(100, true);

      expect(() => progressBar.start(100, 0)).not.toThrow();
      expect(() => progressBar.update(50)).not.toThrow();
      expect(() => progressBar.stop()).not.toThrow();
    });
  });

  describe("showSuccess", () => {
    test("should not throw when called", () => {
      expect(() => ui.showSuccess("Operation completed")).not.toThrow();
    });
  });

  describe("showError", () => {
    test("should not throw when called without suggestion", () => {
      expect(() => ui.showError("Something went wrong")).not.toThrow();
    });

    test("should not throw when called with suggestion", () => {
      expect(() =>
        ui.showError("Something went wrong", "Try again"),
      ).not.toThrow();
    });
  });

  describe("showWarning", () => {
    test("should not throw when called", () => {
      expect(() => ui.showWarning("This is a warning")).not.toThrow();
    });
  });

  describe("showInfo", () => {
    test("should not throw when called", () => {
      expect(() => ui.showInfo("Information message")).not.toThrow();
    });
  });

  describe("showThemePreview", () => {
    test("should not throw when called", () => {
      expect(() =>
        ui.showThemePreview("test-theme", "Sample log output"),
      ).not.toThrow();
    });
  });

  describe("showFileStats", () => {
    test("should not throw when called", () => {
      expect(() => ui.showFileStats("test.log", 1000, 5242880)).not.toThrow();
    });

    test("should handle different file sizes", () => {
      expect(() => ui.showFileStats("small.log", 10, 512)).not.toThrow();
      expect(() => ui.showFileStats("medium.log", 5000, 1048576)).not.toThrow();
      expect(() =>
        ui.showFileStats("large.log", 100000, 1073741824),
      ).not.toThrow();
    });
  });

  describe("showHeader", () => {
    test("should not throw when called", () => {
      expect(() => ui.showHeader()).not.toThrow();
    });
  });

  describe("cleanup", () => {
    test("should not throw when called", () => {
      expect(() => ui.cleanup()).not.toThrow();
    });

    test("should handle cleanup with active spinner", () => {
      const spinner = ui.createSpinner("Test", false);
      spinner.start();

      expect(() => ui.cleanup()).not.toThrow();
    });

    test("should handle cleanup with active progress bar", () => {
      const progressBar = ui.createProgressBar(100, false);
      progressBar.start(100, 0);

      expect(() => ui.cleanup()).not.toThrow();
    });
  });

  describe("formatFileSize", () => {
    test("should format bytes correctly", () => {
      const ui = new CliUI();

      expect(() => ui.showFileStats("test.log", 100, 500)).not.toThrow();
      expect(() => ui.showFileStats("test.log", 100, 1500)).not.toThrow();
      expect(() => ui.showFileStats("test.log", 100, 1500000)).not.toThrow();
      expect(() => ui.showFileStats("test.log", 100, 1500000000)).not.toThrow();
    });
  });
});
