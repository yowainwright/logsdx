import { select, input, checkbox, confirm } from "../../utils/prompts";
import { ui } from "../ui";
import colors, { hex } from "../../utils/colors";
import fs from "fs";
import path from "path";
import {
  listColorPalettes,
  listPatternPresets,
  generateTemplate,
  type ColorPalette,
  type PatternPreset,
  type ThemeGeneratorConfig,
} from "../../themes/presets";
import { registerTheme, getAllThemes, getTheme } from "../../themes";
import type { Theme, PatternMatch } from "../../types";
import type { ThemeAnswers } from "../types";
import {
  HEX_COLOR_PATTERN,
  RGB_COLOR_PATTERN,
  NAMED_COLORS,
} from "../constants";
import { parseTheme } from "../../schema";
import { LogsDX } from "../../index";
import { createLogger } from "../../utils/logger";

const log = createLogger("theme-gen");

function serializePattern(pattern: PatternMatch): PatternMatch {
  const patternValue =
    pattern.pattern instanceof RegExp
      ? pattern.pattern.source
      : pattern.pattern;
  return {
    ...pattern,
    pattern: patternValue,
  };
}

function formatPaletteDescription(palette: ColorPalette): string {
  const contrast = palette.accessibility.contrastRatio.toFixed(1);
  const colorBlindLabel = palette.accessibility.colorBlindSafe
    ? "Color-blind safe"
    : "Not color-blind safe";
  const modeLabel = palette.accessibility.darkMode ? "Dark mode" : "Light mode";
  return `Contrast: ${contrast}, ${colorBlindLabel}, ${modeLabel}`;
}

type CustomPattern = NonNullable<
  ThemeGeneratorConfig["customPatterns"]
>[number];
type CustomWord = NonNullable<ThemeGeneratorConfig["customWords"]>[string];
type ThemeColorRole = CustomPattern["colorRole"];

const COLOR_ROLE_CHOICES = [
  { name: "Primary", value: "primary" as const },
  { name: "Secondary", value: "secondary" as const },
  { name: "Success", value: "success" as const },
  { name: "Warning", value: "warning" as const },
  { name: "Error", value: "error" as const },
  { name: "Info", value: "info" as const },
  { name: "Muted", value: "muted" as const },
  { name: "Accent", value: "accent" as const },
];

const STYLE_CODE_CHOICES = [
  { name: "Bold", value: "bold" },
  { name: "Italic", value: "italic" },
  { name: "Underline", value: "underline" },
  { name: "Dim", value: "dim" },
];

async function selectColorRole(message: string): Promise<ThemeColorRole> {
  const colorRole = await select({
    message,
    choices: COLOR_ROLE_CHOICES,
  });
  return colorRole as ThemeColorRole;
}

async function selectStyleCodes(message: string): Promise<string[]> {
  return checkbox({ message, choices: STYLE_CODE_CHOICES });
}

async function collectThemeName(): Promise<string> {
  return input({
    message: "Theme name:",
    validate: (value) => {
      if (!value.trim()) return "Theme name is required";
      if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
        return "Theme name can only contain letters, numbers, hyphens, and underscores";
      }
      return true;
    },
  });
}

async function selectThemePalette(): Promise<string> {
  const palettes = listColorPalettes();
  const choices = palettes.map((palette) => ({
    name: `${colors.bold(palette.name)} - ${palette.description}`,
    value: palette.name,
    description: formatPaletteDescription(palette),
  }));
  return select({ message: "Choose a color palette:", choices });
}

async function selectPatternPresets(): Promise<string[]> {
  const presets = listPatternPresets();
  const presetsByCategory = presets.reduce(
    (acc, preset) => {
      if (!acc[preset.category]) acc[preset.category] = [];
      acc[preset.category].push(preset);
      return acc;
    },
    {} as Record<string, PatternPreset[]>,
  );
  const choices = Object.entries(presetsByCategory).flatMap(
    ([category, categoryPresets]) =>
      categoryPresets.map((preset) => ({
        name: `${category}: ${preset.name} - ${preset.description}`,
        value: preset.name,
      })),
  );
  return checkbox({ message: "Select pattern presets to include:", choices });
}

