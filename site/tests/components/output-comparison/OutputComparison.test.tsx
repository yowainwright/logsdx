import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";

mock.module("ghostty-web", () => ({
  init: mock(async () => {}),
  Terminal: class {
    options: unknown;

    constructor(options: unknown) {
      this.options = options;
    }

    open() {}
    write() {}
    clear() {}
    dispose() {}
  },
}));

const defaultTheme = async (themeName: string) => ({
  name: themeName,
  mode: "dark",
  schema: { defaultStyle: { color: "#f8f8f2" } },
});

let getThemeImpl = defaultTheme;
const getTheme = mock((themeName: string) => getThemeImpl(themeName));
const renderLine = mock(
  (line: string, _theme: unknown, options?: { outputFormat?: string }) => {
    if (options?.outputFormat === "html") {
      return `<span style="color: #f8f8f2">${line}</span>`;
    }
    return line;
  },
);

mock.module("logsdx", () => ({
  getTheme,
  renderLine,
}));

import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "../../utils/test-utils";
import { OutputComparison } from "@/components/output-comparison";

async function renderOutputComparison() {
  render(<OutputComparison />);
  await waitFor(() => {
    expect(screen.queryAllByText("Processing...")).toHaveLength(0);
  });
}

describe("OutputComparison", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    getThemeImpl = defaultTheme;
    getTheme.mockClear();
    renderLine.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders section heading", async () => {
    await renderOutputComparison();
    expect(screen.getByText("Real")).toBeDefined();
    expect(screen.getByText("Output Comparison")).toBeDefined();
  });

  it("renders terminal and browser output panels", async () => {
    await renderOutputComparison();
    expect(screen.getByText("Terminal (ANSI)")).toBeDefined();
    expect(screen.getByText("Browser (HTML)")).toBeDefined();
  });

  it("renders Rendered and Source mode tabs", async () => {
    await renderOutputComparison();
    expect(screen.getAllByRole("button", { name: "Rendered" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Source" })).toHaveLength(2);
  });

  it("renders theme selector", async () => {
    await renderOutputComparison();
    expect(screen.getByText("Theme")).toBeDefined();
    expect(screen.getByRole("button", { name: "dracula" })).toBeDefined();
    expect(screen.getByRole("button", { name: "github-dark" })).toBeDefined();
  });

  it("renders terminal significance text", async () => {
    await renderOutputComparison();
    expect(screen.getByText(/The Terminal panel uses Ghostty/)).toBeDefined();
  });

  it("switches terminal panel to source mode when clicked", async () => {
    await renderOutputComparison();
    const sourceTabs = screen.getAllByRole("button", { name: "Source" });
    fireEvent.click(sourceTabs[0]);
    expect(sourceTabs[0].className).toContain("bg-white/20");
  });

  it("switches browser panel to source mode when clicked", async () => {
    await renderOutputComparison();
    const sourceTabs = screen.getAllByRole("button", { name: "Source" });
    fireEvent.click(sourceTabs[1]);
    expect(sourceTabs[1].className).toContain("bg-white/20");
  });

  it("shows raw HTML source without entity double-escaping", async () => {
    await renderOutputComparison();
    const sourceTabs = screen.getAllByRole("button", { name: "Source" });

    fireEvent.click(sourceTabs[1]);

    await waitFor(() => {
      expect(
        screen.getAllByText(/<span style="color: #f8f8f2">/).length,
      ).toBeGreaterThan(0);
    });
    expect(screen.queryByText(/&lt;span/)).toBeNull();
  });

  it("shows a visible error when theme loading fails", async () => {
    getThemeImpl = async () => {
      throw new Error("theme unavailable");
    };

    render(<OutputComparison />);

    await waitFor(() => {
      expect(
        screen.getAllByText("Failed to load theme: theme unavailable"),
      ).toHaveLength(2);
    });
    expect(screen.getAllByRole("alert")).toHaveLength(2);
  });
});
