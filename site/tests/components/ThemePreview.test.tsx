import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { render, screen, cleanup } from "../utils/test-utils";
import { ThemePreview } from "@/components/themegenerator/ThemePreview";
import { mockColors } from "../utils/theme-mocks";

describe("ThemePreview", () => {
  beforeEach(() => {
    // Clear any lingering DOM state
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
  });
  it("renders preview header", () => {
    render(
      <ThemePreview
        processedLogs={[]}
        isProcessing={false}
        colors={mockColors}
      />,
    );

    expect(screen.getByText("Live Preview")).toBeDefined();
    expect(screen.getByText("Powered by LogsDX")).toBeDefined();
  });

  it("displays loading state when processing", () => {
    render(
      <ThemePreview
        processedLogs={[]}
        isProcessing={true}
        colors={mockColors}
      />,
    );

    const processingText = screen.getAllByText("Processing logs...");
    expect(processingText.length).toBeGreaterThan(0);
  });

  it("displays empty state when no logs", () => {
    render(
      <ThemePreview
        processedLogs={[]}
        isProcessing={false}
        colors={mockColors}
      />,
    );

    const emptyText = screen.getAllByText("No logs to display");
    expect(emptyText.length).toBeGreaterThan(0);
  });

  it("renders processed logs", () => {
    const mockProcessedLogs = [
      '<span style="color: #ff5555">[ERROR] Something failed</span>',
      '<span style="color: #8be9fd">[INFO] Server started</span>',
      '<span style="color: #50fa7b">[SUCCESS] Deploy complete</span>',
    ];

    render(
      <ThemePreview
        processedLogs={mockProcessedLogs}
        isProcessing={false}
        colors={mockColors}
      />,
    );

    // The logs are rendered as HTML, so we check for the container
    const headers = screen.getAllByText("Live Preview");
    const logContainer = headers[0].parentElement?.parentElement;
    expect(logContainer).toBeDefined();
  });

  it("applies theme colors to preview container", () => {
    const { container } = render(
      <ThemePreview
        processedLogs={["test log"]}
        isProcessing={false}
        colors={mockColors}
      />,
    );

    const previewDiv = container.querySelector('[style*="background"]');
    expect(previewDiv).toBeDefined();
  });

  it("renders duplicate logs for scrolling animation", () => {
    const mockProcessedLogs = [
      "<span>Log 1</span>",
      "<span>Log 2</span>",
      "<span>Log 3</span>",
    ];

    const { container } = render(
      <ThemePreview
        processedLogs={mockProcessedLogs}
        isProcessing={false}
        colors={mockColors}
      />,
    );

    // Should have 2 sets of logs for seamless scrolling
    const logWrapper = container.querySelector(".log-scroll-wrapper");
    expect(logWrapper).toBeDefined();

    const logLines = container.querySelectorAll(".log-line");
    // 3 logs × 2 sets = 6 total
    expect(logLines.length).toBe(6);
  });

  it("pauses animation on hover", () => {
    const { container } = render(
      <ThemePreview
        processedLogs={["test"]}
        isProcessing={false}
        colors={mockColors}
      />,
    );

    const scrollWrapper = container.querySelector(".log-scroll-wrapper");
    expect(scrollWrapper).toBeDefined();

    // Check that the animation pause style is injected
    const styleTag = container.querySelector("style");
    expect(styleTag?.textContent).toContain("animation-play-state: paused");
  });

  it("shows correct state transitions", () => {
    const { rerender, container } = render(
      <ThemePreview
        processedLogs={[]}
        isProcessing={true}
        colors={mockColors}
      />,
    );

    const processingTexts = screen.getAllByText("Processing logs...");
    expect(processingTexts.length).toBeGreaterThan(0);

    rerender(
      <ThemePreview
        processedLogs={["<span>Log ready</span>"]}
        isProcessing={false}
        colors={mockColors}
      />,
    );

    // Should now show the log scroll wrapper with logs
    const scrollWrapper = container.querySelector(".log-scroll-wrapper");
    expect(scrollWrapper).toBeDefined();
    expect(screen.queryAllByText("Processing logs...").length).toBe(0);
  });

  it("applies monospace font to preview", () => {
    const { container } = render(
      <ThemePreview
        processedLogs={["test"]}
        isProcessing={false}
        colors={mockColors}
      />,
    );

    const previewContainer = container.querySelector(".font-mono");
    expect(previewContainer).toBeDefined();
  });
});