async function collectOptionalPatterns(): Promise<
  ThemeGeneratorConfig["customPatterns"]
> {
  const shouldAdd = await confirm({
    message: "Add custom patterns?",
    default: false,
  });
  if (!shouldAdd) return [];
  return collectCustomPatterns();
}

async function collectOptionalWords(): Promise<
  ThemeGeneratorConfig["customWords"]
> {
  const shouldAdd = await confirm({
    message: "Add custom word matches?",
    default: false,
  });
  if (!shouldAdd) return {};
  return collectCustomWords();
}

async function collectThemeConfig(): Promise<ThemeGeneratorConfig> {
  const name = await collectThemeName();
  const description = await input({ message: "Theme description (optional):" });
  const colorPalette = await selectThemePalette();
  const patternPresets = await selectPatternPresets();
  const customPatterns = await collectOptionalPatterns();
  const customWords = await collectOptionalWords();

  return {
    name,
    description: description || undefined,
    colorPalette,
    patternPresets,
    customPatterns,
    customWords,
  };
}

function serializeThemeForFile(theme: Theme): Theme {
  return {
    ...theme,
    schema: {
      ...theme.schema,
      matchPatterns: theme.schema.matchPatterns?.map(serializePattern),
    },
  };
}

async function saveGeneratedTheme(
  theme: Theme,
  themeName: string,
): Promise<void> {
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

  const shouldRegister = saveLocation === "global" || saveLocation === "both";
  const shouldWriteFile = saveLocation === "file" || saveLocation === "both";
  if (shouldRegister) {
    registerTheme(theme);
    ui.showSuccess(`Theme "${themeName}" registered globally!`);
  }

  if (shouldWriteFile) {
    const filename = `${themeName}.theme.json`;
    fs.writeFileSync(filename, JSON.stringify(theme, null, 2));
    ui.showSuccess(`Theme saved to ${colors.cyan(filename)}`);
  }

  const readyMessage = `\nYour theme "${themeName}" is ready to use!\nTry it with: logsdx --theme ${themeName} your-log-file.log`;
  log.print(colors.green(readyMessage));
}

export async function runThemeGenerator(): Promise<void> {
  ui.showHeader();
  ui.showInfo("Welcome to the LogsDX Theme Generator");

  const intro =
    "Create custom themes by combining color palettes with pattern presets.";
  log.debug(colors.dim(intro));

  const config = await collectThemeConfig();
  const theme = generateTemplate(config);

  ui.showSuccess(`Generated theme "${config.name}"!`);

  const palette = listColorPalettes().find(
    (item) => item.name === config.colorPalette,
  )!;
  await showThemePreview(theme, palette);

  const shouldSave = await confirm({
    message: "Save this theme?",
    default: true,
  });

  if (shouldSave) await saveGeneratedTheme(theme, config.name);
}

async function collectCustomPatterns(): Promise<
  ThemeGeneratorConfig["customPatterns"]
> {
  const patterns: CustomPattern[] = [];
  while (true) {
    patterns.push(await collectCustomPattern());
    const addMore = await confirm({
      message: "Add another custom pattern?",
      default: false,
    });
    if (!addMore) break;
  }
  return patterns;
}

async function collectCustomPattern(): Promise<CustomPattern> {
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
  const colorRole = await selectColorRole("Color role for this pattern:");
  const styleCodes = await selectStyleCodes("Style modifiers (optional):");
  const patternStyleCodes = styleCodes.length > 0 ? styleCodes : undefined;
  return { name, pattern, colorRole, styleCodes: patternStyleCodes };
}

async function collectCustomWords(): Promise<
  ThemeGeneratorConfig["customWords"]
> {
  const words: Record<string, CustomWord> = {};
  while (true) {
    const entry = await collectCustomWord();
    words[entry.word] = entry.config;
    const addMore = await confirm({
      message: "Add another custom word?",
      default: false,
    });

    if (!addMore) break;
  }

  return words;
}

