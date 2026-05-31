import { input, select, checkbox, confirm } from "../utils/prompts";
import spinner from "../utils/spinner";
import chalk from "../utils/colors";
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
import { registerTheme, getTheme } from "../themes";
import { getLogsDX } from "../index";
import { Theme } from "../types";
import {
  SAMPLE_LOGS,
  COLOR_PRESETS,
  BANNER_ASCII,
  THEME_CREATOR_VERSION,
  PROMPTS,
  THEME_MODES,
  FEATURE_PRESETS,
  SAVE_OPTIONS,
} from "./constants";
import { createLogger } from "../utils/logger";

const log = createLogger("commands");

function showBanner() {
  const grad = gradient();
  log.print(grad.multiline(BANNER_ASCII));
  log.print(chalk.dim(`  ${THEME_CREATOR_VERSION}\n`));
}

async function renderPreview(theme: Theme, title: string = "Theme Preview") {
  const logsDX = await getLogsDX({ theme, outputFormat: "ansi" });
  const styledLogs = SAMPLE_LOGS.map((line) => logsDX.processLine(line));
  const previewBox = boxen(styledLogs.join("\n"), {
    title,
    padding: 1,
    borderStyle: "round",
    borderColor: "cyan",
  });
  log.print(previewBox);
}

export async function createInteractiveTheme(
  options: { skipIntro?: boolean } = {},
) {
  if (!options.skipIntro) {
    showBanner();
  }

  const name = await input({
    message: PROMPTS.themeName,
    validate: async (inputValue: string) => {
      if (!inputValue.trim()) return PROMPTS.themeNameRequired;
      try {
        await getTheme(inputValue);
        return PROMPTS.themeExists;
      } catch {
        return true;
      }
    },
    transformer: (inputValue: string) =>
      inputValue.trim().toLowerCase().replace(/\s+/g, "-"),
  });

  const description = await input({
    message: PROMPTS.themeDescription,
    default: "",
  });

  const mode = await select({
    message: PROMPTS.themeMode,
    choices: THEME_MODES.map((m) => ({ name: m.name, value: m.value })),
    default: "dark",
  });

  const basicInfo = {
    name: name.trim().toLowerCase().replace(/\s+/g, "-"),
    description,
    mode,
  };

  const preset = await select({
    message: PROMPTS.chooseColorPreset,
    choices: Object.keys(COLOR_PRESETS).map((name) => ({
      name: name === "Custom" ? PROMPTS.customDefineOwn : name,
      value: name,
    })),
  });

  let themeColors: SimpleThemeConfig["colors"] | null =
    COLOR_PRESETS[preset as keyof typeof COLOR_PRESETS];

  if (preset === "Custom" || !themeColors) {
    const loadingSpinner = spinner(PROMPTS.loadingColorPicker).start();
    await new Promise((r) => setTimeout(r, 500));
    loadingSpinner.stop();

    const validateHex = (inputValue: string) =>
      /^#[0-9A-Fa-f]{6}$/.test(inputValue) || PROMPTS.invalidHexColor;

    const primary = await input({
      message: PROMPTS.primaryColor,
      default: "#ffffff",
      validate: validateHex,
      transformer: (inputValue: string) => chalk.cyan(inputValue || "#ffffff"),
    });

    const error = await input({
      message: PROMPTS.errorColor,
      default: "#ff4444",
      validate: validateHex,
      transformer: (inputValue: string) => chalk.red(inputValue || "#ff4444"),
    });

    const warning = await input({
      message: PROMPTS.warningColor,
      default: "#ff9900",
      validate: validateHex,
      transformer: (inputValue: string) =>
        chalk.yellow(inputValue || "#ff9900"),
    });

    const success = await input({
      message: PROMPTS.successColor,
      default: "#00cc66",
      validate: validateHex,
      transformer: (inputValue: string) => chalk.green(inputValue || "#00cc66"),
    });

    const info = await input({
      message: PROMPTS.infoColor,
      default: "#00aaff",
      validate: validateHex,
      transformer: (inputValue: string) => chalk.blue(inputValue || "#00aaff"),
    });

    const muted = await input({
      message: PROMPTS.mutedColor,
      default: "#666666",
      validate: validateHex,
      transformer: (inputValue: string) => chalk.gray(inputValue || "#666666"),
    });

    themeColors = { primary, error, warning, success, info, muted };
  }

  const presets = await checkbox({
    message: PROMPTS.selectFeatures,
    choices: FEATURE_PRESETS.map((f) => ({
      name: f.name,
      value: f.value,
      checked: f.checked,
    })),
  });

  const createSpinner = spinner(PROMPTS.creatingTheme).start();

  const config: SimpleThemeConfig = {
    name: basicInfo.name,
    description: basicInfo.description || undefined,
    mode: basicInfo.mode as "light" | "dark" | "auto",
    colors: themeColors!,
    presets,
  };

  const theme = createTheme(config);
  createSpinner.succeed(PROMPTS.themeCreated);

  log.print("\n");
  await renderPreview(theme, `${theme.name} Preview`);

  const checkAccessibility = await confirm({
    message: PROMPTS.checkAccessibility,
    default: true,
  });

  if (checkAccessibility) {
    const accessSpinner = spinner(PROMPTS.checkingAccessibility).start();
    const result = checkWCAGCompliance(theme);
    accessSpinner.stop();

    const accessBox = boxen(
      `WCAG Level: ${result.level}\n` +
        `Min Contrast Ratio: ${result.details.normalText.ratio.toFixed(2)}\n` +
        (result.recommendations.length > 0
          ? "\nRecommendations:\n" +
            result.recommendations.map((r: string) => `- ${r}`).join("\n")
          : `\n${PROMPTS.noIssuesFound}`),
      {
        title: PROMPTS.accessibilityReport,
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
    log.print(accessBox);

    if (result.recommendations.length > 0) {
      const fixIssues = await confirm({
        message: PROMPTS.autoFixAccessibility,
        default: true,
      });

      if (fixIssues) {
        const fixSpinner = spinner(PROMPTS.fixingAccessibility).start();
        const fixedTheme = adjustThemeForAccessibility(theme, 4.5);
        fixSpinner.succeed(PROMPTS.accessibilityFixed);
        Object.assign(theme, fixedTheme);
      }
    }
  }

  const saveOption = await select({
    message: PROMPTS.saveThemeHow,
    choices: SAVE_OPTIONS.map((o) => ({ name: o.name, value: o.value })),
  });

  if (saveOption !== "none") {
    await saveTheme(theme, saveOption);
  }

  const completionMsg = chalk.green(`${PROMPTS.themeCreationComplete}\n\n`);
  const usageHint = chalk.dim(
    `Use your theme with: ${chalk.cyan(`logsdx --theme ${theme.name}`)}`,
  );
  const completionBox = boxen(completionMsg + usageHint, {
    padding: 1,
    borderStyle: "round",
    borderColor: "green",
  });
  log.print(completionBox);
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
      message: PROMPTS.saveAs,
      default: `./themes/${theme.name}.json`,
    });

    const dir = dirname(filepath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(filepath, JSON.stringify(themeData, null, 2));
    log.success(`Saved to ${filepath}`);
  } else if (saveOption === "typescript") {
    const filepath = await input({
      message: PROMPTS.saveAs,
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
    log.success(`Saved to ${filepath}`);
  }
}
