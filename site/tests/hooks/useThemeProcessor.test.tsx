import { describe, expect, it, beforeEach, mock } from "bun:test";

const getTheme = mock(async (themeName: string) => ({
  name: themeName,
  mode: themeName.includes("light") ? "light" : "dark",
  schema: { defaultStyle: { color: "#fff" } },
}));

const styleLine = mock((line: string) => [{ content: line }]);
const tokensToHtml = mock(
  (
    tokens: Array<{ content: string }>,
    options?: { theme?: { name: string } },
  ) =>
    `${options?.theme?.name}:html:${tokens.map((token) => token.content).join("")}`,
);
const tokensToString = mock(
  (tokens: Array<{ content: string }>, _forceColors?: boolean) =>
    `ansi:${tokens.map((token) => token.content).join("")}`,
);

mock.module("logsdx", () => ({
  getTheme,
  styleLine,
  tokensToHtml,
  tokensToString,
}));

import { renderHook, waitFor } from "../utils/test-utils";
import { useThemeProcessor } from "@/hooks/useThemeProcessor";

describe("useThemeProcessor", () => {
  beforeEach(() => {
    getTheme.mockClear();
    styleLine.mockClear();
    tokensToHtml.mockClear();
    tokensToString.mockClear();
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

  it("does not reprocess when log contents are unchanged but array identity changes", async () => {
    const { result, rerender } = renderHook(
      ({ logs }) => useThemeProcessor("unstable-array-theme", logs),
      { initialProps: { logs: ["INFO same content"] } },
    );

    await waitFor(() => {
      expect(result.current.processedLogs[0]?.html).toBe(
        "unstable-array-theme:html:INFO same content",
      );
    });
    expect(getTheme).toHaveBeenCalledTimes(1);
    expect(styleLine).toHaveBeenCalledTimes(1);
    expect(tokensToHtml).toHaveBeenCalledTimes(1);
    expect(tokensToString).toHaveBeenCalledTimes(1);

    rerender({ logs: ["INFO same content"] });

    await waitFor(() => {
      expect(result.current.processedLogs[0]?.html).toBe(
        "unstable-array-theme:html:INFO same content",
      );
    });
    expect(getTheme).toHaveBeenCalledTimes(1);
    expect(styleLine).toHaveBeenCalledTimes(1);

    rerender({ logs: ["INFO changed content"] });

    await waitFor(() => {
      expect(result.current.processedLogs[0]?.html).toBe(
        "unstable-array-theme:html:INFO changed content",
      );
    });
    expect(getTheme).toHaveBeenCalledTimes(2);
    expect(styleLine).toHaveBeenCalledTimes(2);
  });
});
