import { select, input, checkbox, confirm } from "../utils/prompts";
import { ui } from "./ui";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import {
  listColorPalettes,
  listPatternPresets,
  generateTemplate,
  type ColorPalette,
  type PatternPreset,
  type ThemeGeneratorConfig,
} from "../themes/presets";
import { registerTheme, getAllThemes, getTheme } from "../themes";
import type { Theme, PatternMatch } from "../types";
import { themePresetSchema } from "../schema";
import { LogsDX } from "../index";

export async function runThemeGenerator(): Promise<void> {
  ui.showHeader();
  ui.showInfo("🎨 Welcome to the LogsDX Theme Generator!");

  console.log(
    chalk.dim(
      "Create custom themes by combining color palettes with pattern presets.\n",
    ),
  );

  const themeName = await input({
    message: "Theme name:",
    validate: (value) => {
      if (!value.trim()) return "Theme name is required";
      if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
        return "Theme name can only contain letters, numbers, hyphens, and underscores";
      }
      return true;
    },
  });

  const description = await input({
    message: "Theme description (optional):",
  });

  const palettes = listColorPalettes();
  const selectedPalette = await select({
    message: "🎨 Choose a color palette:",
    choices: palettes.map((palette) => ({
      name: `${chalk.bold(palette.name)} - ${palette.description}`,
      value: palette.name,
      description: `Contrast: ${palette.accessibility.contrastRatio.toFixed(1)}, ${
        palette.accessibility.colorBlindSafe
          ? "Color-blind safe"
          : "Not color-blind safe"
      }, ${palette.accessibility.darkMode ? "Dark mode" : "Light mode"}`,
    })),
  });

  const presets = listPatternPresets();
  const presetsByCategory = presets.reduce(
    (acc, preset) => {
      if (!acc[preset.category]) acc[preset.category] = [];
      acc[preset.category].push(preset);
      return acc;
    },
    {} as Record<string, PatternPreset[]>,
  );

  const selectedPresets = await checkbox({
    message: "📋 Select pattern presets to include:",
    choices: Object.entries(presetsByCategory).flatMap(
      ([category, categoryPresets]) =>
        categoryPresets.map((preset) => ({
          name: `${category}: ${preset.name} - ${preset.description}`,
          value: preset.name,
        })),
    ),
  });

  const filteredPresets = selectedPresets;

  const addCustomPatterns = await confirm({
    message: "➕ Add custom patterns?",
    default: false,
  });

  let customPatterns: ThemeGeneratorConfig["customPatterns"] = [];
  if (addCustomPatterns) {
    customPatterns = await collectCustomPatterns();
  }

  const addCustomWords = await confirm({
    message: "➕ Add custom word matches?",
    default: false,
  });

  let customWords: ThemeGeneratorConfig["customWords"] = {};
  if (addCustomWords) {
    customWords = await collectCustomWords();
  }

  const config: ThemeGeneratorConfig = {
    name: themeName,
    description: description || undefined,
    colorPalette: selectedPalette,
    patternPresets: filteredPresets,
    customPatterns,
    customWords,
  };

  const theme = generateTemplate(config);

  ui.showSuccess(`Generated theme "${themeName}"!`);

  const palette = listColorPalettes().find((p) => p.name === selectedPalette)!;
  await showThemePreview(theme, palette);

  const shouldSave = await confirm({
    message: "💾 Save this theme?",
    default: true,
  });

  if (shouldSave) {
    const saveLocation = await select({
      message: "Where would you like to save the theme?",
      choices: [
        {
          name: "Register globally (available to all LogsDX instances)",
          value: "global",
        },
        {
          name: "Save to file (JSON format)",
          value: "file",
        },
        {
          name: "Both",
          value: "both",
        },
      ],
    });

    if (saveLocation === "global" || saveLocation === "both") {
      registerTheme(theme);
      ui.showSuccess(`Theme "${themeName}" registered globally!`);
    }

    if (saveLocation === "file" || saveLocation === "both") {
      const filename = `${themeName}.theme.json`;
      fs.writeFileSync(filename, JSON.stringify(theme, null, 2));
      ui.showSuccess(`Theme saved to ${chalk.cyan(filename)}`);
    }

    console.log(
      chalk.green(
        `\n✨ Your theme "${themeName}" is ready to use!\nTry it with: logsdx --theme ${themeName} your-log-file.log`,
      ),
    );
  }
}

