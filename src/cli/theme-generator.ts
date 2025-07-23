import { select, input, checkbox, confirm } from "@inquirer/prompts";
import { ui } from "./ui";
import chalk from "chalk";
import fs from "fs";
import {
  listColorPalettes,
  listPatternPresets,
  generateTheme,
  type ColorPalette,
  type PatternPreset,
  type ThemeGeneratorConfig,
} from "../themes/generator";
import { registerTheme } from "../themes";
import type { Theme } from "../types";

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
        palette.accessibility.colorBlindSafe ? "Color-blind safe" : "Not color-blind safe"
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
    choices: Object.entries(presetsByCategory).flatMap(([category, categoryPresets]) => [
      {
        name: chalk.bold.yellow(`── ${category.toUpperCase()} ──`),
        value: `__category_${category}`,
        disabled: true,
      },
      ...categoryPresets.map((preset) => ({
        name: `  ${preset.name} - ${preset.description}`,
        value: preset.name,
      })),
    ]),
    validate: (choices) => {
      const validChoices = choices.filter((choice) => !String(choice).startsWith("__category_"));
      return validChoices.length > 0 ? true : "Please select at least one pattern preset";
    },
  });

  const filteredPresets = selectedPresets.filter((preset) => !preset.startsWith("__category_"));

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

  const theme = generateTheme(config);

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

async function collectCustomPatterns(): Promise<ThemeGeneratorConfig["customPatterns"]> {
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
        } catch (error) {
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

async function collectCustomWords(): Promise<ThemeGeneratorConfig["customWords"]> {
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

  const { LogsDX } = await import("@/src/index");
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
  console.log(`  Contrast Ratio: ${chalk.yellow(palette.accessibility.contrastRatio.toFixed(1))}`);
  console.log(
    `  Color-blind Safe: ${
      palette.accessibility.colorBlindSafe ? chalk.green("Yes") : chalk.red("No")
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

  console.log(chalk.yellow("💡 Use --generate-theme to create a theme with these palettes"));
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
      console.log(`    ${chalk.dim(`${preset.patterns.length} patterns, ${Object.keys(preset.matchWords).length} word matches`)}`);
    });
  });

  console.log(chalk.yellow("\n💡 Use --generate-theme to create a theme with these presets"));
}