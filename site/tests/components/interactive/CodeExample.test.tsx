import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { render, screen, cleanup } from "../../utils/test-utils";
import { CodeExample } from "@/components/interactive/CodeExample";

describe("CodeExample", () => {
  const defaultProps = {
    title: "Basic Usage",
    code: `import { getLogsDX } from 'logsdx'
const logger = getLogsDX('dracula')`,
    themeName: "dracula",
  };

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders title", () => {
    render(<CodeExample {...defaultProps} />);
    expect(screen.getByText("Basic Usage")).toBeDefined();
  });

  it("renders code content", () => {
    render(<CodeExample {...defaultProps} />);
    expect(screen.getByText(/import.*getLogsDX/)).toBeDefined();
  });

  it("renders theme name in footer", () => {
    render(<CodeExample {...defaultProps} />);
    expect(screen.getByText("Theme: dracula")).toBeDefined();
  });

  it("renders window control buttons", () => {
    const { container } = render(<CodeExample {...defaultProps} />);
    const buttons = container.querySelectorAll(".rounded-full");
    expect(buttons.length).toBe(3);
  });

  it("handles unknown theme gracefully", () => {
    render(<CodeExample {...defaultProps} themeName="unknown-theme" />);
    expect(screen.getByText("Theme: unknown-theme")).toBeDefined();
  });
});