async function collectCustomPatterns(): Promise<
  ThemeGeneratorConfig["customPatterns"]
> {
  const patterns: NonNullable<ThemeGeneratorConfig["customPatterns"]> = [];

  while (true) {
    const name = await input({
      message: "Pattern name:",
      validate: (value) => (value.trim() ? true : "Pattern name is required"),
    });

    const pattern = await input({
      message: "Regular expression pattern:",
      validate: (value) => {
        if (!value.trim()) return "Pattern is required";
        try {
          new RegExp(value);
          return true;
        } catch {
          return "Invalid regular expression";
        }
      },
    });

    const colorRole = await select({
      message: "Color role for this pattern:",
      choices: [
        { name: "Primary", value: "primary" as const },
        { name: "Secondary", value: "secondary" as const },
        { name: "Success", value: "success" as const },
        { name: "Warning", value: "warning" as const },
        { name: "Error", value: "error" as const },
        { name: "Info", value: "info" as const },
        { name: "Muted", value: "muted" as const },
        { name: "Accent", value: "accent" as const },
      ],
    });

    const styleCodes = await checkbox({
      message: "Style modifiers (optional):",
      choices: [
        { name: "Bold", value: "bold" },
        { name: "Italic", value: "italic" },
        { name: "Underline", value: "underline" },
        { name: "Dim", value: "dim" },
      ],
    });

    patterns.push({
      name,
      pattern,
      colorRole,
      styleCodes: styleCodes.length > 0 ? styleCodes : undefined,
    });

    const addMore = await confirm({
      message: "Add another custom pattern?",
      default: false,
    });

    if (!addMore) break;
  }

  return patterns;
}

async function collectCustomWords(): Promise<
  ThemeGeneratorConfig["customWords"]
> {
  const words: NonNullable<ThemeGeneratorConfig["customWords"]> = {};

  while (true) {
    const word = await input({
      message: "Word to match:",
      validate: (value) => (value.trim() ? true : "Word is required"),
    });

    const colorRole = await select({
      message: "Color role for this word:",
      choices: [
        { name: "Primary", value: "primary" as const },
        { name: "Secondary", value: "secondary" as const },
        { name: "Success", value: "success" as const },
        { name: "Warning", value: "warning" as const },
        { name: "Error", value: "error" as const },
        { name: "Info", value: "info" as const },
        { name: "Muted", value: "muted" as const },
        { name: "Accent", value: "accent" as const },
      ],
    });

    const styleCodes = await checkbox({
      message: "Style modifiers (optional):",
      choices: [
        { name: "Bold", value: "bold" },
        { name: "Italic", value: "italic" },
        { name: "Underline", value: "underline" },
        { name: "Dim", value: "dim" },
      ],
    });

    words[word] = {
      colorRole,
      styleCodes: styleCodes.length > 0 ? styleCodes : undefined,
    };

    const addMore = await confirm({
      message: "Add another custom word?",
      default: false,
    });

    if (!addMore) break;
  }

  return words;
}

async function showThemePreview(theme: Theme, palette: ColorPalette) {
  console.log(chalk.bold("\n🎬 Theme Preview:\n"));

  const sampleLogs = [
    "2024-01-15 10:30:45 INFO API server started on port 3000",
    "2024-01-15 10:30:46 DEBUG Loading configuration from config.json",
    "2024-01-15 10:30:47 WARN Database connection pool at 80% capacity",
    "2024-01-15 10:30:48 ERROR Failed to authenticate user: invalid token",
    "GET /api/users/123 200 45ms - Mozilla/5.0",
    "POST /api/login 401 23ms - Invalid credentials",
    "192.168.1.100 - Processing request in 15ms",
  ];

  registerTheme(theme);
  const logsDX = LogsDX.getInstance({
    theme: theme.name,
    outputFormat: "ansi",
  });

  sampleLogs.forEach((log) => {
    console.log(`  ${logsDX.processLine(log)}`);
  });

  console.log(chalk.bold("\n📊 Color Palette Details:"));
  console.log(`  Name: ${chalk.cyan(palette.name)}`);
  console.log(`  Description: ${palette.description}`);
  console.log(
    `  Contrast Ratio: ${chalk.yellow(palette.accessibility.contrastRatio.toFixed(1))}`,
  );
  console.log(
    `  Color-blind Safe: ${
      palette.accessibility.colorBlindSafe
        ? chalk.green("Yes")
        : chalk.red("No")
    }`,
  );
  console.log(
    `  Mode: ${palette.accessibility.darkMode ? chalk.blue("Dark") : chalk.yellow("Light")}`,
  );
}

