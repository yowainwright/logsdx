import { supportsColors } from "./constants";

describe("Color Support Detection", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalStdout: boolean | undefined;

  beforeEach(() => {
    originalEnv = { ...process.env };
    originalStdout = process.stdout.isTTY;
  });

  afterEach(() => {
    process.env = originalEnv;
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY =
      originalStdout;
  });

  test("returns false when NO_COLOR is set", () => {
    process.env.NO_COLOR = "1";
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = true;
    process.env.TERM = "xterm-256color";

    expect(supportsColors()).toBe(false);
  });

  test("returns true when FORCE_COLOR is set", () => {
    process.env.FORCE_COLOR = "1";
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = false;
    delete process.env.TERM;

    expect(supportsColors()).toBe(true);
  });

  test("returns false when not in TTY", () => {
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = false;

    expect(supportsColors()).toBe(false);
  });

  test("returns false when TERM is not set", () => {
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = true;
    delete process.env.TERM;

    expect(supportsColors()).toBe(false);
  });

  test("returns false for dumb terminal", () => {
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = true;
    process.env.TERM = "dumb";

    expect(supportsColors()).toBe(false);
  });

  test("returns true for color-supporting terminals", () => {
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = true;

    const colorTerms = ["xterm-256color", "screen", "tmux", "xterm"];

    for (const term of colorTerms) {
      process.env.TERM = term;
      expect(supportsColors()).toBe(true);
    }
  });

  test("returns true when COLORTERM is set", () => {
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = true;
    process.env.TERM = "unknown";
    process.env.COLORTERM = "truecolor";

    expect(supportsColors()).toBe(true);
  });
});
