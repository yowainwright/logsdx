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

  it("renders Terminal and HTML view tabs", () => {
    render(<OutputComparison />);
    expect(screen.getByRole("button", { name: "Terminal" })).toBeDefined();
    expect(screen.getByRole("button", { name: "HTML" })).toBeDefined();
  });

  it("renders Rendered and Source mode tabs", () => {
    render(<OutputComparison />);
    expect(screen.getByRole("button", { name: "Rendered" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Source" })).toBeDefined();
  });

  it("renders theme selector", () => {
    render(<OutputComparison />);
    expect(screen.getByText("Theme")).toBeDefined();
    expect(screen.getByRole("combobox")).toBeDefined();
  });

  it("renders custom log input", () => {
    render(<OutputComparison />);
    expect(
      screen.getByPlaceholderText("Paste your own logs here..."),
    ).toBeDefined();
  });

  it("switches to HTML view when clicked", () => {
    render(<OutputComparison />);
    const htmlTab = screen.getByRole("button", { name: "HTML" });
    fireEvent.click(htmlTab);
    expect(screen.getByText("Browser")).toBeDefined();
  });

  it("shows format descriptions", () => {
    render(<OutputComparison />);
    expect(screen.getByText("Escape codes for terminals")).toBeDefined();
    expect(screen.getByText("Styled spans for browsers")).toBeDefined();
  });
});
