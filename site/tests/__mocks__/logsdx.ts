import { mock } from "bun:test";

export const createSimpleTheme = mock(
  (name: string, colors: unknown, options?: { mode?: string }) => ({
    name,
    colors,
    mode: options?.mode || "dark",
    schema: {},
  }),
);

export const registerTheme = mock(() => {});

export const getLogsDX = mock(async () => ({
  processLine: (line: string) => `<span style="color: #f8f8f2">${line}</span>`,
  processLines: (lines: string[]) =>
    lines.map((line) => `<span>${line}</span>`),
  setTheme: mock(() => {}),
  getCurrentTheme: mock(() => {}),
}));

export const getTheme = mock(async () => ({
  name: "mock-theme",
  mode: "dark",
  schema: { defaultStyle: { color: "#f8f8f2" } },
}));

export const renderLine = mock(
  (line: string, _theme: unknown, options?: { outputFormat?: string }) => {
    if (options?.outputFormat === "html") {
      return `<span style="color: #f8f8f2">${line}</span>`;
    }
    return line;
  },
);

export const getAllThemes = mock(() => ({}));
export const getThemeNames = mock(() => []);
