import { select, confirm } from "../utils/prompts";
import { LogsDX, getThemeNames, getTheme } from "../index";
import { ui } from "./ui";
import colors from "../utils/colors";
import { createLogger } from "../utils/logger";
import { INTERACTIVE_SAMPLE_LOG, PROMPTS, OUTPUT_FORMATS } from "./constants";
import type {
  InteractiveConfig,
  ThemeChoice,
  FormatChoice,
  FormatValue,
} from "./types";

const log = createLogger("interactive");

async function buildThemeChoices(themeNames: string[]): Promise<ThemeChoice[]> {
  const buildChoice = async (themeName: string): Promise<ThemeChoice> => {
    const theme = await getTheme(themeName);
    const description = theme?.description || PROMPTS.noDescription;
    const styledName = colors.cyan(themeName);
    return { name: styledName, value: themeName, description };
  };
  return Promise.all(themeNames.map(buildChoice));
}

async function showSingleThemePreview(themeName: string): Promise<void> {
  const logsDX = await LogsDX.getInstance({
    theme: themeName,
    outputFormat: "ansi",
  });
  const styledSample = logsDX.processLog(INTERACTIVE_SAMPLE_LOG);
  ui.showThemePreview(themeName, styledSample);
}

async function showAllThemePreviews(themeNames: string[]): Promise<void> {
  log.info(PROMPTS.themePreviews);
  const reducer = (p: Promise<void>, name: string) =>
    p.then(() => showSingleThemePreview(name));
  await themeNames.reduce(reducer, Promise.resolve());
}

function buildFormatChoice(
  label: string,
  hint: string,
  desc: string,
  value: FormatValue,
  colorFn: (s: string) => string,
): FormatChoice {
  const name = colorFn(label) + colors.dim(` (${hint})`);
  return { name, value, description: desc };
}

function buildOutputFormatChoices(): FormatChoice[] {
  const ansi = OUTPUT_FORMATS.ansi;
  const html = OUTPUT_FORMATS.html;
  const ansiChoice = buildFormatChoice(
    ansi.label,
    ansi.hint,
    ansi.desc,
    "ansi",
    colors.green,
  );
  const htmlChoice = buildFormatChoice(
    html.label,
    html.hint,
    html.desc,
    "html",
    colors.blue,
  );
  return [ansiChoice, htmlChoice];
}

async function selectTheme(themeChoices: ThemeChoice[]): Promise<string> {
  const previewLabel = colors.yellow(PROMPTS.previewThemes);
  const previewOption = {
    name: previewLabel,
    value: "__preview__",
    description: PROMPTS.previewDescription,
  };
  const choices = [...themeChoices, previewOption];
  return select({ message: PROMPTS.chooseTheme, choices });
}

async function showSettingsPreview(
  theme: string,
  format: "ansi" | "html",
): Promise<void> {
  log.info(PROMPTS.previewWithSettings);
  const logsDX = await LogsDX.getInstance({ theme, outputFormat: format });
  const styledSample = logsDX.processLog(INTERACTIVE_SAMPLE_LOG);
  const formatUpper = format.toUpperCase();
  const previewTitle = `${theme} (${formatUpper})`;
  ui.showThemePreview(previewTitle, styledSample);
}

async function resolveTheme(
  selectedTheme: string,
  themeNames: string[],
  themeChoices: ThemeChoice[],
): Promise<string> {
  const wantsPreview = selectedTheme === "__preview__";
  if (!wantsPreview) return selectedTheme;

  await showAllThemePreviews(themeNames);
  return select({ message: PROMPTS.nowChooseTheme, choices: themeChoices });
}

async function promptForSettings(
  finalTheme: string,
): Promise<{ outputFormat: FormatValue; wantPreview: boolean }> {
  const formatChoices = buildOutputFormatChoices();
  const formatMessage = PROMPTS.chooseOutputFormat;
  const outputFormat = (await select({
    message: formatMessage,
    choices: formatChoices,
  })) as FormatValue;
  const previewMessage = PROMPTS.showPreview;
  const wantPreview = await confirm({ message: previewMessage, default: true });
  if (wantPreview) await showSettingsPreview(finalTheme, outputFormat);
  return { outputFormat, wantPreview };
}

export async function runInteractiveMode(): Promise<InteractiveConfig> {
  ui.showHeader();
  log.info(PROMPTS.welcomeInteractive);
  log.debug(PROMPTS.wizardHelp);

  const themeNames = getThemeNames();
  const themeChoices = await buildThemeChoices(themeNames);
  const selectedTheme = await selectTheme(themeChoices);
  const finalTheme = await resolveTheme(
    selectedTheme,
    themeNames,
    themeChoices,
  );

  const { outputFormat, wantPreview } = await promptForSettings(finalTheme);
  const saveConfig = await confirm({
    message: PROMPTS.saveAsDefault,
    default: false,
  });
  if (saveConfig) log.success(PROMPTS.configSaved);

  return { theme: finalTheme, outputFormat, preview: wantPreview };
}

export async function selectThemeInteractively(): Promise<string> {
  const themeNames = getThemeNames();
  const buildChoice = (name: string) => {
    const styledName = colors.cyan(name);
    return { name: styledName, value: name };
  };
  const choices = themeNames.map(buildChoice);
  return select({ message: PROMPTS.selectTheme, choices });
}

async function displayThemeEntry(
  logsDX: LogsDX,
  themeName: string,
  index: number,
): Promise<void> {
  const theme = await getTheme(themeName);
  const label = `${index + 1}. ${themeName}:`;
  const styledLabel = colors.bold.cyan(label);
  const sampleLog = `INFO Sample log with ${themeName} theme - GET /api/test 200 OK`;
  const styledSample = logsDX.processLine(sampleLog);
  const description = theme?.description;
  const indentedDescription = `   ${description}`;
  const indentedSample = `   ${styledSample}`;

  log.info(styledLabel);
  if (description) log.debug(indentedDescription);
  log.info(indentedSample);
}

export async function showThemeList(): Promise<void> {
  log.info(PROMPTS.availableThemes);

  const themeNames = getThemeNames();
  const firstTheme = themeNames[0];
  const logsDX = await LogsDX.getInstance({
    theme: firstTheme,
    outputFormat: "ansi",
  });
  const displayEntry = (name: string, i: number) =>
    displayThemeEntry(logsDX, name, i);

  await themeNames.reduce(
    (p, name, i) => p.then(() => displayEntry(name, i)),
    Promise.resolve(),
  );

  log.info(PROMPTS.useInteractive);
  log.info(PROMPTS.usePreview);
}
