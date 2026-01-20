import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import fs from "fs";
import os from "os";
import path from "path";

const mockInput = mock(() => Promise.resolve("test-theme"));
const mockSelect = mock(() => Promise.resolve("github-dark"));
const mockCheckbox = mock(() => Promise.resolve(["log-levels"]));
const mockConfirm = mock(() => Promise.resolve(false));

const originalLog = console.log;

beforeEach(() => {
  console.log = mock(() => {});
  mockInput.mockClear();
  mockSelect.mockClear();
  mockCheckbox.mockClear();
  mockConfirm.mockClear();
});

afterEach(() => {
  console.log = originalLog;
});

describe("Theme Generator Interactive Functions", () => {
  describe("runThemeGenerator flow", () => {
    it("should generate theme with basic inputs", async () => {
      mockInput
        .mockResolvedValueOnce("my-theme")
        .mockResolvedValueOnce("My custom theme");
      mockSelect
        .mockResolvedValueOnce("github-dark")
        .mockResolvedValueOnce("global");
      mockCheckbox.mockResolvedValueOnce(["log-levels"]);
      mockConfirm
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const { generateTemplateFromAnswers } = await import(
        "../../../../src/cli/theme-gen"
      );

      const theme = generateTemplateFromAnswers({
        name: "my-theme",
        description: "My custom theme",
        palette: "github-dark",
        patterns: ["log-levels"],
        features: [],
      });

      expect(theme.name).toBe("my-theme");
      expect(theme.description).toBe("My custom theme");
    });
  });

  describe("exportTheme edge cases", () => {
    it("should handle theme not found", async () => {
      const { exportThemeToFile } = await import(
        "../../../../src/cli/theme-gen"
      );
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
      const filePath = path.join(tempDir, "test.json");

      const theme = {
        name: "edge-case-theme",
        schema: { defaultStyle: { color: "#fff" } },
      };

      try {
        exportThemeToFile(theme, filePath);
        expect(fs.existsSync(filePath)).toBe(true);
      } finally {
        fs.rmSync(tempDir, { recursive: true });
      }
    });

    it("should handle export to existing directory", async () => {
      const { exportThemeToFile } = await import(
        "../../../../src/cli/theme-gen"
      );
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
      const filePath = path.join(tempDir, "existing.json");

      fs.writeFileSync(filePath, "{}");

      const theme = {
        name: "overwrite-theme",
        schema: { defaultStyle: { color: "#000" } },
      };

      try {
        exportThemeToFile(theme, filePath);
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        expect(content.name).toBe("overwrite-theme");
      } finally {
        fs.rmSync(tempDir, { recursive: true });
      }
    });
  });

  describe("importThemeFromFile edge cases", () => {
    it("should import valid TypeScript theme with export const", async () => {
      const { importThemeFromFile } = await import(
        "../../../../src/cli/theme-gen"
      );
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
      const filePath = path.join(tempDir, "theme.ts");

      const tsContent = `export const theme: Theme = {"name": "ts-theme", "schema": {"defaultStyle": {"color": "#fff"}}}`;
      fs.writeFileSync(filePath, tsContent);

      try {
        const theme = importThemeFromFile(filePath);
        expect(theme.name).toBe("ts-theme");
      } finally {
        fs.rmSync(tempDir, { recursive: true });
      }
    });

    it("should import valid TypeScript theme with export default", async () => {
      const { importThemeFromFile } = await import(
        "../../../../src/cli/theme-gen"
      );
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
      const filePath = path.join(tempDir, "theme.ts");

      const tsContent = `export default {"name": "default-theme", "schema": {"defaultStyle": {"color": "#000"}}}`;
      fs.writeFileSync(filePath, tsContent);

      try {
        const theme = importThemeFromFile(filePath);
        expect(theme.name).toBe("default-theme");
      } finally {
        fs.rmSync(tempDir, { recursive: true });
      }
    });

    it("should import JavaScript theme file", async () => {
      const { importThemeFromFile } = await import(
        "../../../../src/cli/theme-gen"
      );
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
      const filePath = path.join(tempDir, "theme.js");

      const jsContent = `export const theme: Theme = {"name": "js-theme", "schema": {"defaultStyle": {"color": "#123"}}};`;
      fs.writeFileSync(filePath, jsContent);

      try {
        const theme = importThemeFromFile(filePath);
        expect(theme.name).toBe("js-theme");
      } finally {
        fs.rmSync(tempDir, { recursive: true });
      }
    });

    it("should throw for malformed TypeScript that looks like it has export", async () => {
      const { importThemeFromFile } = await import(
        "../../../../src/cli/theme-gen"
      );
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
      const filePath = path.join(tempDir, "bad.ts");

      const tsContent = `export const notTheme = "just a string"`;
      fs.writeFileSync(filePath, tsContent);

      try {
        expect(() => importThemeFromFile(filePath)).toThrow("Failed to parse");
      } finally {
        fs.rmSync(tempDir, { recursive: true });
      }
    });
  });

  describe("getThemeFiles edge cases", () => {
    it("should find files with theme in name", async () => {
      const { getThemeFiles } = await import("../../../../src/cli/theme-gen");
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));

      fs.writeFileSync(
        path.join(tempDir, "custom-theme.json"),
        JSON.stringify({ name: "custom" }),
      );

      try {
        const files = getThemeFiles(tempDir);
        expect(files.some((f) => f.includes("custom-theme.json"))).toBe(true);
      } finally {
        fs.rmSync(tempDir, { recursive: true });
      }
    });

    it("should handle deeply nested theme files", async () => {
      const { getThemeFiles } = await import("../../../../src/cli/theme-gen");
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));
      const deepDir = path.join(tempDir, "a", "b", "c");
      fs.mkdirSync(deepDir, { recursive: true });

      fs.writeFileSync(
        path.join(deepDir, "deep.theme.json"),
        JSON.stringify({ name: "deep" }),
      );

      try {
        const files = getThemeFiles(tempDir);
        expect(files.some((f) => f.includes("deep.theme.json"))).toBe(true);
      } finally {
        fs.rmSync(tempDir, { recursive: true });
      }
    });
  });

  describe("listThemeFilesCommand edge cases", () => {
    it("should display theme with exportedAt date", async () => {
      const { listThemeFilesCommand } = await import(
        "../../../../src/cli/theme-gen"
      );
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));

      fs.writeFileSync(
        path.join(tempDir, "dated.theme.json"),
        JSON.stringify({
          name: "dated",
          description: "Has date",
          exportedAt: "2024-01-15T10:30:00Z",
        }),
      );

      try {
        listThemeFilesCommand(tempDir);

        const calls = (console.log as ReturnType<typeof mock>).mock.calls;
        const allOutput = calls.map((call) => call.join(" ")).join("\n");
        expect(allOutput).toContain("dated");
      } finally {
        fs.rmSync(tempDir, { recursive: true });
      }
    });

    it("should handle theme without description", async () => {
      const { listThemeFilesCommand } = await import(
        "../../../../src/cli/theme-gen"
      );
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));

      fs.writeFileSync(
        path.join(tempDir, "nodesc.theme.json"),
        JSON.stringify({ name: "nodesc" }),
      );

      try {
        listThemeFilesCommand(tempDir);

        const calls = (console.log as ReturnType<typeof mock>).mock.calls;
        const allOutput = calls.map((call) => call.join(" ")).join("\n");
        expect(allOutput).toContain("nodesc");
      } finally {
        fs.rmSync(tempDir, { recursive: true });
      }
    });

    it("should handle theme with unknown name field", async () => {
      const { listThemeFilesCommand } = await import(
        "../../../../src/cli/theme-gen"
      );
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logsdx-test-"));

      fs.writeFileSync(
        path.join(tempDir, "noname.theme.json"),
        JSON.stringify({ schema: {} }),
      );

      try {
        listThemeFilesCommand(tempDir);

        const calls = (console.log as ReturnType<typeof mock>).mock.calls;
        const allOutput = calls.map((call) => call.join(" ")).join("\n");
        expect(allOutput).toContain("Unknown");
      } finally {
        fs.rmSync(tempDir, { recursive: true });
      }
    });
  });
});
