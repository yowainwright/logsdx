import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "../../utils/test-utils";
import { CliDemo } from "@/components/cli-demo";

describe("CliDemo", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders section heading", () => {
    render(<CliDemo />);
    expect(screen.getByText("Powerful")).toBeDefined();
    expect(screen.getByText("CLI")).toBeDefined();
  });

  it("renders package manager buttons", () => {
    render(<CliDemo />);
    expect(screen.getByText("npm")).toBeDefined();
    expect(screen.getByText("pnpm")).toBeDefined();
    expect(screen.getByText("bun")).toBeDefined();
  });

  it("renders all CLI features", () => {
    render(<CliDemo />);
    expect(screen.getByText("Pipe Logs")).toBeDefined();
    expect(screen.getByText("Process Files")).toBeDefined();
    expect(screen.getByText("Interactive Theme Creator")).toBeDefined();
    expect(screen.getByText("Preview Themes")).toBeDefined();
  });

  it("changes install command when package manager is clicked", () => {
    render(<CliDemo />);
    const bunButton = screen.getByText("bun");
    fireEvent.click(bunButton);
    expect(screen.getByText("bun add -g logsdx")).toBeDefined();
  });

  it("changes terminal output when feature is clicked", () => {
    render(<CliDemo />);
    const processFilesButton = screen.getByText("Process Files");
    fireEvent.click(processFilesButton);
    expect(screen.getByText(/Processing app.log/)).toBeDefined();
  });

  it("shows terminal window with controls", () => {
    const { container } = render(<CliDemo />);
    const terminalDots = container.querySelectorAll(".rounded-full");
    expect(terminalDots.length).toBeGreaterThanOrEqual(3);
  });
});