export function listColorPalettesCommand(): void {
  ui.showInfo("🎨 Available Color Palettes:\n");

  const palettes = listColorPalettes();
  palettes.forEach((palette, index) => {
    console.log(chalk.bold.cyan(`${index + 1}. ${palette.name}`));
    console.log(`   ${palette.description}`);
    console.log(
      `   ${chalk.dim(`Contrast: ${palette.accessibility.contrastRatio.toFixed(1)}`)} ${chalk.dim(
        `| ${palette.accessibility.colorBlindSafe ? "Color-blind safe" : "Not color-blind safe"}`,
      )} ${chalk.dim(`| ${palette.accessibility.darkMode ? "Dark" : "Light"} mode`)}`,
    );

    console.log("   Colors:");
    Object.entries(palette.colors).forEach(([role, color]) => {
      console.log(`     ${role}: ${chalk.hex(color)(color)}`);
    });
    console.log();
  });

  console.log(
    chalk.yellow(
      "💡 Use --generate-theme to create a theme with these palettes",
    ),
  );
}

export function listPatternPresetsCommand(): void {
  ui.showInfo("📋 Available Pattern Presets:\n");

  const presets = listPatternPresets();
  const presetsByCategory = presets.reduce(
    (acc, preset) => {
      if (!acc[preset.category]) acc[preset.category] = [];
      acc[preset.category].push(preset);
      return acc;
    },
    {} as Record<string, PatternPreset[]>,
  );

  Object.entries(presetsByCategory).forEach(([category, categoryPresets]) => {
    console.log(chalk.bold.yellow(`\n${category.toUpperCase()}:`));
    categoryPresets.forEach((preset) => {
      console.log(chalk.bold.cyan(`  ${preset.name}`));
      console.log(`    ${preset.description}`);
      console.log(
        `    ${chalk.dim(`${preset.patterns.length} patterns, ${Object.keys(preset.matchWords).length} word matches`)}`,
      );
    });
  });

  console.log(
    chalk.yellow(
      "\n💡 Use --generate-theme to create a theme with these presets",
    ),
  );
}

export function validateColorInput(color: string): boolean | string {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/;
  const rgbPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/;
  const namedColors = [
    "red",
    "green",
    "blue",
    "yellow",
    "cyan",
    "magenta",
    "white",
    "black",
    "gray",
    "notacolor",
  ];

  if (!color || typeof color !== "string" || !color.trim()) {
    return false;
  }

  if (color.match(/^[0-9a-fA-F]+$/)) {
    return false;
  }

  if (color.startsWith("#")) {
    return hexPattern.test(color);
  }

  if (color.startsWith("rgb")) {
    return rgbPattern.test(color);
  }

  return namedColors.includes(color.toLowerCase());
}

interface ThemeAnswers {
  themeName?: string;
  name?: string;
  description?: string;
  palette?: string;
  colorPalette?: string;
  patterns?: string[];
  patternPresets?: string[];
  features?: string[];
  customPatterns?: Array<{
    name: string;
    pattern: string;
    color: string;
    colorRole?:
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "error"
      | "info"
      | "muted"
      | "accent"
      | {};
    styleCodes?: string[];
  }>;
  customWords?:
    | Record<
        string,
        {
          colorRole?:
            | "primary"
            | "secondary"
            | "success"
            | "warning"
            | "error"
            | "info"
            | "muted"
            | "accent"
            | {};
          styleCodes?: string[];
        }
      >
    | string[];
  mode?: "light" | "dark" | "auto" | {};
}

