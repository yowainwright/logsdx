import type { Spinner } from "./types";
import { SPINNER_FRAMES } from "./constants";

export function spinner(initialText: string): Spinner {
  let text = initialText;
  let frameIndex = 0;
  let interval: ReturnType<typeof setInterval> | null = null;
  let isSpinning = false;

  const instance: Spinner = {
    get text() {
      return text;
    },
    set text(value: string) {
      text = value;
    },

    start() {
      if (isSpinning) return instance;

      isSpinning = true;
      process.stdout.write("\x1B[?25l");

      interval = setInterval(() => {
        const frame = SPINNER_FRAMES[frameIndex];
        frameIndex = (frameIndex + 1) % SPINNER_FRAMES.length;
        process.stdout.write(`\r\x1B[36m${frame}\x1B[0m ${text}`);
      }, 80);

      return instance;
    },

    succeed(successText?: string) {
      instance.stop();
      const message = successText || text;
      process.stdout.write(`\r\x1B[32m✔\x1B[0m ${message}\n`);
      return instance;
    },

    fail(failText?: string) {
      instance.stop();
      const message = failText || text;
      process.stdout.write(`\r\x1B[31m✖\x1B[0m ${message}\n`);
      return instance;
    },

    stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (isSpinning) {
        process.stdout.write("\r\x1B[K");
        process.stdout.write("\x1B[?25h");
        isSpinning = false;
      }
      return instance;
    },
  };

  return instance;
}

export default spinner;
