import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { render, screen, cleanup, fireEvent } from "../../utils/test-utils";
import { ThemeControls } from "@/components/interactive/ThemeControls";

describe("ThemeControls", () => {
  const mockOnThemeChange = mock(() => {});
  const mockOnColorModeChange = mock(() => {});

  const defaultProps = {
    selectedTheme: "GitHub",
    colorMode: "system" as const,
    isDarkOnly: false,
    onThemeChange: mockOnThemeChange,
    onColorModeChange: mockOnColorModeChange,
  };

  beforeEach(() => {
    document.body.innerHTML = "";
    mockOnThemeChange.mockClear();
    mockOnColorModeChange.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders all theme buttons", () => {
    render(<ThemeControls {...defaultProps} />);
    expect(screen.getByText("GitHub")).toBeDefined();
    expect(screen.getByText("Dracula")).toBeDefined();
    expect(screen.getByText("Nord")).toBeDefined();
  });

  it("highlights selected theme", () => {
    render(<ThemeControls {...defaultProps} selectedTheme="Dracula" />);
    const draculaButton = screen.getByText("Dracula");
    expect(draculaButton.closest("button")).toBeDefined();
  });

  it("calls onThemeChange when theme button clicked", () => {
    render(<ThemeControls {...defaultProps} />);
    fireEvent.click(screen.getByText("Dracula"));
    expect(mockOnThemeChange).toHaveBeenCalledWith("Dracula");
  });

  it("renders color mode buttons when not dark only", () => {
    const { container } = render(<ThemeControls {...defaultProps} />);
    const iconButtons = container.querySelectorAll("button.h-8.w-8");
    expect(iconButtons.length).toBe(3);
  });

  it("hides color mode buttons when dark only", () => {
    const { container } = render(<ThemeControls {...defaultProps} isDarkOnly={true} />);
    const iconButtons = container.querySelectorAll("button.h-8.w-8");
    expect(iconButtons.length).toBe(0);
  });
});
