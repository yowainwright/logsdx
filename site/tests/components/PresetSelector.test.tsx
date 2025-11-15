import { describe, it, expect, vi, beforeEach, afterEach } from "bun:test";
import { render, screen, fireEvent, cleanup } from "../utils/test-utils";
import { PresetSelector } from "@/components/themegenerator/PresetSelector";
import { mockPresets } from "../utils/theme-mocks";

describe("PresetSelector", () => {
  let mockOnToggle: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnToggle = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders all preset options", () => {
    render(
      <PresetSelector
        presets={mockPresets}
        selectedPresets={[]}
        onToggle={mockOnToggle}
      />,
    );

    expect(screen.getByText("Pattern Presets")).toBeDefined();
    expect(screen.getByText("Log Levels")).toBeDefined();
    expect(screen.getByText("Numbers")).toBeDefined();
    expect(screen.getByText("Strings")).toBeDefined();
  });

  it("displays preset descriptions", () => {
    render(
      <PresetSelector
        presets={mockPresets}
        selectedPresets={[]}
        onToggle={mockOnToggle}
      />,
    );

    expect(screen.getByText("ERROR, WARN, INFO, DEBUG, SUCCESS")).toBeDefined();
    expect(screen.getByText("Integers and decimal values")).toBeDefined();
    expect(screen.getByText("Quoted text")).toBeDefined();
  });

  it("shows selected presets as checked", () => {
    render(
      <PresetSelector
        presets={mockPresets}
        selectedPresets={["logLevels", "numbers"]}
        onToggle={mockOnToggle}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];

    expect(checkboxes[0].checked).toBe(true); // logLevels
    expect(checkboxes[1].checked).toBe(true); // numbers
    expect(checkboxes[2].checked).toBe(false); // strings
  });

  it("calls onToggle when preset is clicked", () => {
    render(
      <PresetSelector
        presets={mockPresets}
        selectedPresets={[]}
        onToggle={mockOnToggle}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    expect(mockOnToggle).toHaveBeenCalledWith("logLevels");
  });

  it("toggles presets on and off", () => {
    const { rerender } = render(
      <PresetSelector
        presets={mockPresets}
        selectedPresets={[]}
        onToggle={mockOnToggle}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    fireEvent.click(checkboxes[0]);

    expect(mockOnToggle).toHaveBeenCalledWith("logLevels");

    // Simulate the preset being selected
    rerender(
      <PresetSelector
        presets={mockPresets}
        selectedPresets={["logLevels"]}
        onToggle={mockOnToggle}
      />,
    );

    const updatedCheckboxes = screen.getAllByRole(
      "checkbox",
    ) as HTMLInputElement[];
    expect(updatedCheckboxes[0].checked).toBe(true);

    // Click again to unselect
    fireEvent.click(updatedCheckboxes[0]);
    expect(mockOnToggle).toHaveBeenCalledWith("logLevels");
  });

  it("allows multiple presets to be selected", () => {
    render(
      <PresetSelector
        presets={mockPresets}
        selectedPresets={["logLevels", "numbers", "strings"]}
        onToggle={mockOnToggle}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes[0].checked).toBe(true);
    expect(checkboxes[1].checked).toBe(true);
    expect(checkboxes[2].checked).toBe(true);
  });

  it("renders clickable labels", () => {
    render(
      <PresetSelector
        presets={mockPresets}
        selectedPresets={[]}
        onToggle={mockOnToggle}
      />,
    );

    const labels = screen.getAllByText("Log Levels");
    const label = labels[0].closest("label");
    expect(label).toBeDefined();
    expect(label?.classList.contains("cursor-pointer")).toBe(true);
  });
});
