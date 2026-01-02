import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";

mock.module("@/hooks/useThemeProcessor", () => ({
  useThemeProcessor: () => ({
    processedLogs: [
      { html: "<span>INFO: Test log</span>", ansi: "INFO: Test log" },
      { html: "<span>ERROR: Test error</span>", ansi: "ERROR: Test error" },
    ],
    isLoading: false,
    error: null,
    theme: { name: "dracula", mode: "dark" },
  }),
}));

import { render, screen, cleanup } from "../../utils/test-utils";
import { ThemeCard } from "@/components/theme-card";

describe("ThemeCard", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders theme name formatted", () => {
    render(<ThemeCard themeName="oh-my-zsh" />);
    expect(screen.getByText("Oh My Zsh")).toBeDefined();
  });

  it("renders theme mode badge", () => {
    render(<ThemeCard themeName="dracula" />);
    expect(screen.getByText("dark")).toBeDefined();
  });

  it("renders browser and terminal panes", () => {
    render(<ThemeCard themeName="dracula" />);
    expect(screen.getByText("Browser")).toBeDefined();
    expect(screen.getByText("Terminal")).toBeDefined();
  });

  it("returns null when not visible", () => {
    const { container } = render(
      <ThemeCard themeName="dracula" isVisible={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders processed logs", () => {
    render(<ThemeCard themeName="dracula" />);
    expect(screen.getAllByText("INFO: Test log").length).toBeGreaterThan(0);
  });
});