async function collectCustomWord(): Promise<{
  word: string;
  config: CustomWord;
}> {
  const word = await input({
    message: "Word to match:",
    validate: (value) => (value.trim() ? true : "Word is required"),
  });
  const colorRole = await selectColorRole("Color role for this word:");
  const styleCodes = await selectStyleCodes("Style modifiers (optional):");
  const wordStyleCodes = styleCodes.length > 0 ? styleCodes : undefined;
  return {
    word,
    config: { colorRole, styleCodes: wordStyleCodes },
  };
}

async function showThemePreview(theme: Theme, palette: ColorPalette) {
  console.log(colors.bold("\nTheme Preview:\n"));

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
  const logsDX = await LogsDX.getInstance({
    theme: theme.name,
    outputFormat: "ansi",
  });

  sampleLogs.forEach((log) => {
    console.log(`  ${logsDX.processLine(log)}`);
  });

  console.log(colors.bold("\nColor Palette Details:"));
  console.log(`  Name: ${colors.cyan(palette.name)}`);
  console.log(`  Description: ${palette.description}`);
  console.log(
    `  Contrast Ratio: ${colors.yellow(palette.accessibility.contrastRatio.toFixed(1))}`,
  );
  console.log(
    `  Color-blind Safe: ${
      palette.accessibility.colorBlindSafe
        ? colors.green("Yes")
        : colors.red("No")
    }`,
  );
  console.log(
    `  Mode: ${palette.accessibility.darkMode ? colors.blue("Dark") : colors.yellow("Light")}`,
  );
}

export function listColorPalettesCommand(): void {
  ui.showInfo("Available Color Palettes:\n");

  const palettes = listColorPalettes();
  palettes.forEach((palette, index) => {
    console.log(colors.bold.cyan(`${index + 1}. ${palette.name}`));
    console.log(`   ${palette.description}`);
    console.log(
      `   ${colors.dim(`Contrast: ${palette.accessibility.contrastRatio.toFixed(1)}`)} ${colors.dim(
        `| ${palette.accessibility.colorBlindSafe ? "Color-blind safe" : "Not color-blind safe"}`,
      )} ${colors.dim(`| ${palette.accessibility.darkMode ? "Dark" : "Light"} mode`)}`,
    );

    console.log("   Colors:");
    Object.entries(palette.colors).forEach(([role, color]) => {
      console.log(`     ${role}: ${hex(color)(color)}`);
    });
    console.log();
  });

  console.log(
    colors.yellow("Use --generate-theme to create a theme with these palettes"),
  );
}

export function listPatternPresetsCommand(): void {
  ui.showInfo("Available Pattern Presets:\n");

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
    console.log(colors.bold.yellow(`\n${category.toUpperCase()}:`));
    categoryPresets.forEach((preset) => {
      console.log(colors.bold.cyan(`  ${preset.name}`));
      console.log(`    ${preset.description}`);
      console.log(
        `    ${colors.dim(`${preset.patterns.length} patterns, ${Object.keys(preset.matchWords).length} word matches`)}`,
      );
    });
  });

  console.log(
    colors.yellow(
      "\nUse --generate-theme to create a theme with these presets",
    ),
  );
}

export function validateColorInput(color: string): boolean | string {
  const isString = typeof color === "string";
  if (!isString) return false;
  if (!color.trim()) return false;

  if (color.match(/^[0-9a-fA-F]+$/)) {
    return false;
  }

  if (color.startsWith("#")) {
    return HEX_COLOR_PATTERN.test(color);
  }

  if (color.startsWith("rgb")) {
    return RGB_COLOR_PATTERN.test(color);
  }

  return NAMED_COLORS.includes(
    color.toLowerCase() as (typeof NAMED_COLORS)[number],
  );
}

function getPatternPresetsFromAnswers(answers: ThemeAnswers): string[] {
  const patternPresets = answers.patterns || answers.patternPresets || [];
  const hasLogLevels = answers.features?.includes("logLevels");
  if (hasLogLevels) patternPresets.push("log-levels");
  return patternPresets;
}