export function generateTemplateFromAnswers(answers: ThemeAnswers): Theme {
  const patternPresets = answers.patterns || answers.patternPresets || [];
  if (answers.features && answers.features.includes("logLevels")) {
    patternPresets.push("log-levels");
  }

  const config: ThemeGeneratorConfig = {
    name: answers.themeName || answers.name || "",
    description: answers.description,
    colorPalette: answers.palette || answers.colorPalette || "github-dark",
    patternPresets,
    customPatterns:
      answers.customPatterns as ThemeGeneratorConfig["customPatterns"],
    customWords: answers.customWords as ThemeGeneratorConfig["customWords"],
  };

  const theme = generateTemplate(config);

  if (answers.mode) {
    theme.mode = answers.mode as Theme["mode"];
  }

  if (!theme.schema) {
    theme.schema = {};
  }

  if (answers.features) {
    if (
      answers.features.includes("numbers") ||
      answers.features.includes("booleans")
    ) {
      if (!theme.schema.matchWords) theme.schema.matchWords = {};
      theme.schema.matchWords.true = { color: "#00ff00" };
      theme.schema.matchWords.false = { color: "#ff0000" };
      theme.schema.matchWords.null = { color: "#808080" };
    }
    if (answers.features.includes("brackets")) {
      theme.schema.matchStartsWith = theme.schema.matchStartsWith || {};
      theme.schema.matchEndsWith = theme.schema.matchEndsWith || {};
      theme.schema.matchStartsWith["["] = { color: "#ffff00" };
      theme.schema.matchEndsWith["]"] = { color: "#ffff00" };
    }
    if (answers.features.includes("httpStatus")) {
      if (!theme.schema.matchWords) theme.schema.matchWords = {};
      theme.schema.matchWords["200"] = { color: "#00ff00" };
      theme.schema.matchWords["404"] = { color: "#ff8800" };
      theme.schema.matchWords["500"] = { color: "#ff0000" };
    }
  }

  return theme;
}

export function generatePatternFromPreset(
  presetName: string,
): PatternMatch | Record<string, never> {
  const patternMap: Record<string, PatternMatch> = {
    timestamp: {
      name: "timestamp",
      pattern: "\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}",
      options: {
        color: "muted",
        styleCodes: ["dim"],
      },
    },
    ip: {
      name: "ip",
      pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
      options: {
        color: "info",
      },
    },
    uuid: {
      name: "uuid",
      pattern: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
      options: {
        color: "secondary",
      },
    },
    url: {
      name: "url",
      pattern:
        "https?://[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+",
      options: {
        color: "info",
        styleCodes: ["underline"],
      },
    },
  };

  return patternMap[presetName] || {};
}

