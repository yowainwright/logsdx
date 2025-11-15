import { vi } from "bun:test";

export const createSimpleTheme = vi.fn(
  (name: string, colors: any, options?: any) => ({
    name,
    colors,
    mode: options?.mode || "dark",
    schema: {},
  }),
);

export const registerTheme = vi.fn();

export const getLogsDX = vi.fn().mockResolvedValue({
  processLine: (line: string) => `<span style="color: #f8f8f2">${line}</span>`,
  processLines: (lines: string[]) =>
    lines.map((line) => `<span>${line}</span>`),
  setTheme: vi.fn(),
  getCurrentTheme: vi.fn(),
});

export const getTheme = vi.fn();
export const getAllThemes = vi.fn(() => ({}));
export const getThemeNames = vi.fn(() => []);
