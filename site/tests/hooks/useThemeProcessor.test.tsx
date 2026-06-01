import { describe, expect, it, beforeEach, mock } from "bun:test";

const getTheme = mock(async (themeName: string) => ({
  name: themeName,
  mode: themeName.includes("light") ? "light" : "dark",
  schema: { defaultStyle: { color: "#fff" } },
}));

const renderLine = mock(
  (
    line: string,
    theme: { name: string },
    options?: { outputFormat?: "ansi" | "html" },
  ) => `${theme.name}:${options?.outputFormat}:${line}`,
);

mock.module("logsdx", () => ({
  getTheme,
  renderLine,
}));

import { renderHook, waitFor } from "../utils/test-utils";
import { useThemeProcessor } from "@/hooks/useThemeProcessor";

describe("useThemeProcessor", () => {
  beforeEach(() => {
    getTheme.mockClear();
    renderLine.mockClear();
  });

  it("restores the cached theme when processing cached logs", async () => {
    const logs = ["INFO cache theme regression"];
    const { result, rerender } = renderHook(
      ({ themeName }) => useThemeProcessor(themeName, logs),
      { initialProps: { themeName: "dracula" } },
    );

    await waitFor(() => {
      expect(result.current.theme?.name).toBe("dracula");
    });
    expect(result.current.processedLogs[0]?.html).toBe(
      "dracula:html:INFO cache theme regression",
    );

    rerender({ themeName: "github-light" });

    await waitFor(() => {
      expect(result.current.theme?.name).toBe("github-light");
    });
    expect(result.current.processedLogs[0]?.html).toBe(
      "github-light:html:INFO cache theme regression",
    );

    rerender({ themeName: "dracula" });

    await waitFor(() => {
      expect(result.current.theme?.name).toBe("dracula");
    });
    expect(result.current.processedLogs[0]?.html).toBe(
      "dracula:html:INFO cache theme regression",
    );
    expect(getTheme).toHaveBeenCalledTimes(2);
  });
});
