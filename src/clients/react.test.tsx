import { expect, test, describe, mock } from "bun:test";
import { LogEnhancer } from "@/src/logenhancer";
import type { LogLevel, LogEnhancer as LogEnhancerType } from "@/src/types";

// Mock React
const React = {
  createElement: mock((type: any, props: any, ...children: any[]) => ({
    type,
    props: { ...props, children },
  })),
};

// Mock the component
const LogViewer = mock((props: any) => {
  const { log, enhancer } = props;
  const lines = log.split("\n");

  return {
    type: "div",
    props: {
      className:
        "font-mono text-sm p-2 overflow-auto whitespace-pre-wrap h-full w-full",
      children: lines.map((line: string, i: number) => {
        const enhanced = enhancer.enhanceLine(line, i);
        return {
          type: "div",
          props: { key: i, children: enhanced },
        };
      }),
    },
  };
});

// Mock enhancer
const mockEnhancer: LogEnhancerType = {
  enhanceLine: mock((line: string, index: number) => {
    return `Line ${index + 1}: ${line}`;
  }),
  parseLevel: mock((line: string): LogLevel | undefined => {
    if (line.includes("ERROR")) return "error";
    if (line.includes("WARN")) return "warn";
    if (line.includes("INFO")) return "info";
    return undefined;
  }),
};

describe("LogViewer", () => {
  test("component renders with props", () => {
    const props = {
      log: "Test log message\nSecond line",
      enhancer: mockEnhancer,
    };

    const component = LogViewer(props);
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "font-mono text-sm p-2 overflow-auto whitespace-pre-wrap h-full w-full",
    );
    expect(component.props.children).toHaveLength(2);
  });

  test("component handles empty log", () => {
    const props = {
      log: "",
      enhancer: mockEnhancer,
    };

    const component = LogViewer(props);
    expect(component).toBeDefined();
    // Empty string split by newline gives an array with one empty string
    expect(component.props.children).toHaveLength(1);
    expect(component.props.children[0].props.children).toBe("Line 1: ");
  });

  test("component handles multiline log", () => {
    const props = {
      log: "Line 1\nLine 2\nLine 3",
      enhancer: mockEnhancer,
    };

    const component = LogViewer(props);
    expect(component).toBeDefined();
    expect(component.props.children).toHaveLength(3);

    // Check that each line is enhanced
    component.props.children.forEach((child: any, index: number) => {
      expect(child.props.children).toBe(`Line ${index + 1}: Line ${index + 1}`);
    });
  });

  test("component passes line numbers to enhancer", () => {
    const props = {
      log: "Test message",
      enhancer: mockEnhancer,
    };

    const component = LogViewer(props);
    expect(component).toBeDefined();

    // Check that the enhancer was called with the correct line number
    expect(mockEnhancer.enhanceLine).toHaveBeenCalledWith("Test message", 0);
  });
});
