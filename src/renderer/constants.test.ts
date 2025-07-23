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
<<<<<<< HEAD
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY =
      originalStdout;
=======
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = originalStdout;
>>>>>>> main
  });

  test("returns false when NO_COLOR is set", () => {
    process.env.NO_COLOR = "1";
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = true;
    process.env.TERM = "xterm-256color";
<<<<<<< HEAD

=======
    
>>>>>>> main
    expect(supportsColors()).toBe(false);
  });

  test("returns true when FORCE_COLOR is set", () => {
    process.env.FORCE_COLOR = "1";
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = false;
    delete process.env.TERM;
<<<<<<< HEAD

=======
    
>>>>>>> main
    expect(supportsColors()).toBe(true);
  });

  test("returns false when not in TTY", () => {
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = false;
<<<<<<< HEAD

=======
    
>>>>>>> main
    expect(supportsColors()).toBe(false);
  });

  test("returns false when TERM is not set", () => {
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = true;
    delete process.env.TERM;
<<<<<<< HEAD

=======
    
>>>>>>> main
    expect(supportsColors()).toBe(false);
  });

  test("returns false for dumb terminal", () => {
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = true;
    process.env.TERM = "dumb";
<<<<<<< HEAD

=======
    
>>>>>>> main
    expect(supportsColors()).toBe(false);
  });

  test("returns true for color-supporting terminals", () => {
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = true;
<<<<<<< HEAD

    const colorTerms = ["xterm-256color", "screen", "tmux", "xterm"];

=======
    
    const colorTerms = ["xterm-256color", "screen", "tmux", "xterm"];
    
>>>>>>> main
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
<<<<<<< HEAD

    expect(supportsColors()).toBe(true);
  });
});
=======
    
    expect(supportsColors()).toBe(true);
  });
});
>>>>>>> main
