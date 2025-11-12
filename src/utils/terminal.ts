import colors from "./colors";

// ============================================================================
// Logger (from utils/logger.ts)
// ============================================================================

export const logger = {
  info(message: string) {
    console.log(colors.blue("ℹ"), message);
  },

  success(message: string) {
    console.log(colors.green("✔"), message);
  },

  warn(message: string) {
    console.log(colors.yellow("⚠"), message);
  },

  error(message: string) {
    console.error(colors.red("✖"), message);
  },

  debug(message: string) {
    console.log(colors.gray("⚙"), message);
  },
};

// ============================================================================
// Spinner (from utils/spinner.ts)
// ============================================================================

export interface Spinner {
  start(): Spinner;
  succeed(text?: string): Spinner;
  fail(text?: string): Spinner;
  stop(): Spinner;
  text: string;
}

const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

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
        const frame = frames[frameIndex];
        frameIndex = (frameIndex + 1) % frames.length;
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

// ============================================================================
// Progress Bar (from utils/progress.ts)
// ============================================================================

export interface ProgressBar {
  start(total: number, startValue: number): void;
  update(value: number): void;
  stop(): void;
}

export function createProgressBar(total: number): ProgressBar {
  let currentValue = 0;
  let startTime = Date.now();
  let isRunning = false;

  const render = (value: number) => {
    const percentage = Math.floor((value / total) * 100);
    const barLength = 40;
    const filledLength = Math.floor((percentage / 100) * barLength);
    const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);
    const elapsed = Date.now() - startTime;
    const duration = `${Math.floor(elapsed / 1000)}s`;

    process.stdout.write(
      `\r ${bar} | ${percentage}% | ${value}/${total} lines | ${duration}`,
    );
  };

  return {
    start(totalValue: number, startValue: number) {
      total = totalValue;
      currentValue = startValue;
      startTime = Date.now();
      isRunning = true;
      render(currentValue);
    },

    update(value: number) {
      if (!isRunning) return;
      currentValue = value;
      render(currentValue);
    },

    stop() {
      if (!isRunning) return;
      isRunning = false;
      process.stdout.write("\n");
    },
  };
}

export default { logger, spinner, createProgressBar };
