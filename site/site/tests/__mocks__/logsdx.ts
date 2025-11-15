import { vi } from "bun:test";

export const createSimpleTheme = vi.fn((name: string, colors: any, options: any) => ({
  name,
  colors,
  ...options,
}));

export const registerTheme = vi.fn();

export const getLogsDX = vi.fn().mockResolvedValue({
  processLine: vi.fn((line: string) => `<span>${line}</span>`),
  processLines: vi.fn((lines: string[]) => lines.map(l => `<span>${l}</span>`)),
  processLog: vi.fn((log: string) => `<span>${log}</span>`),
  setTheme: vi.fn().mockResolvedValue(true),
  getCurrentTheme: vi.fn(() => ({})),
});
