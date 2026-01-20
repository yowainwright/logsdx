import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";

mock.module("@/hooks/useThemeProcessor", () => ({
  useThemeProcessor: () => ({
    processedLogs: [
      { html: "<span>INFO: Test</span>", ansi: "\x1b[34mINFO: Test\x1b[0m" },
    ],
    isLoading: false,
    error: null,
    theme: { name: "dracula", mode: "dark" },
  }),
}));

import { render, screen, cleanup, fireEvent } from "../../utils/test-utils";
import { LogPlayground } from "@/components/log-playground";

describe("LogPlayground", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the playground title", () => {
    render(<LogPlayground />);
    expect(screen.getByText("Live")).toBeDefined();
    expect(screen.getByText("Log Playground")).toBeDefined();
  });

  it("renders theme selector", () => {
    render(<LogPlayground />);
    expect(screen.getByRole("combobox")).toBeDefined();
  });

  it("renders input textarea", () => {
    render(<LogPlayground />);
    expect(screen.getByLabelText("Input Logs")).toBeDefined();
  });

  it("renders browser and terminal panes", () => {
    render(<LogPlayground />);
    expect(screen.getByText("Browser Console")).toBeDefined();
    expect(screen.getByText("Terminal")).toBeDefined();
  });

  it("renders reset button", () => {
    render(<LogPlayground />);
    expect(screen.getByText("Reset")).toBeDefined();
  });

  it("shows usage code example", () => {
    render(<LogPlayground />);
    expect(screen.getByText("Usage")).toBeDefined();
  });

  it("uses default theme from props", () => {
    render(<LogPlayground defaultTheme="nord" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("nord");
  });
});
