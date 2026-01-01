import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "../../utils/test-utils";
import { SchemaVisualization } from "@/components/schema-viz";

describe("SchemaVisualization", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders section heading", () => {
    render(<SchemaVisualization />);
    const themeElements = screen.getAllByText("Theme");
    expect(themeElements.length).toBeGreaterThan(0);
    expect(screen.getByText("Schema")).toBeDefined();
  });

  it("renders schema section tabs", () => {
    render(<SchemaVisualization />);
    const schemaConfigElements = screen.getAllByText("SchemaConfig");
    expect(schemaConfigElements.length).toBeGreaterThan(0);
    const styleOptionsElements = screen.getAllByText("StyleOptions");
    expect(styleOptionsElements.length).toBeGreaterThan(0);
  });

  it("shows Theme section by default", () => {
    render(<SchemaVisualization />);
    expect(screen.getByText("Root theme object that defines styling rules")).toBeDefined();
  });

  it("switches sections when tab is clicked", () => {
    render(<SchemaVisualization />);
    const schemaConfigButton = screen.getByRole("button", { name: "SchemaConfig" });
    fireEvent.click(schemaConfigButton);
    expect(screen.getByText("Defines how log content is matched and styled")).toBeDefined();
  });

  it("renders matching priority list", () => {
    render(<SchemaVisualization />);
    expect(screen.getByText("Matching Priority")).toBeDefined();
    const matchPatterns = screen.getAllByText("matchPatterns");
    expect(matchPatterns.length).toBeGreaterThan(0);
    const matchWords = screen.getAllByText("matchWords");
    expect(matchWords.length).toBeGreaterThan(0);
  });

  it("renders example theme code", () => {
    render(<SchemaVisualization />);
    expect(screen.getByText("Example Theme")).toBeDefined();
    expect(screen.getByText("my-theme.json")).toBeDefined();
  });

  it("shows required badge for required properties", () => {
    render(<SchemaVisualization />);
    const requiredBadges = screen.getAllByText("required");
    expect(requiredBadges.length).toBeGreaterThan(0);
  });
});
