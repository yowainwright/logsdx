import { describe, expect, test, spyOn } from "bun:test";
import { createProgressBar } from "../../../src/utils/progress";

describe("progress", () => {
  describe("createProgressBar()", () => {
    test("creates progress bar instance", () => {
      const bar = createProgressBar(100);
      expect(bar).toBeDefined();
      expect(typeof bar.start).toBe("function");
      expect(typeof bar.update).toBe("function");
      expect(typeof bar.stop).toBe("function");
    });

    test("start() writes to stdout", () => {
      const spy = spyOn(process.stdout, "write");
      const bar = createProgressBar(100);
      bar.start(100, 0);

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    test("update() writes to stdout when running", () => {
      const spy = spyOn(process.stdout, "write");
      const bar = createProgressBar(100);
      bar.start(100, 0);
      spy.mockClear();

      bar.update(50);
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    test("update() does not write when not running", () => {
      const spy = spyOn(process.stdout, "write");
      const bar = createProgressBar(100);

      bar.update(50);
      expect(spy).not.toHaveBeenCalled();

      spy.mockRestore();
    });

    test("stop() writes newline to stdout", () => {
      const spy = spyOn(process.stdout, "write");
      const bar = createProgressBar(100);
      bar.start(100, 0);
      spy.mockClear();

      bar.stop();
      expect(spy).toHaveBeenCalledWith("\n");

      spy.mockRestore();
    });

    test("stop() does nothing when not running", () => {
      const spy = spyOn(process.stdout, "write");
      const bar = createProgressBar(100);

      bar.stop();
      expect(spy).not.toHaveBeenCalled();

      spy.mockRestore();
    });

    test("renders progress at 0%", () => {
      const spy = spyOn(process.stdout, "write");
      const bar = createProgressBar(100);
      bar.start(100, 0);

      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain("0%");
      expect(output).toContain("0/100");

      spy.mockRestore();
    });

    test("renders progress at 50%", () => {
      const spy = spyOn(process.stdout, "write");
      const bar = createProgressBar(100);
      bar.start(100, 0);
      bar.update(50);

      const output = spy.mock.calls[1][0] as string;
      expect(output).toContain("50%");
      expect(output).toContain("50/100");

      spy.mockRestore();
    });

    test("renders progress at 100%", () => {
      const spy = spyOn(process.stdout, "write");
      const bar = createProgressBar(100);
      bar.start(100, 0);
      bar.update(100);

      const output = spy.mock.calls[1][0] as string;
      expect(output).toContain("100%");
      expect(output).toContain("100/100");

      spy.mockRestore();
    });

    test("includes filled bar characters", () => {
      const spy = spyOn(process.stdout, "write");
      const bar = createProgressBar(100);
      bar.start(100, 50);

      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain("█");

      spy.mockRestore();
    });

    test("includes empty bar characters", () => {
      const spy = spyOn(process.stdout, "write");
      const bar = createProgressBar(100);
      bar.start(100, 0);

      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain("░");

      spy.mockRestore();
    });

    test("shows elapsed time", () => {
      const spy = spyOn(process.stdout, "write");
      const bar = createProgressBar(100);
      bar.start(100, 0);

      const output = spy.mock.calls[0][0] as string;
      expect(output).toMatch(/\d+s/);

      spy.mockRestore();
    });

    test("update does nothing after stop", () => {
      const spy = spyOn(process.stdout, "write");
      const bar = createProgressBar(100);
      bar.start(100, 0);
      bar.stop();
      spy.mockClear();

      bar.update(50);
      expect(spy).not.toHaveBeenCalled();

      spy.mockRestore();
    });

    test("can restart after stop", () => {
      const spy = spyOn(process.stdout, "write");
      const bar = createProgressBar(100);
      bar.start(100, 0);
      bar.stop();
      spy.mockClear();

      bar.start(200, 0);
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });
});
