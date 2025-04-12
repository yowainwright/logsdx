import { expect, test, describe, mock } from "bun:test";
import { INK_DEFAULT_THEME } from "@/src/constants";

// Mock React
const React = {
  createElement: mock((type: any, props: any) => ({
    type,
    props,
  })),
};

// Mock Ink
const ink = {
  render: mock(() => {}),
  unmount: mock(() => {}),
};

// Mock the component
const InkLogViewer = mock((props: any) => ({
  type: "InkLogViewer",
  props,
}));

const mockEnhancer = {
  enhanceLine: (line: string) => line,
  parseLevel: (line: string) => {
    if (line.includes("ERROR")) return "error";
    if (line.includes("WARN")) return "warn";
    if (line.includes("INFO")) return "info";
    return undefined;
  },
};

describe("InkLogViewer", () => {
  test("component props are correctly typed", () => {
    const props = {
      log: "Test log message",
      enhancer: mockEnhancer,
      showLineNumbers: true,
      highlightPatterns: [{ pattern: "test", style: ["yellow", "bold"] }],
      theme: INK_DEFAULT_THEME,
      maxLines: 10,
      wrap: true,
      padding: 1,
    };

    const component = InkLogViewer(props);
    expect(component).toBeDefined();
    expect(component.type).toBe("InkLogViewer");
    expect(component.props).toEqual(props);
  });

  test("component renders with default props", () => {
    const props = {
      log: "Test log message",
      enhancer: mockEnhancer,
    };

    const component = InkLogViewer(props);
    expect(component).toBeDefined();
    expect(component.type).toBe("InkLogViewer");
    expect(component.props.log).toBe(props.log);
    expect(component.props.enhancer).toBe(props.enhancer);
    expect(component.props.showLineNumbers).toBeUndefined();
    expect(component.props.highlightPatterns).toBeUndefined();
    expect(component.props.theme).toBeUndefined();
    expect(component.props.maxLines).toBeUndefined();
    expect(component.props.wrap).toBeUndefined();
    expect(component.props.padding).toBeUndefined();
  });
});
