import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";

mock.module("@/hooks/useThemeProcessor", () => ({
  useThemeProcessor: () => ({
    processedLogs: [
      {
        html: "<span>INFO: Test log</span>",
        ansi: "\u001b[31mINFO: Test log\u001b[0m",
      },
      {
        html: "<span>ERROR: Test error</span>",
        ansi: "\u001b[32mERROR: Test error\u001b[0m",
      },
    ],
    isLoading: false,
    error: null,
    theme: {
      name: "dracula",
      mode: "dark",
      schema: { defaultStyle: { color: "#f8f8f2" } },
      colors: { text: "#f8f8f2", background: "#282a36" },
    },
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

  it("renders terminal pane from ANSI output", () => {
    const { container } = render(<ThemeCard themeName="dracula" />);
    const styledLogSpans = Array.from(
      container.querySelectorAll("span"),
    ).filter(
      (span) =>
        span.textContent === "INFO: Test log" &&
        span.getAttribute("style")?.includes("color"),
    );

    expect(styledLogSpans.length).toBeGreaterThan(0);
    expect(container.innerHTML).not.toContain("\u001b[31m");
  });
});
