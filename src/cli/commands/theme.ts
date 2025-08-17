import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import boxen from "boxen";
import gradientString from "gradient-string";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import {
  createTheme,
  checkWCAGCompliance,
  adjustThemeForAccessibility,
  SimpleThemeConfig,
} from "../../themes/builder";
import { registerTheme, getTheme, getThemeNames } from "../../themes";
import { getLogsDX } from "../../index";
import { Theme } from "../../types";
// import { renderLightBox } from '../../renderer/light-box';

// Sample logs for preview
const SAMPLE_LOGS = [
  "INFO: Server started on port 3000",
  "WARN: Memory usage high: 85%",
  "ERROR: Database connection failed",
  "DEBUG: Processing request id=12345",
  "SUCCESS: All tests passed ✓",
  "[2024-01-15 10:23:45] Request completed",
  "GET /api/users 200 OK (123ms)",
  "Cache hit ratio: 92.5%",
];

// Color presets
const COLOR_PRESETS = {
  Vibrant: {
    primary: "#007acc",
    error: "#ff4444",
    warning: "#ff9900",
    success: "#00cc66",
    info: "#00aaff",
    muted: "#666666",
  },
  Pastel: {
    primary: "#87ceeb",
    error: "#ffb6c1",
    warning: "#ffd700",
    success: "#98fb98",
    info: "#add8e6",
    muted: "#d3d3d3",
  },
  Neon: {
    primary: "#00ffff",
    error: "#ff0080",
    warning: "#ffff00",
    success: "#00ff00",
    info: "#ff00ff",
    muted: "#808080",
  },
  Earth: {
    primary: "#8b7355",
    error: "#cd5c5c",
    warning: "#daa520",
    success: "#228b22",
    info: "#4682b4",
    muted: "#696969",
  },
  Ocean: {
    primary: "#006994",
    error: "#ff6b6b",
    warning: "#ffd93d",
    success: "#4ecdc4",
    info: "#45b7d1",
    muted: "#95a5a6",
  },
  Custom: null,
};

function showBanner() {
  console.clear();
  const gradient = gradientString(["#00ffff", "#ff00ff", "#ffff00"]);
  console.log(
    gradient.multiline(`
  ╦  ┌─┐┌─┐┌─┐╔╦╗═╗ ╦
  ║  │ ││ ┬└─┐ ║║╔╩╦╝
  ╩═╝└─┘└─┘└─┘═╩╝╩ ╚═
  `),
  );
  console.log(chalk.dim("  Theme Creator v1.0.0\n"));
}

function renderPreview(theme: Theme, title: string = "Theme Preview") {
  const logsDX = getLogsDX({ theme, outputFormat: "ansi" });
  const previewBox = boxen(
    SAMPLE_LOGS.map((log) => logsDX.processLine(log)).join("\n"),
    {
      title,
      titleAlignment: "center",
      padding: 1,
      borderStyle: "round",
      borderColor: "cyan",
    },
  );
  console.log(previewBox);
}

