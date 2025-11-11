import { createCLI, CLI } from "./parser";
import { input, select, checkbox, confirm } from "../utils/prompts";
import spinner from "../utils/spinner";
import * as colorUtil from "../utils/colors";
import gradient from "../utils/gradient";
import boxen from "../utils/boxen";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import {
  createTheme,
  checkWCAGCompliance,
  adjustThemeForAccessibility,
  SimpleThemeConfig,
} from "../themes/builder";
import { registerTheme, getTheme, getThemeNames } from "../themes";
import { getLogsDX } from "../index";
import { Theme } from "../types";

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
  const grad = gradient(["#00ffff", "#ff00ff", "#ffff00"]);
  console.log(
    grad.multiline(`
  ╦  ┌─┐┌─┐┌─┐╔╦╗═╗ ╦
  ║  │ ││ ┬└─┐ ║║╔╩╦╝
  ╩═╝└─┘└─┘└─┘═╩╝╩ ╚═
  `),
  );
  console.log(colorUtil.dim("  Theme Creator v1.0.0\n"));
}

function renderPreview(theme: Theme, title: string = "Theme Preview") {
  const logsDX = getLogsDX({ theme, outputFormat: "ansi" });
  const previewBox = boxen(
    SAMPLE_LOGS.map((log) => logsDX.processLine(log)).join("\n"),
    {
      title,
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

  const name = await input({
    message: "Theme name:",
    validate: (inputValue: string) => {
      if (!inputValue.trim()) return "Theme name is required";
      if (getTheme(inputValue)) return "A theme with this name already exists";
      return true;
    },
    transformer: (inputValue: string) =>
      inputValue.trim().toLowerCase().replace(/\s+/g, "-"),
  });

  const description = await input({
    message: "Theme description:",
    default: "",
  });

  const mode = await select({
    message: "Theme mode:",
    choices: [
      { name: "🌙 Dark (for dark terminals)", value: "dark" },
      { name: "☀️  Light (for light terminals)", value: "light" },
      { name: "🔄 Auto (system preference)", value: "auto" },
    ],
    default: "dark",
  });

  const basicInfo = {
    name: name.trim().toLowerCase().replace(/\s+/g, "-"),
    description,
    mode,
  };

  const preset = await select({
    message: "Choose a color preset:",
    choices: Object.keys(COLOR_PRESETS).map((name) => ({
      name: name === "Custom" ? "🎨 Custom (define your own)" : `🎨 ${name}`,
      value: name,
    })),
  });

  let colors = COLOR_PRESETS[preset as keyof typeof COLOR_PRESETS];

  if (preset === "Custom" || !colors) {
    const loadingSpinner = spinner("Loading color picker...").start();
    await new Promise((r) => setTimeout(r, 500));
    loadingSpinner.stop();

    const primary = await input({
      message: "Primary color (hex):",
      default: "#ffffff",
      validate: (inputValue: string) =>
        /^#[0-9A-Fa-f]{6}$/.test(inputValue) || "Invalid hex color",
      transformer: (inputValue: string) =>
        colorUtil.cyan(inputValue || "#ffffff"),
    });

    const error = await input({
      message: "Error color (hex):",
      default: "#ff4444",
      validate: (inputValue: string) =>
        /^#[0-9A-Fa-f]{6}$/.test(inputValue) || "Invalid hex color",
      transformer: (inputValue: string) =>
        colorUtil.red(inputValue || "#ff4444"),
    });

    const warning = await input({
      message: "Warning color (hex):",
      default: "#ff9900",
      validate: (inputValue: string) =>
        /^#[0-9A-Fa-f]{6}$/.test(inputValue) || "Invalid hex color",
      transformer: (inputValue: string) =>
        colorUtil.yellow(inputValue || "#ff9900"),
    });

    const success = await input({
      message: "Success color (hex):",
      default: "#00cc66",
      validate: (inputValue: string) =>
        /^#[0-9A-Fa-f]{6}$/.test(inputValue) || "Invalid hex color",
      transformer: (inputValue: string) =>
        colorUtil.green(inputValue || "#00cc66"),
    });

    const info = await input({
      message: "Info color (hex):",
      default: "#00aaff",
      validate: (inputValue: string) =>
        /^#[0-9A-Fa-f]{6}$/.test(inputValue) || "Invalid hex color",
      transformer: (inputValue: string) =>
        colorUtil.blue(inputValue || "#00aaff"),
    });

    const muted = await input({
      message: "Muted color (hex):",
      default: "#666666",
      validate: (inputValue: string) =>
        /^#[0-9A-Fa-f]{6}$/.test(inputValue) || "Invalid hex color",
      transformer: (inputValue: string) =>
        colorUtil.gray(inputValue || "#666666"),
    });

    colors = { primary, error, warning, success, info, muted };
  }

  const presets = await checkbox({
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
  });

  const createSpinner = spinner("Creating theme...").start();

  const config: SimpleThemeConfig = {
    name: basicInfo.name,
    description: basicInfo.description || undefined,
    mode: basicInfo.mode as "light" | "dark" | "auto",
    colors: colors!,
    presets,
  };

  const theme = createTheme(config);
  createSpinner.succeed("Theme created!");

  console.log("\n");
  renderPreview(theme, `✨ ${theme.name} Preview`);

  const checkAccessibility = await confirm({
    message: "Check accessibility compliance?",
    default: true,
  });

  if (checkAccessibility) {
    const accessSpinner = spinner("Checking accessibility...").start();
    const result = checkWCAGCompliance(theme);
    accessSpinner.stop();

    const accessBox = boxen(
      `WCAG Level: ${result.level} ${result.level === "AAA" ? "🏆" : result.level === "AA" ? "✅" : result.level === "A" ? "⚠️" : "❌"}\n` +
        `Min Contrast Ratio: ${result.details.normalText.ratio.toFixed(2)}\n` +
        (result.recommendations.length > 0
          ? "\nRecommendations:\n" +
            result.recommendations.map((r: string) => `• ${r}`).join("\n")
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
      const fixIssues = await confirm({
        message: "Auto-fix accessibility issues?",
        default: true,
      });

      if (fixIssues) {
        const fixSpinner = spinner("Fixing accessibility issues...").start();
        const fixedTheme = adjustThemeForAccessibility(theme, 4.5);
        fixSpinner.succeed("Accessibility issues fixed!");
        Object.assign(theme, fixedTheme);
      }
    }
  }

  const saveOption = await select({
    message: "How would you like to save the theme?",
    choices: [
      { name: "💾 Export as JSON file", value: "json" },
      { name: "📝 Export as TypeScript file", value: "typescript" },
      { name: "📋 Copy to clipboard", value: "clipboard" },
      { name: "🚀 Register for immediate use", value: "register" },
      { name: "❌ Don't save", value: "none" },
    ],
  });

  if (saveOption !== "none") {
    await saveTheme(theme, saveOption);
  }

  console.log(
    boxen(
      colorUtil.green("🎉 Theme creation complete!\n\n") +
        colorUtil.dim(
          `Use your theme with: ${colorUtil.cyan(`logsdx --theme ${theme.name}`)}`,
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
    const filepath = await input({
      message: "Save as:",
      default: `./themes/${theme.name}.json`,
    });

    const dir = dirname(filepath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(filepath, JSON.stringify(themeData, null, 2));
    console.log(colorUtil.green(`✅ Saved to ${filepath}`));
  } else if (saveOption === "typescript") {
    const filepath = await input({
      message: "Save as:",
      default: `./themes/${theme.name}.ts`,
    });

    const dir = dirname(filepath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const tsContent = `import { Theme } from 'logsdx';

export const ${theme.name.replace(/[^a-zA-Z0-9]/g, "_")}Theme: Theme = ${JSON.stringify(themeData, null, 2)};
`;

    writeFileSync(filepath, tsContent);
    console.log(colorUtil.green(`✅ Saved to ${filepath}`));
  }
}
