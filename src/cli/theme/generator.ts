import { select, input, checkbox, confirm } from "../../utils/prompts";
import { ui } from "../ui";
import chalk from "chalk";
import fs from "fs";
import {
  listColorPalettes,
  listPatternPresets,
  generateTemplate,
  type ColorPalette,
  type PatternPreset,
  type ThemeGeneratorConfig,
} from "../../themes/template";
import { registerTheme } from "../../themes";
import type { Theme, PatternMatch } from "../../types";

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

  const { LogsDX } = await import("../../index");
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

  // Check hex pattern - must start with #
  if (color.match(/^[0-9a-fA-F]+$/)) {
    return false; // Hex without # is invalid
  }

  if (color.startsWith("#")) {
    return hexPattern.test(color);
  }

  // Check RGB pattern
  if (color.startsWith("rgb")) {
    return rgbPattern.test(color);
  }

  // Check named colors
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
  // Map features to pattern presets
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

  // Ensure schema exists
  if (!theme.schema) {
    theme.schema = {};
  }

  // Add features that aren't in pattern presets
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
      // Initialize if not exists
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