async function createInteractiveTheme(options: { skipIntro?: boolean } = {}) {
  if (!options.skipIntro) {
    showBanner();
  }

  // Basic info
  const basicInfo = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Theme name:",
      validate: (input: string) => {
        if (!input.trim()) return "Theme name is required";
        if (getTheme(input)) return "A theme with this name already exists";
        return true;
      },
      filter: (input: string) =>
        input.trim().toLowerCase().replace(/\s+/g, "-"),
    },
    {
      type: "input",
      name: "description",
      message: "Theme description:",
      default: "",
    },
    {
      type: "list",
      name: "mode",
      message: "Theme mode:",
      choices: [
        { name: "🌙 Dark (for dark terminals)", value: "dark" },
        { name: "☀️  Light (for light terminals)", value: "light" },
        { name: "🔄 Auto (system preference)", value: "auto" },
      ],
      default: "dark",
    },
  ]);

  // Color selection
  const { preset } = await inquirer.prompt([
    {
      type: "list",
      name: "preset",
      message: "Choose a color preset:",
      choices: Object.keys(COLOR_PRESETS).map((name) => ({
        name: name === "Custom" ? "🎨 Custom (define your own)" : `🎨 ${name}`,
        value: name,
      })),
    },
  ]);

  let colors = COLOR_PRESETS[preset as keyof typeof COLOR_PRESETS];

  if (preset === "Custom" || !colors) {
    const spinner = ora("Loading color picker...").start();
    await new Promise((r) => setTimeout(r, 500));
    spinner.stop();

    colors = await inquirer.prompt([
      {
        type: "input",
        name: "primary",
        message: "Primary color (hex):",
        default: "#ffffff",
        validate: (input: string) =>
          /^#[0-9A-Fa-f]{6}$/.test(input) || "Invalid hex color",
        transformer: (input: string) =>
          chalk.hex(input || "#ffffff")(input || "#ffffff"),
      },
      {
        type: "input",
        name: "error",
        message: "Error color (hex):",
        default: "#ff4444",
        validate: (input: string) =>
          /^#[0-9A-Fa-f]{6}$/.test(input) || "Invalid hex color",
        transformer: (input: string) =>
          chalk.hex(input || "#ff4444")(input || "#ff4444"),
      },
      {
        type: "input",
        name: "warning",
        message: "Warning color (hex):",
        default: "#ff9900",
        validate: (input: string) =>
          /^#[0-9A-Fa-f]{6}$/.test(input) || "Invalid hex color",
        transformer: (input: string) =>
          chalk.hex(input || "#ff9900")(input || "#ff9900"),
      },
      {
        type: "input",
        name: "success",
        message: "Success color (hex):",
        default: "#00cc66",
        validate: (input: string) =>
          /^#[0-9A-Fa-f]{6}$/.test(input) || "Invalid hex color",
        transformer: (input: string) =>
          chalk.hex(input || "#00cc66")(input || "#00cc66"),
      },
      {
        type: "input",
        name: "info",
        message: "Info color (hex):",
        default: "#00aaff",
        validate: (input: string) =>
          /^#[0-9A-Fa-f]{6}$/.test(input) || "Invalid hex color",
        transformer: (input: string) =>
          chalk.hex(input || "#00aaff")(input || "#00aaff"),
      },
      {
        type: "input",
        name: "muted",
        message: "Muted color (hex):",
        default: "#666666",
        validate: (input: string) =>
          /^#[0-9A-Fa-f]{6}$/.test(input) || "Invalid hex color",
        transformer: (input: string) =>
          chalk.hex(input || "#666666")(input || "#666666"),
      },
    ]);
  }

  // Feature presets
  const { presets } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "presets",
      message: "Select features to highlight:",
      choices: [
        {
          name: "📊 Log levels (ERROR, WARN, INFO)",
          value: "logLevels",
          checked: true,
        },
        {
          name: "🔢 Numbers and numeric values",
          value: "numbers",
          checked: true,
        },
        { name: "📅 Dates and timestamps", value: "dates", checked: true },
        { name: "✅ Boolean values", value: "booleans", checked: true },
        {
          name: "🔤 Brackets and punctuation",
          value: "brackets",
          checked: true,
        },
        { name: "💬 Quoted strings", value: "strings", checked: false },
      ],
    },
  ]);

  // Create theme
  const spinner = ora("Creating theme...").start();

  const config: SimpleThemeConfig = {
    name: basicInfo.name,
    description: basicInfo.description || undefined,
    mode: basicInfo.mode as "light" | "dark" | "auto",
    colors: colors!,
    presets,
  };

  const theme = createTheme(config);
  spinner.succeed("Theme created!");

  // Preview
  console.log("\n");
  renderPreview(theme, `✨ ${theme.name} Preview`);

  // Accessibility check
  const { checkAccessibility } = await inquirer.prompt([
    {
      type: "confirm",
      name: "checkAccessibility",
      message: "Check accessibility compliance?",
      default: true,
    },
  ]);

  if (checkAccessibility) {
    const accessSpinner = ora("Checking accessibility...").start();
    const result = checkWCAGCompliance(theme);
    accessSpinner.stop();

    const accessBox = boxen(
      `WCAG Level: ${result.level} ${result.level === "AAA" ? "🏆" : result.level === "AA" ? "✅" : result.level === "A" ? "⚠️" : "❌"}\n` +
        `Min Contrast Ratio: ${result.details.normalText.ratio.toFixed(2)}\n` +
        (result.recommendations.length > 0
          ? "\nRecommendations:\n" +
            result.recommendations.map((r) => `• ${r}`).join("\n")
          : "\n✅ No issues found!"),
      {
        title: "♿ Accessibility Report",
        padding: 1,
        borderStyle: "round",
        borderColor:
          result.level === "FAIL"
            ? "red"
            : result.level === "A"
              ? "yellow"
              : "green",
      },
    );
    console.log(accessBox);

    if (result.recommendations.length > 0) {
      const { fixIssues } = await inquirer.prompt([
        {
          type: "confirm",
          name: "fixIssues",
          message: "Auto-fix accessibility issues?",
          default: true,
        },
      ]);

      if (fixIssues) {
        const fixSpinner = ora("Fixing accessibility issues...").start();
        const fixedTheme = adjustThemeForAccessibility(theme, 4.5);
        fixSpinner.succeed("Accessibility issues fixed!");
        Object.assign(theme, fixedTheme);
      }
    }
  }

  // Save options
  const { saveOption } = await inquirer.prompt([
    {
      type: "list",
      name: "saveOption",
      message: "How would you like to save the theme?",
      choices: [
        { name: "💾 Export as JSON file", value: "json" },
        { name: "📝 Export as TypeScript file", value: "typescript" },
        { name: "📋 Copy to clipboard", value: "clipboard" },
        { name: "🚀 Register for immediate use", value: "register" },
        { name: "❌ Don't save", value: "none" },
      ],
    },
  ]);

  if (saveOption !== "none") {
    await saveTheme(theme, saveOption);
  }

  console.log(
    boxen(
      chalk.green("🎉 Theme creation complete!\n\n") +
        chalk.dim(
          `Use your theme with: ${chalk.cyan(`logsdx --theme ${theme.name}`)}`,
        ),
      {
        padding: 1,
        borderStyle: "round",
        borderColor: "green",
      },
    ),
  );
}

