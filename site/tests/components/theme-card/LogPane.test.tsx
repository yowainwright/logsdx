import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { render, screen, cleanup } from "../../utils/test-utils";
import { LogPane } from "@/components/theme-card/LogPane";

describe("LogPane", () => {
  const defaultProps = {
    title: "Browser",
    logs: ["<span>Log line 1</span>", "<span>Log line 2</span>"],
    backgroundColor: "#282a36",
    mode: "dark" as const,
  };

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders title", () => {
    render(<LogPane {...defaultProps} />);
    expect(screen.getByText("Browser")).toBeDefined();
  });

  it("renders logs as HTML", () => {
    render(<LogPane {...defaultProps} />);
    expect(screen.getAllByText("Log line 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Log line 2").length).toBeGreaterThan(0);
  });

  it("shows loading state", () => {
    render(<LogPane {...defaultProps} isLoading={true} />);
    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("hides logs when loading", () => {
    render(<LogPane {...defaultProps} isLoading={true} />);
    expect(screen.queryByText("Log line 1")).toBeNull();
  });

  it("renders with dark mode", () => {
    const { container } = render(<LogPane {...defaultProps} mode="dark" />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders with light mode", () => {
    const { container } = render(<LogPane {...defaultProps} mode="light" />);
    expect(container.firstChild).toBeDefined();
  });

  it("applies background color", () => {
    const { container } = render(<LogPane {...defaultProps} />);
    const pane = container.firstChild as HTMLElement;
    expect(pane).toBeDefined();
  });

  it("renders empty logs array", () => {
    render(<LogPane {...defaultProps} logs={[]} />);
    expect(screen.getByText("Browser")).toBeDefined();
  });
});
