import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { render, screen, cleanup } from "../../utils/test-utils";
import { PreviewPane } from "@/components/interactive/PreviewPane";

describe("PreviewPane", () => {
  const defaultProps = {
    title: "Terminal",
    themeName: "dracula",
    logs: ["<span>INFO: Test log</span>", "<span>ERROR: Test error</span>"],
    backgroundColor: "#282a36",
    headerBg: "#1e1f29",
    borderColor: "#44475a",
  };

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders title", () => {
    render(<PreviewPane {...defaultProps} />);
    expect(screen.getByText("Terminal")).toBeDefined();
  });

  it("renders theme name in footer", () => {
    render(<PreviewPane {...defaultProps} />);
    expect(screen.getByText("Theme: dracula")).toBeDefined();
  });

  it("renders logs as HTML", () => {
    render(<PreviewPane {...defaultProps} />);
    expect(screen.getAllByText("INFO: Test log").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ERROR: Test error").length).toBeGreaterThan(0);
  });

  it("shows loading state", () => {
    render(<PreviewPane {...defaultProps} isLoading={true} />);
    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("hides logs when loading", () => {
    render(<PreviewPane {...defaultProps} isLoading={true} />);
    expect(screen.queryByText("INFO: Test log")).toBeNull();
  });

  it("renders window control buttons", () => {
    const { container } = render(<PreviewPane {...defaultProps} />);
    const buttons = container.querySelectorAll(".rounded-full");
    expect(buttons.length).toBe(3);
  });

  it("renders with showBorder prop", () => {
    const { container } = render(<PreviewPane {...defaultProps} showBorder={true} />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders empty logs array", () => {
    render(<PreviewPane {...defaultProps} logs={[]} />);
    expect(screen.getByText("Terminal")).toBeDefined();
  });
});