function createThemeConfig(
  answers: ThemeAnswers,
  patternPresets: string[],
): ThemeGeneratorConfig {
  const name = answers.themeName || answers.name || "";
  const colorPalette = answers.palette || answers.colorPalette || "github-dark";
  return {
    name,
    description: answers.description,
    colorPalette,
    patternPresets,
    customPatterns:
      answers.customPatterns as ThemeGeneratorConfig["customPatterns"],
    customWords: answers.customWords as ThemeGeneratorConfig["customWords"],
  };
}

function applyFeatureStyles(theme: Theme, features?: string[]): void {
  if (!features) return;
  if (!theme.schema) theme.schema = {};

  const schema = theme.schema;
  const hasNumericValues =
    features.includes("numbers") || features.includes("booleans");
  if (hasNumericValues) {
    schema.matchWords = schema.matchWords || {};
    schema.matchWords.true = { color: "#00ff00" };
    schema.matchWords.false = { color: "#ff0000" };
    schema.matchWords.null = { color: "#808080" };
  }

  const hasBrackets = features.includes("brackets");
  if (hasBrackets) {
    schema.matchStartsWith = schema.matchStartsWith || {};
    schema.matchEndsWith = schema.matchEndsWith || {};
    schema.matchStartsWith["["] = { color: "#ffff00" };
    schema.matchEndsWith["]"] = { color: "#ffff00" };
  }

  const hasHttpStatus = features.includes("httpStatus");
  if (hasHttpStatus) {
    schema.matchWords = schema.matchWords || {};
    schema.matchWords["200"] = { color: "#00ff00" };
    schema.matchWords["404"] = { color: "#ff8800" };
    schema.matchWords["500"] = { color: "#ff0000" };
  }
}

