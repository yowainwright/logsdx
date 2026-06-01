import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import React from "react";

type MockGhosttyTerminalProps = {
  ansiOutputs: string[];
  isLoading: boolean;
  theme: unknown;
};

const mockTheme = {
  name: "dracula",
  mode: "dark" as const,
  colors: {
    text: "#f8f8f2",
    background: "#282a36",
  },
};

let processorState = {
  processedLogs: [
    { html: "<span>INFO: Test</span>", ansi: "\x1b[34mINFO: Test\x1b[0m" },
  ],
  isLoading: false,
  error: null,
  theme: mockTheme,
};

const ghosttyRenderProps: MockGhosttyTerminalProps[] = [];
let ghosttyMountCount = 0;
let ghosttyUnmountCount = 0;

mock.module("@/hooks/useThemeProcessor", () => ({
  useThemeProcessor: () => processorState,
}));

mock.module("@/components/output-comparison/GhosttyTerminal", () => ({
  GhosttyTerminal: (props: MockGhosttyTerminalProps) => {
    ghosttyRenderProps.push(props);

    React.useEffect(() => {
      ghosttyMountCount += 1;
      return () => {
        ghosttyUnmountCount += 1;
      };
    }, []);

    return React.createElement("div", {
      "data-loading": String(props.isLoading),
      "data-testid": "ghostty-terminal",
    });
  },
}));

import { render, screen, cleanup, fireEvent } from "../../utils/test-utils";
import { LogPlayground } from "@/components/log-playground";

describe("LogPlayground", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    processorState = {
      processedLogs: [
        {
          html: "<span>INFO: Test</span>",
          ansi: "\x1b[34mINFO: Test\x1b[0m",
        },
      ],
      isLoading: false,
      error: null,
      theme: mockTheme,
    };
    ghosttyRenderProps.length = 0;
    ghosttyMountCount = 0;
    ghosttyUnmountCount = 0;
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the playground title", () => {
    render(<LogPlayground />);
    expect(screen.getByText("Live")).toBeDefined();
    expect(screen.getByText("Log Playground")).toBeDefined();
  });

  it("renders theme selector", () => {
    render(<LogPlayground />);
    expect(screen.getByRole("combobox")).toBeDefined();
  });

  it("renders input textarea", () => {
    render(<LogPlayground />);
    expect(screen.getByLabelText("Input Logs")).toBeDefined();
  });

  it("renders browser and terminal panes", () => {
    render(<LogPlayground />);
    expect(screen.getByText("Browser Console")).toBeDefined();
    expect(screen.getByText("Terminal")).toBeDefined();
  });

  it("renders reset button", () => {
    render(<LogPlayground />);
    expect(screen.getByText("Reset")).toBeDefined();
  });

  it("shows the default log content", () => {
    render(<LogPlayground />);
    const textarea = screen.getByLabelText("Input Logs") as HTMLTextAreaElement;
    expect(textarea.value).toContain("Application starting");
  });

  it("resets edited log content", () => {
    render(<LogPlayground />);
    const textarea = screen.getByLabelText("Input Logs") as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: "ERROR: custom" } });
    expect(textarea.value).toBe("ERROR: custom");

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(textarea.value).toContain("Application starting");
  });

  it("uses default theme from props", () => {
    render(<LogPlayground defaultTheme="nord" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("nord");
  });

  it("keeps the Ghostty terminal mounted while processing a new theme", () => {
    const { rerender } = render(<LogPlayground />);

    expect(screen.getByTestId("ghostty-terminal")).toHaveAttribute(
      "data-loading",
      "false",
    );
    expect(ghosttyMountCount).toBe(1);

    processorState = {
      ...processorState,
      isLoading: true,
    };

    rerender(<LogPlayground />);

    expect(screen.getByTestId("ghostty-terminal")).toHaveAttribute(
      "data-loading",
      "true",
    );
    expect(ghosttyMountCount).toBe(1);
    expect(ghosttyUnmountCount).toBe(0);
    expect(ghosttyRenderProps[ghosttyRenderProps.length - 1].isLoading).toBe(
      true,
    );
  });
});
