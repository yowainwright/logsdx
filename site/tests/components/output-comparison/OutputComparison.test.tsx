import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "../../utils/test-utils";
import { OutputComparison } from "@/components/output-comparison";

describe("OutputComparison", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders section heading", () => {
    render(<OutputComparison />);
    expect(screen.getByText("Real")).toBeDefined();
    expect(screen.getByText("Output Comparison")).toBeDefined();
  });

  it("renders terminal and browser output panels", () => {
    render(<OutputComparison />);
    expect(screen.getByText("Terminal (ANSI)")).toBeDefined();
    expect(screen.getByText("Browser (HTML)")).toBeDefined();
  });

  it("renders Rendered and Source mode tabs", () => {
    render(<OutputComparison />);
    expect(screen.getAllByRole("button", { name: "Rendered" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Source" })).toHaveLength(2);
  });

  it("renders theme selector", () => {
    render(<OutputComparison />);
    expect(screen.getByText("Theme")).toBeDefined();
    expect(screen.getByRole("button", { name: "dracula" })).toBeDefined();
    expect(screen.getByRole("button", { name: "github-dark" })).toBeDefined();
  });

  it("renders terminal significance text", () => {
    render(<OutputComparison />);
    expect(screen.getByText(/The Terminal panel uses Ghostty/)).toBeDefined();
  });

  it("switches terminal panel to source mode when clicked", () => {
    render(<OutputComparison />);
    const sourceTabs = screen.getAllByRole("button", { name: "Source" });
    fireEvent.click(sourceTabs[0]);
    expect(sourceTabs[0].className).toContain("bg-white/20");
  });

  it("switches browser panel to source mode when clicked", () => {
    render(<OutputComparison />);
    const sourceTabs = screen.getAllByRole("button", { name: "Source" });
    fireEvent.click(sourceTabs[1]);
    expect(sourceTabs[1].className).toContain("bg-white/20");
  });
});