export function generateTemplateFromAnswers(answers: ThemeAnswers): Theme {
  const patternPresets = getPatternPresetsFromAnswers(answers);
  const config = createThemeConfig(answers, patternPresets);
  const theme = generateTemplate(config);

  if (answers.mode) theme.mode = answers.mode as Theme["mode"];
  applyFeatureStyles(theme, answers.features);
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

function isThemeFileName(name: string): boolean {
  const isJsonTheme = name.endsWith(".theme.json");
  const isTypeScriptTheme = name.endsWith(".theme.ts");
  const isPrimaryThemeFile = isJsonTheme || isTypeScriptTheme;
  if (isPrimaryThemeFile) return true;

  const hasThemeName = name.includes("theme");
  const isJsonOrTypeScript = name.endsWith(".json") || name.endsWith(".ts");
  return hasThemeName && isJsonOrTypeScript;
}

function tryParseThemeExport(
  fileContent: string,
  pattern: RegExp,
): Theme | undefined {
  const match = fileContent.match(pattern);
  if (!match) return undefined;

  try {
    const jsonStr = match[1].replace(/^\s+/gm, "").replace(/\s+$/gm, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    return undefined;
  }
}

async function resolveExportTheme(
  themeName?: string,
): Promise<string | undefined> {
  const availableThemes = Object.keys(getAllThemes());
  if (availableThemes.length === 0) {
    ui.showWarning("No themes available to export");
    return undefined;
  }

  if (themeName) return themeName;
  return select({
    message: "Select theme to export:",
    choices: availableThemes.map((name) => ({
      name: colors.cyan(name),
      value: name,
    })),
  });
}

function showExportPreview(exportData: unknown): void {
  console.log(colors.dim("\nFile contents:"));
  console.log(colors.dim("─".repeat(50)));
  console.log(JSON.stringify(exportData, null, 2));
  console.log(colors.dim("─".repeat(50)));
}

async function requestExportFilename(themeName: string): Promise<string> {
  const defaultFilename = `${themeName.replace(/[^a-zA-Z0-9-_]/g, "-")}.theme.json`;
  return input({
    message: "Export filename:",
    default: defaultFilename,
    validate: (value) => {
      if (!value.trim()) return "Filename is required";
      if (!value.endsWith(".json")) return "Filename should end with .json";
      return true;
    },
  });
}

export async function exportTheme(themeName?: string): Promise<void> {
  const themeToExport = await resolveExportTheme(themeName);
  if (!themeToExport) return;

  const theme = await getTheme(themeToExport);
  if (!theme) {
    ui.showError(`Theme "${themeToExport}" not found`);
    return;
  }

  const filename = await requestExportFilename(themeToExport);

  try {
    const serializableTheme = serializeThemeForFile(theme);
    const exportData = {
      ...serializableTheme,
      exportedAt: new Date().toISOString(),
      exportedBy: "LogsDX Theme Generator",
      version: "1.0.0",
    };

    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    ui.showSuccess(
      `Theme "${themeToExport}" exported to ${colors.cyan(filename)}`,
    );

    const showPreview = await confirm({
      message: "Show file preview?",
      default: false,
    });

    if (showPreview) showExportPreview(exportData);
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
    const serializableTheme = serializeThemeForFile(theme);
    const tsContent = `import type { Theme } from "logsdx";

export const theme: Theme = ${JSON.stringify(serializableTheme, null, 2)};

export default theme;
`;
    fs.writeFileSync(filePath, tsContent);
  } else {
    const serializableTheme = serializeThemeForFile(theme);
    fs.writeFileSync(filePath, JSON.stringify(serializableTheme, null, 2));
  }
}

async function resolveImportFile(filename?: string): Promise<string> {
  if (filename) return filename;
  return input({
    message: "Theme file path:",
    validate: (value) => {
      if (!value.trim()) return "File path is required";
      if (!fs.existsSync(value)) return "File does not exist";
      if (!value.endsWith(".json")) return "File should be a JSON file";
      return true;
    },
  });
}

async function renameExistingTheme(theme: Theme): Promise<void> {
  const existingTheme = await getTheme(theme.name);
  if (!existingTheme) return;

  const shouldOverwrite = await confirm({
    message: `Theme "${theme.name}" already exists. Overwrite?`,
    default: false,
  });
  if (shouldOverwrite) return;

  const newName = await input({
    message: "Enter a new name for the theme:",
    default: `${theme.name}-imported`,
    validate: (value) => (value.trim() ? true : "Name is required"),
  });
  theme.name = newName;
}

function showImportedTheme(theme: Theme): void {
  registerTheme(theme);
  ui.showSuccess(`Theme "${theme.name}" imported successfully!`);
  console.log(
    colors.green(
      `\n✨ Use your imported theme with: logsdx --theme ${theme.name} your-log-file.log`,
    ),
  );
}

function reportImportError(error: unknown): void {
  if (!(error instanceof Error)) {
    ui.showError("Import failed", String(error));
    return;
  }

  if (error.message.includes("JSON")) {
    ui.showError("Invalid JSON file", "Make sure the file contains valid JSON");
    return;
  }
  if (error.message.includes("validation")) {
    ui.showError(
      "Invalid theme format",
      "The file doesn't contain a valid LogsDX theme",
    );
    return;
  }
  ui.showError(`Import failed: ${error.message}`);
}

export function importThemeFromFile(filePath: string): Theme {
  const fileContent = fs.readFileSync(filePath, "utf8");

  const isScriptFile = filePath.endsWith(".ts") || filePath.endsWith(".js");
  if (isScriptFile) {
    const patterns = [
      /export\s+const\s+\w+\s*:\s*\w+\s*=\s*(\{[\s\S]*?\})\s*;?\s*$/m,
      /export\s+default\s+(\{[\s\S]*?\})\s*;?\s*$/m,
      /=\s*(\{[\s\S]*?\})\s*;?\s*export\s+default/m,
    ];

    for (const pattern of patterns) {
      const theme = tryParseThemeExport(fileContent, pattern);
      if (theme) return theme;
    }
    throw new Error(
      `Failed to parse theme file: The TypeScript/JavaScript file does not contain a valid theme export. ` +
        `Expected an export statement with a theme object containing 'name' and 'schema' properties.`,
    );
  }

  const parsed = JSON.parse(fileContent);
  const hasName = Boolean(parsed.name);
  const hasSchema = Boolean(parsed.schema);
  const hasRequiredFields = hasName && hasSchema;
  if (!hasRequiredFields) {
    const missing = [];
    if (!hasName) missing.push("'name'");
    if (!hasSchema) missing.push("'schema'");
    throw new Error(
      `Invalid theme JSON: Missing required fields: ${missing.join(", ")}. ` +
        `Theme files must contain both a 'name' string and a 'schema' object.`,
    );
  }
  return parsed;
}

export async function importTheme(filename?: string): Promise<void> {
  const themeFile = await resolveImportFile(filename);

  try {
    const fileContent = fs.readFileSync(themeFile, "utf8");
    const themeData = JSON.parse(fileContent);

    const validatedTheme = parseTheme(themeData);

    ui.showInfo(`Importing theme: ${colors.cyan(validatedTheme.name)}`);
    if (validatedTheme.description) {
      console.log(`Description: ${validatedTheme.description}`);
    }

    await renameExistingTheme(validatedTheme);

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

    if (!shouldImport) {
      ui.showInfo("Import cancelled");
      return;
    }
    showImportedTheme(validatedTheme);
  } catch (error) {
    reportImportError(error);
  }
}

async function previewImportedTheme(theme: Theme) {
  console.log(colors.bold("\nTheme Preview:\n"));

  const sampleLogs = [
    "2024-01-15 10:30:45 INFO Starting application server",
    "2024-01-15 10:30:46 DEBUG Loading configuration files",
    "2024-01-15 10:30:47 WARN Memory usage is high: 85%",
    "2024-01-15 10:30:48 ERROR Database connection failed",
    "GET /api/users 200 OK 45ms",
    "POST /api/login 401 Unauthorized 23ms",
  ];

  registerTheme(theme);
  const logsDX = await LogsDX.getInstance({
    theme: theme.name,
    outputFormat: "ansi",
  });

  sampleLogs.forEach((log) => {
    console.log(`  ${logsDX.processLine(log)}`);
  });

  console.log(colors.bold("\nTheme Details:"));
  console.log(`  Name: ${colors.cyan(theme.name)}`);
  if (theme.description) {
    console.log(`  Description: ${theme.description}`);
  }
  const exportedTheme = theme as Theme & { exportedAt?: string };
  if (exportedTheme.exportedAt) {
    console.log(
      `  Exported: ${colors.dim(new Date(exportedTheme.exportedAt).toLocaleString())}`,
    );
  }

  const wordCount = Object.keys(theme.schema.matchWords || {}).length;
  const patternCount = (theme.schema.matchPatterns || []).length;
  console.log(
    `  Patterns: ${colors.yellow(patternCount)}, Words: ${colors.yellow(wordCount)}`,
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
        } else if (isThemeFileName(item.name)) {
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

function printThemeFile(file: string, index: number): void {
  try {
    const content = fs.readFileSync(file, "utf8");
    const themeData = JSON.parse(content);

    console.log(colors.bold.cyan(`${index + 1}. ${path.basename(file)}`));
    console.log(`   Theme: ${themeData.name || "Unknown"}`);
    if (themeData.description) {
      console.log(`   Description: ${themeData.description}`);
    }
    if (themeData.exportedAt) {
      console.log(
        `   Exported: ${colors.dim(new Date(themeData.exportedAt).toLocaleString())}`,
      );
    }
    console.log(`   File: ${colors.dim(file)}`);
    console.log();
  } catch {
    console.log(colors.bold.red(`${index + 1}. ${path.basename(file)}`));
    console.log(colors.red("   Error: Invalid theme file"));
    console.log(`   File: ${colors.dim(file)}`);
    console.log();
  }
}

export function listThemeFilesCommand(directory = "."): void {
  try {
    const files = fs
      .readdirSync(directory)
      .filter((file) => file.endsWith(".theme.json"))
      .map((file) => path.join(directory, file));

    if (files.length === 0) {
      ui.showInfo("No theme files found in current directory");
      console.log(
        colors.dim("Theme files should have the extension .theme.json"),
      );
      return;
    }

    ui.showInfo(`Found ${files.length} theme file(s):\n`);

    files.forEach(printThemeFile);

    console.log(
      colors.yellow("Use --import-theme <filename> to import a theme"),
    );
  } catch (error) {
    ui.showError(
      `Failed to list theme files: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
