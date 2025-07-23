import fs from "fs";
import path from "path";
import { ui } from "./ui";
import { select, input, confirm } from "@inquirer/prompts";
import { registerTheme, getAllThemes, getTheme } from "../themes";
import { themePresetSchema } from "../schema";
import chalk from "chalk";

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
    ui.showSuccess(`Theme "${themeToExport}" exported to ${chalk.cyan(filename)}`);

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

    // Validate the theme structure
    const validatedTheme = themePresetSchema.parse(themeData);

    ui.showInfo(`Importing theme: ${chalk.cyan(validatedTheme.name)}`);
    if (validatedTheme.description) {
      console.log(`Description: ${validatedTheme.description}`);
    }

    // Check if theme already exists
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

    // Preview the theme
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
        ui.showError("Invalid JSON file", "Make sure the file contains valid JSON");
      } else if (error.message.includes("validation")) {
        ui.showError("Invalid theme format", "The file doesn't contain a valid LogsDX theme");
      } else {
        ui.showError(`Import failed: ${error.message}`);
      }
    } else {
      ui.showError("Import failed", String(error));
    }
  }
}

async function previewImportedTheme(theme) {
  console.log(chalk.bold("\n🎬 Theme Preview:\n"));

  const sampleLogs = [
    "2024-01-15 10:30:45 INFO Starting application server",
    "2024-01-15 10:30:46 DEBUG Loading configuration files",
    "2024-01-15 10:30:47 WARN Memory usage is high: 85%",
    "2024-01-15 10:30:48 ERROR Database connection failed",
    "GET /api/users 200 OK 45ms",
    "POST /api/login 401 Unauthorized 23ms",
  ];

  // Temporarily register the theme for preview
  const { LogsDX } = await import("@/src/index");
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
  if (theme.exportedAt) {
    console.log(`  Exported: ${chalk.dim(new Date(theme.exportedAt).toLocaleString())}`);
  }

  const wordCount = Object.keys(theme.schema.matchWords || {}).length;
  const patternCount = (theme.schema.matchPatterns || []).length;
  console.log(`  Patterns: ${chalk.yellow(patternCount)}, Words: ${chalk.yellow(wordCount)}`);
}

export function listThemeFiles(directory = "."): void {
  try {
    const files = fs
      .readdirSync(directory)
      .filter((file) => file.endsWith(".theme.json"))
      .map((file) => path.join(directory, file));

    if (files.length === 0) {
      ui.showInfo("No theme files found in current directory");
      console.log(chalk.dim("Theme files should have the extension .theme.json"));
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
          console.log(`   Exported: ${chalk.dim(new Date(themeData.exportedAt).toLocaleString())}`);
        }
        console.log(`   File: ${chalk.dim(file)}`);
        console.log();
      } catch (error) {
        console.log(chalk.bold.red(`${index + 1}. ${path.basename(file)}`));
        console.log(chalk.red(`   Error: Invalid theme file`));
        console.log(`   File: ${chalk.dim(file)}`);
        console.log();
      }
    });

    console.log(chalk.yellow("💡 Use --import-theme <filename> to import a theme"));
  } catch (error) {
    ui.showError(
      `Failed to list theme files: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}