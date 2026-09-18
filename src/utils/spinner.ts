import type { Spinner } from "./types";
import { SPINNER_FRAMES } from "./constants";

interface SpinnerState {
  text: string;
  frameIndex: number;
  interval: ReturnType<typeof setInterval> | null;
  isSpinning: boolean;
}

function stopSpinner(state: SpinnerState, instance: Spinner): Spinner {
  const interval = state.interval;
  if (interval) {
    clearInterval(interval);
    state.interval = null;
  }

  if (!state.isSpinning) return instance;

  process.stdout.write("\r\x1B[K");
  process.stdout.write("\x1B[?25h");
  state.isSpinning = false;
  return instance;
}

function startSpinner(state: SpinnerState, instance: Spinner): Spinner {
  if (state.isSpinning) return instance;

  state.isSpinning = true;
  process.stdout.write("\x1B[?25l");

  state.interval = setInterval(() => {
    const frame = SPINNER_FRAMES[state.frameIndex];
    state.frameIndex = (state.frameIndex + 1) % SPINNER_FRAMES.length;
    process.stdout.write(`\r\x1B[36m${frame}\x1B[0m ${state.text}`);
  }, 80);

  return instance;
}

interface FinishSpinnerOptions {
  text?: string;
  symbol: string;
  color: string;
}

function finishSpinner(
  state: SpinnerState,
  instance: Spinner,
  options: FinishSpinnerOptions,
): Spinner {
  stopSpinner(state, instance);
  const message = options.text || state.text;
  process.stdout.write(
    `\r\x1B[${options.color}m${options.symbol}\x1B[0m ${message}\n`,
  );
  return instance;
}

export function spinner(initialText: string): Spinner {
  const state: SpinnerState = {
    text: initialText,
    frameIndex: 0,
    interval: null,
    isSpinning: false,
  };

  const instance: Spinner = {
    get text() {
      return state.text;
    },
    set text(value: string) {
      state.text = value;
    },

    start: () => startSpinner(state, instance),

    succeed: (text?: string) =>
      finishSpinner(state, instance, { text, symbol: "✔", color: "32" }),

    fail: (text?: string) =>
      finishSpinner(state, instance, { text, symbol: "✖", color: "31" }),

    stop: () => stopSpinner(state, instance),
  };

  return instance;
}

export default spinner;
