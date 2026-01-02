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

  it("renders all output tabs", () => {
    render(<OutputComparison />);
    expect(screen.getByText("ANSI (Raw)")).toBeDefined();
    expect(screen.getByText("ANSI (Terminal)")).toBeDefined();
    expect(screen.getByText("HTML (Source)")).toBeDefined();
    expect(screen.getByText("HTML (Browser)")).toBeDefined();
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

  it("switches tabs when clicked", () => {
    render(<OutputComparison />);
    const htmlRawTab = screen.getByText("HTML (Source)");
    fireEvent.click(htmlRawTab);
    expect(screen.getByText("Raw HTML markup")).toBeDefined();
  });

  it("shows format descriptions", () => {
    render(<OutputComparison />);
    expect(screen.getByText("Escape codes for terminals")).toBeDefined();
    expect(screen.getByText("Styled spans for browsers")).toBeDefined();
  });
});
