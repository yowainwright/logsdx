import { mock } from "bun:test";

const logsdxMock = {
  createSimpleTheme: (
    name: string,
    colors: unknown,
    options?: { mode?: string },
  ) => ({
    name,
    colors,
    mode: options?.mode || "dark",
    schema: {},
  }),
  registerTheme: () => {},
  getLogsDX: async () => ({
    processLine: (line: string) =>
      `<span style="color: #f8f8f2">${line}</span>`,
    processLines: (lines: string[]) =>
      lines.map((line: string) => `<span>${line}</span>`),
    setTheme: () => {},
    getCurrentTheme: () => {},
  }),
  getTheme: async () => ({
    name: "mock-theme",
    mode: "dark",
    schema: { defaultStyle: { color: "#f8f8f2" } },
  }),
  renderLine: (
    line: string,
    _theme: unknown,
    options?: { outputFormat?: string },
  ) => {
    if (options?.outputFormat === "html") {
      return `<span style="color: #f8f8f2">${line}</span>`;
    }
    return line;
  },
  getAllThemes: () => ({}),
  getThemeNames: () => [],
  LogsDX: class {
    static getInstance = async () => ({
      processLine: (line: string) => line,
    });
    static resetInstance = () => {};
  },
};

// Mock logsdx BEFORE any other imports to ensure it's hoisted
mock.module("logsdx", () => logsdxMock);

import { GlobalRegistrator } from "@happy-dom/global-registrator";
import "@testing-library/jest-dom";

GlobalRegistrator.register();
