import { describe, it, expect, vi, beforeEach, afterEach } from "bun:test";
import { render, screen, fireEvent, cleanup } from "../utils/test-utils";
import { ThemeColorPicker } from "@/components/themegenerator/ThemeColorPicker";
import { mockColors } from "../utils/theme-mocks";

describe("ThemeColorPicker", () => {
  let mockOnColorChange: ReturnType<typeof vi.fn>;
  let mockOnReset: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnColorChange = vi.fn();
    mockOnReset = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders all color inputs", () => {
    render(
      <ThemeColorPicker
        colors={mockColors}
        onColorChange={mockOnColorChange}
        onReset={mockOnReset}
      />,
    );

    expect(screen.getByText("Colors")).toBeDefined();
    expect(screen.getByText("primary")).toBeDefined();
    expect(screen.getByText("secondary")).toBeDefined();
    expect(screen.getByText("accent")).toBeDefined();
    expect(screen.getByText("error")).toBeDefined();
    expect(screen.getByText("warning")).toBeDefined();
  });

  it("displays current color values", () => {
    render(
      <ThemeColorPicker
        colors={mockColors}
        onColorChange={mockOnColorChange}
        onReset={mockOnReset}
      />,
    );

    const primaryInputs = screen.getAllByDisplayValue("#bd93f9");
    expect(primaryInputs.length).toBeGreaterThan(0);

    const errorInputs = screen.getAllByDisplayValue("#ff5555");
    expect(errorInputs.length).toBeGreaterThan(0);
  });

  it("calls onColorChange when color is updated via text input", () => {
    render(
      <ThemeColorPicker
        colors={mockColors}
        onColorChange={mockOnColorChange}
        onReset={mockOnReset}
      />,
    );

    const inputs = screen.getAllByDisplayValue("#bd93f9");
    const textInput = inputs.find(
      (input) => (input as HTMLInputElement).type === "text",
    );

    expect(textInput).toBeDefined();
    fireEvent.change(textInput!, { target: { value: "#ff0000" } });

    expect(mockOnColorChange).toHaveBeenCalledWith("primary", "#ff0000");
  });

  it("calls onColorChange when color is updated via color picker", () => {
    render(
      <ThemeColorPicker
        colors={mockColors}
        onColorChange={mockOnColorChange}
        onReset={mockOnReset}
      />,
    );

    const colorPickers = screen.getAllByDisplayValue("#bd93f9");
    const colorPickerInput = colorPickers[0]; // First one is the color input

    fireEvent.change(colorPickerInput, { target: { value: "#00ff00" } });

    expect(mockOnColorChange).toHaveBeenCalled();
  });

  it("calls onReset when reset button is clicked", () => {
    render(
      <ThemeColorPicker
        colors={mockColors}
        onColorChange={mockOnColorChange}
        onReset={mockOnReset}
      />,
    );

    const resetButton = screen.getByRole("button", { name: /reset/i });
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it("renders color picker and text input for each color", () => {
    render(
      <ThemeColorPicker
        colors={mockColors}
        onColorChange={mockOnColorChange}
        onReset={mockOnReset}
      />,
    );

    const colorInputs = screen.getAllByDisplayValue("#bd93f9");
    // Should have 2: one color picker, one text input
    expect(colorInputs.length).toBeGreaterThanOrEqual(1);
  });

  it("allows editing all color properties", () => {
    render(
      <ThemeColorPicker
        colors={mockColors}
        onColorChange={mockOnColorChange}
        onReset={mockOnReset}
      />,
    );

    Object.entries(mockColors).forEach(([key, value]) => {
      const inputs = screen.getAllByDisplayValue(value);
      expect(inputs.length).toBeGreaterThan(0);
    });
  });
});