async function saveTheme(theme: Theme, saveOption: string) {
  const themeData = {
    name: theme.name,
    description: theme.description,
    mode: theme.mode,
    schema: theme.schema,
  };

  if (saveOption === "register") {
    registerTheme(theme);
    return;
  }

  if (saveOption === "json") {
    const { filepath } = await inquirer.prompt([
      {
        type: "input",
        name: "filepath",
        message: "Save as:",
        default: `./themes/${theme.name}.json`,
      },
    ]);

    const dir = dirname(filepath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(filepath, JSON.stringify(themeData, null, 2));
    console.log(chalk.green(`✅ Saved to ${filepath}`));
  } else if (saveOption === "typescript") {
    const { filepath } = await inquirer.prompt([
      {
        type: "input",
        name: "filepath",
        message: "Save as:",
        default: `./themes/${theme.name}.ts`,
      },
    ]);

    const dir = dirname(filepath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const tsContent = `import { Theme } from 'logsdx';

export const ${theme.name.replace(/[^a-zA-Z0-9]/g, "_")}Theme: Theme = ${JSON.stringify(themeData, null, 2)};
`;

    writeFileSync(filepath, tsContent);
    console.log(chalk.green(`✅ Saved to ${filepath}`));
  }
}

export function createThemeCommand() {
  const theme = new Command("theme").description("Theme management commands");

  theme
    .command("create")
    .description("Create a new theme interactively")
    .option("--skip-intro", "Skip the intro banner")
    .action(async (options) => {
      await createInteractiveTheme(options);
    });

  theme
    .command("list")
    .description("List all available themes")
    .option("-d, --detailed", "Show detailed theme information")
    .action((options) => {
      const themes = getThemeNames();

      if (options.detailed) {
        themes.forEach((name) => {
          const theme = getTheme(name);
          console.log(
            boxen(
              `${chalk.bold(name)}\n` +
                (theme.description ? chalk.dim(theme.description) + "\n" : "") +
                `Mode: ${theme.mode || "auto"}`,
              {
                padding: { top: 0, right: 1, bottom: 0, left: 1 },
                borderStyle: "round",
                borderColor: "cyan",
              },
            ),
          );
        });
      } else {
        console.log(chalk.bold("\nAvailable themes:\n"));
        themes.forEach((name) => {
          const theme = getTheme(name);
          const icon =
            theme.mode === "light"
              ? "☀️ "
              : theme.mode === "dark"
                ? "🌙"
                : "🔄";
          console.log(`  ${icon} ${name}`);
        });
        console.log("");
      }
    });

  theme
    .command("preview <name>")
    .description("Preview a theme with sample logs")
    .action((name) => {
      const theme = getTheme(name);
      if (!theme) {
        console.error(chalk.red(`Theme "${name}" not found`));
        process.exit(1);
      }

      showBanner();
      renderPreview(theme, `${theme.name} Theme`);

      // Show color palette
      const palette = boxen(
        Object.entries(theme.schema)
          .map(([key, value]) => {
            if (typeof value === "object" && "color" in value) {
              return `${key}: ${chalk.hex(value.color)(value.color)}`;
            }
            return null;
          })
          .filter(Boolean)
          .join("\n"),
        {
          title: "Color Palette",
          padding: 1,
          borderStyle: "round",
          borderColor: "cyan",
        },
      );
      console.log(palette);
    });

  return theme;
}