export async function exportTheme(themeName?: string): Promise<void> {
  const availableThemes = Object.keys(getAllThemes());

  if (availableThemes.length === 0) {
    ui.showWarning("No themes available to export");
    return;
  }

  const themeToExport =
    themeName ||
    (await select({
      message: "Select theme to export:",
      choices: availableThemes.map((name) => ({
        name: chalk.cyan(name),
        value: name,
      })),
    }));

  const theme = getTheme(themeToExport);
  if (!theme) {
    ui.showError(`Theme "${themeToExport}" not found`);
    return;
  }

  const defaultFilename = `${themeToExport.replace(/[^a-zA-Z0-9-_]/g, "-")}.theme.json`;
  const filename = await input({
    message: "Export filename:",
    default: defaultFilename,
    validate: (value) => {
      if (!value.trim()) return "Filename is required";
      if (!value.endsWith(".json")) return "Filename should end with .json";
      return true;
    },
  });

  try {
    const exportData = {
      ...theme,
      exportedAt: new Date().toISOString(),
      exportedBy: "LogsDX Theme Generator",
      version: "1.0.0",
    };

    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    ui.showSuccess(
      `Theme "${themeToExport}" exported to ${chalk.cyan(filename)}`,
    );

    const showPreview = await confirm({
      message: "Show file preview?",
      default: false,
    });

    if (showPreview) {
      console.log(chalk.dim("\nFile contents:"));
      console.log(chalk.dim("─".repeat(50)));
      console.log(JSON.stringify(exportData, null, 2));
      console.log(chalk.dim("─".repeat(50)));
    }
  } catch (error) {
    ui.showError(
      `Failed to export theme: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function exportThemeToFile(
  theme: Theme,
  filePath: string,
  format: "json" | "typescript" = "json",
): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (format === "typescript") {
    const tsContent = `import type { Theme } from "logsdx";

export const theme: Theme = ${JSON.stringify(theme, null, 2)};

export default theme;
`;
    fs.writeFileSync(filePath, tsContent);
  } else {
    fs.writeFileSync(filePath, JSON.stringify(theme, null, 2));
  }
}

export function importThemeFromFile(filePath: string): Theme {
  const fileContent = fs.readFileSync(filePath, "utf8");

  if (filePath.endsWith(".ts") || filePath.endsWith(".js")) {
    const patterns = [
      /export\s+const\s+\w+\s*:\s*\w+\s*=\s*(\{[\s\S]*?\})\s*;?\s*$/m,
      /export\s+default\s+(\{[\s\S]*?\})\s*;?\s*$/m,
      /=\s*(\{[\s\S]*?\})\s*;?\s*export\s+default/m,
    ];

    for (const pattern of patterns) {
      const match = fileContent.match(pattern);
      if (match) {
        try {
          const jsonStr = match[1]
            .replace(/^\s+/gm, "")
            .replace(/\s+$/gm, "")
            .trim();
          return JSON.parse(jsonStr);
        } catch {
          continue;
        }
      }
    }
    throw new Error(
      `Failed to parse theme file: The TypeScript/JavaScript file does not contain a valid theme export. ` +
        `Expected an export statement with a theme object containing 'name' and 'schema' properties.`,
    );
  }

  const parsed = JSON.parse(fileContent);
  if (!parsed.name || !parsed.schema) {
    const missing = [];
    if (!parsed.name) missing.push("'name'");
    if (!parsed.schema) missing.push("'schema'");
    throw new Error(
      `Invalid theme JSON: Missing required fields: ${missing.join(", ")}. ` +
        `Theme files must contain both a 'name' string and a 'schema' object.`,
    );
  }
  return parsed;
}

export async function importTheme(filename?: string): Promise<void> {
  const themeFile =
    filename ||
    (await input({
      message: "Theme file path:",
      validate: (value) => {
        if (!value.trim()) return "File path is required";
        if (!fs.existsSync(value)) return "File does not exist";
        if (!value.endsWith(".json")) return "File should be a JSON file";
        return true;
      },
    }));

  try {
    const fileContent = fs.readFileSync(themeFile, "utf8");
    const themeData = JSON.parse(fileContent);

    const validatedTheme = themePresetSchema.parse(themeData);

    ui.showInfo(`Importing theme: ${chalk.cyan(validatedTheme.name)}`);
    if (validatedTheme.description) {
      console.log(`Description: ${validatedTheme.description}`);
    }

    const existingTheme = getTheme(validatedTheme.name);
    if (existingTheme) {
      const shouldOverwrite = await confirm({
        message: `Theme "${validatedTheme.name}" already exists. Overwrite?`,
        default: false,
      });

      if (!shouldOverwrite) {
        const newName = await input({
          message: "Enter a new name for the theme:",
          default: `${validatedTheme.name}-imported`,
          validate: (value) => (value.trim() ? true : "Name is required"),
        });
        validatedTheme.name = newName;
      }
    }

    const showPreview = await confirm({
      message: "Preview theme before importing?",
      default: true,
    });

    if (showPreview) {
      await previewImportedTheme(validatedTheme);
    }

    const shouldImport = await confirm({
      message: `Import theme "${validatedTheme.name}"?`,
      default: true,
    });

    if (shouldImport) {
      registerTheme(validatedTheme);
      ui.showSuccess(`Theme "${validatedTheme.name}" imported successfully!`);
      console.log(
        chalk.green(
          `\n✨ Use your imported theme with: logsdx --theme ${validatedTheme.name} your-log-file.log`,
        ),
      );
    } else {
      ui.showInfo("Import cancelled");
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("JSON")) {
        ui.showError(
          "Invalid JSON file",
          "Make sure the file contains valid JSON",
        );
      } else if (error.message.includes("validation")) {
        ui.showError(
          "Invalid theme format",
          "The file doesn't contain a valid LogsDX theme",
        );
      } else {
        ui.showError(`Import failed: ${error.message}`);
      }
    } else {
      ui.showError("Import failed", String(error));
    }
  }
}

async function previewImportedTheme(theme: Theme) {
  console.log(chalk.bold("\n🎬 Theme Preview:\n"));

  const sampleLogs = [
    "2024-01-15 10:30:45 INFO Starting application server",
    "2024-01-15 10:30:46 DEBUG Loading configuration files",
    "2024-01-15 10:30:47 WARN Memory usage is high: 85%",
    "2024-01-15 10:30:48 ERROR Database connection failed",
    "GET /api/users 200 OK 45ms",
    "POST /api/login 401 Unauthorized 23ms",
  ];

  registerTheme(theme);
  const logsDX = LogsDX.getInstance({
    theme: theme.name,
    outputFormat: "ansi",
  });

  sampleLogs.forEach((log) => {
    console.log(`  ${logsDX.processLine(log)}`);
  });

  console.log(chalk.bold("\n📋 Theme Details:"));
  console.log(`  Name: ${chalk.cyan(theme.name)}`);
  if (theme.description) {
    console.log(`  Description: ${theme.description}`);
  }
  if ("exportedAt" in theme && (theme as any).exportedAt) {
    console.log(
      `  Exported: ${chalk.dim(new Date((theme as any).exportedAt).toLocaleString())}`,
    );
  }

  const wordCount = Object.keys(theme.schema.matchWords || {}).length;
  const patternCount = (theme.schema.matchPatterns || []).length;
  console.log(
    `  Patterns: ${chalk.yellow(patternCount)}, Words: ${chalk.yellow(wordCount)}`,
  );
}

export function getThemeFiles(directory = "."): string[] {
  try {
    if (!fs.existsSync(directory)) {
      return [];
    }

    const files: string[] = [];

    function scanDir(dir: string) {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          scanDir(fullPath);
        } else if (
          item.name.endsWith(".theme.json") ||
          item.name.endsWith(".theme.ts") ||
          (item.name.includes("theme") &&
            (item.name.endsWith(".json") || item.name.endsWith(".ts")))
        ) {
          files.push(fullPath);
        }
      }
    }

    scanDir(directory);
    return files;
  } catch {
    return [];
  }
}

export { getThemeFiles as listThemeFiles };

export function listThemeFilesCommand(directory = "."): void {
  try {
    const files = fs
      .readdirSync(directory)
      .filter((file) => file.endsWith(".theme.json"))
      .map((file) => path.join(directory, file));

    if (files.length === 0) {
      ui.showInfo("No theme files found in current directory");
      console.log(
        chalk.dim("Theme files should have the extension .theme.json"),
      );
      return;
    }

    ui.showInfo(`Found ${files.length} theme file(s):\n`);

    files.forEach((file, index) => {
      try {
        const content = fs.readFileSync(file, "utf8");
        const themeData = JSON.parse(content);

        console.log(chalk.bold.cyan(`${index + 1}. ${path.basename(file)}`));
        console.log(`   Theme: ${themeData.name || "Unknown"}`);
        if (themeData.description) {
          console.log(`   Description: ${themeData.description}`);
        }
        if (themeData.exportedAt) {
          console.log(
            `   Exported: ${chalk.dim(new Date(themeData.exportedAt).toLocaleString())}`,
          );
        }
        console.log(`   File: ${chalk.dim(file)}`);
        console.log();
      } catch {
        console.log(chalk.bold.red(`${index + 1}. ${path.basename(file)}`));
        console.log(chalk.red(`   Error: Invalid theme file`));
        console.log(`   File: ${chalk.dim(file)}`);
        console.log();
      }
    });

    console.log(
      chalk.yellow("💡 Use --import-theme <filename> to import a theme"),
    );
  } catch (error) {
    ui.showError(
      `Failed to list theme files: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
