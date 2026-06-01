import { describe, expect, it } from "bun:test";
import { themeToGhostty } from "@/components/output-comparison/utils";
import type { Theme } from "logsdx";

describe("output-comparison utils", () => {
  it("preserves non-hex custom colors when deriving Ghostty colors", () => {
    const theme = {
      name: "custom-css-colors",
      mode: "light",
      colors: {
        background: "rgb(10, 20, 30)",
        text: "CanvasText",
        error: "red",
      },
    } as Theme;

    const ghosttyTheme = themeToGhostty(theme);

    expect(ghosttyTheme.black).toBe("rgb(10, 20, 30)");
    expect(ghosttyTheme.selectionBackground).toBe("rgb(10, 20, 30)");
    expect(ghosttyTheme.brightRed).toBe("red");
  });
});
