import { describe, it, expect, beforeEach, afterEach, vi } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import {
  exportThemeToFile,
  importThemeFromFile,
  listThemeFiles,
} from "./transporter";
import type { Theme } from "../../types";

// Create a temporary test directory
const TEST_DIR = join(process.cwd(), ".test-themes");

describe("Theme Transporter", () => {
  beforeEach(() => {
    // Create test directory
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  const sampleTheme: Theme = {
    name: "test-theme",
    description: "A test theme",
    mode: "dark",
    schema: {
      defaultStyle: { color: "#ffffff" },
      matchWords: {
        ERROR: { color: "#ff0000", styleCodes: ["bold"] },
        WARN: { color: "#ffaa00" },
        INFO: { color: "#0099ff" },
      },
      matchPatterns: [
        {
          name: "timestamp",
          pattern: "\\d{4}-\\d{2}-\\d{2}",
          options: { color: "#888888" },
        },
      ],
    },
  };

  describe("exportThemeToFile", () => {
    it("should export theme to JSON file", () => {
      const filePath = join(TEST_DIR, "exported-theme.json");
      exportThemeToFile(sampleTheme, filePath, "json");

      expect(existsSync(filePath)).toBe(true);

      const content = readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      expect(parsed.name).toBe("test-theme");
      expect(parsed.description).toBe("A test theme");
      expect(parsed.schema.matchWords.ERROR.color).toBe("#ff0000");
    });

    it("should export theme to TypeScript file", () => {
      const filePath = join(TEST_DIR, "exported-theme.ts");
      exportThemeToFile(sampleTheme, filePath, "typescript");

      expect(existsSync(filePath)).toBe(true);

      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("import type { Theme }");
      expect(content).toContain("export const theme");
      expect(content).toContain('"test-theme"');
    });

    it("should create directory if it doesn't exist", () => {
      const nestedPath = join(TEST_DIR, "nested", "dir", "theme.json");
      exportThemeToFile(sampleTheme, nestedPath, "json");

      expect(existsSync(nestedPath)).toBe(true);
    });

    it("should default to JSON format", () => {
      const filePath = join(TEST_DIR, "default-format.json");
      exportThemeToFile(sampleTheme, filePath);

      expect(existsSync(filePath)).toBe(true);
      const content = readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      expect(parsed.name).toBe("test-theme");
    });
  });

  describe("importThemeFromFile", () => {
    it("should import theme from JSON file", () => {
      const filePath = join(TEST_DIR, "import-test.json");
      writeFileSync(filePath, JSON.stringify(sampleTheme, null, 2));

      const imported = importThemeFromFile(filePath);
      expect(imported.name).toBe("test-theme");
      expect(imported.description).toBe("A test theme");
      expect(imported.schema.matchWords?.ERROR.color).toBe("#ff0000");
    });

    it("should import theme from TypeScript file", () => {
      const filePath = join(TEST_DIR, "import-test.ts");
      const tsContent = `
        import type { Theme } from 'logsdx';
        
        export const theme: Theme = ${JSON.stringify(sampleTheme, null, 2)};
        
        export default theme;
      `;
      writeFileSync(filePath, tsContent);

      const imported = importThemeFromFile(filePath);
      expect(imported.name).toBe("test-theme");
      expect(imported.schema.matchWords?.ERROR.color).toBe("#ff0000");
    });

    it("should validate imported theme", () => {
      const filePath = join(TEST_DIR, "invalid-theme.json");
      const invalidTheme = {
        // Missing required fields
        description: "Invalid theme",
      };
      writeFileSync(filePath, JSON.stringify(invalidTheme, null, 2));

      expect(() => importThemeFromFile(filePath)).toThrow();
    });

    it("should handle non-existent file", () => {
      const filePath = join(TEST_DIR, "non-existent.json");
      expect(() => importThemeFromFile(filePath)).toThrow();
    });

    it("should handle malformed JSON", () => {
      const filePath = join(TEST_DIR, "malformed.json");
      writeFileSync(filePath, "{ invalid json content");

      expect(() => importThemeFromFile(filePath)).toThrow();
    });
  });

  describe("listThemeFiles", () => {
    it("should list theme files in directory", () => {
      // Create some theme files
      writeFileSync(join(TEST_DIR, "theme1.json"), JSON.stringify(sampleTheme));
      writeFileSync(join(TEST_DIR, "theme2.json"), JSON.stringify(sampleTheme));
      writeFileSync(
        join(TEST_DIR, "theme3.ts"),
        `export const theme = ${JSON.stringify(sampleTheme)}`,
      );
      writeFileSync(join(TEST_DIR, "not-a-theme.txt"), "some text");

      const files = listThemeFiles(TEST_DIR);
      expect(files).toHaveLength(3);
      expect(files).toContain(join(TEST_DIR, "theme1.json"));
      expect(files).toContain(join(TEST_DIR, "theme2.json"));
      expect(files).toContain(join(TEST_DIR, "theme3.ts"));
      expect(files).not.toContain(join(TEST_DIR, "not-a-theme.txt"));
    });

    it("should return empty array for non-existent directory", () => {
      const files = listThemeFiles(join(TEST_DIR, "non-existent"));
      expect(files).toEqual([]);
    });

    it("should handle empty directory", () => {
      const emptyDir = join(TEST_DIR, "empty");
      mkdirSync(emptyDir);

      const files = listThemeFiles(emptyDir);
      expect(files).toEqual([]);
    });

    it("should find themes in nested directories", () => {
      const nestedDir = join(TEST_DIR, "nested");
      mkdirSync(join(nestedDir, "deep"), { recursive: true });

      writeFileSync(join(nestedDir, "theme.json"), JSON.stringify(sampleTheme));
      writeFileSync(
        join(nestedDir, "deep", "deep-theme.json"),
        JSON.stringify(sampleTheme),
      );

      const files = listThemeFiles(nestedDir);
      expect(files).toHaveLength(2);
      expect(files).toContain(join(nestedDir, "theme.json"));
      expect(files).toContain(join(nestedDir, "deep", "deep-theme.json"));
    });
  });

  describe("Integration", () => {
    it("should round-trip theme through export and import", () => {
      const filePath = join(TEST_DIR, "round-trip.json");

      // Export
      exportThemeToFile(sampleTheme, filePath, "json");

      // Import
      const imported = importThemeFromFile(filePath);

      // Verify
      expect(imported).toEqual(sampleTheme);
    });

    it("should handle TypeScript round-trip", () => {
      const filePath = join(TEST_DIR, "round-trip.ts");

      // Export as TypeScript
      exportThemeToFile(sampleTheme, filePath, "typescript");

      // Import
      const imported = importThemeFromFile(filePath);

      // Verify core properties (TS export adds formatting)
      expect(imported.name).toBe(sampleTheme.name);
      expect(imported.description).toBe(sampleTheme.description);
      expect(imported.mode).toBe(sampleTheme.mode);
      expect(imported.schema.matchWords?.ERROR).toEqual(
        sampleTheme.schema.matchWords?.ERROR,
      );
    });
  });
});
