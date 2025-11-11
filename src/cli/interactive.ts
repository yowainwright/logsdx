import { select, confirm } from "../utils/prompts";
import { LogsDX, getThemeNames, getTheme } from "../index";
import { ui } from "./ui";
import chalk from "chalk";
import { z } from "zod";

export const interactiveConfigSchema = z.object({
  theme: z.string(),
  outputFormat: z.enum(["ansi", "html"]),
  preview: z.boolean(),
});

export type InteractiveConfig = z.infer<typeof interactiveConfigSchema>;

export const themeChoiceSchema = z.object({
  name: z.string(),
  value: z.string(),
  description: z.string(),
});

export type ThemeChoice = z.infer<typeof themeChoiceSchema>;

const SAMPLE_LOG = `2024-01-15 10:30:45 INFO [server] Application started successfully
2024-01-15 10:30:46 DEBUG [auth] Loading user credentials from /etc/config
2024-01-15 10:30:47 WARN [database] Connection pool at 80% capacity  
2024-01-15 10:30:48 ERROR [api] Failed to process request: /users/123/profile
2024-01-15 10:30:49 INFO [cache] Cache hit ratio: 94.5%
GET /api/users/123 200 142ms - "Mozilla/5.0"
POST /api/auth/login 401 23ms - Invalid credentials
192.168.1.100 - "GET /health HTTP/1.1" 200 5ms`;

export async function runInteractiveMode(): Promise<InteractiveConfig> {
  ui.showHeader();
  ui.showInfo("Welcome to LogsDX Interactive Mode! 🚀");

  console.log(
    chalk.dim(
      "This wizard will help you select the perfect theme and settings for your logs.\n",
    ),
  );

  
  const themeNames = getThemeNames();
  const themeChoices: ThemeChoice[] = themeNames.map((name: string) => ({
    name: chalk.cyan(name),
    value: name,
    description: getTheme(name)?.description || "No description available",
  }));

  const selectedTheme = await select({
    message: "🎨 Choose a theme:",
    choices: [
      ...themeChoices,
      {
        name: chalk.yellow("🔍 Preview themes"),
        value: "__preview__",
        description: "See how each theme looks with sample logs",
      },
    ],
  });

  let finalTheme = selectedTheme;

  if (selectedTheme === "__preview__") {
    ui.showInfo("Theme Previews:\n");

    for (const themeName of themeNames) {
      const logsDX = LogsDX.getInstance({
        theme: themeName,
        outputFormat: "ansi",
      });
      const styledSample = logsDX.processLog(SAMPLE_LOG);
      ui.showThemePreview(themeName, styledSample);
    }

    finalTheme = await select({
      message: "🎨 Now choose your theme:",
      choices: themeChoices,
    });
  }

  
  const outputFormat = await select({
    message: "📤 Choose output format:",
    choices: [
      {
        name: chalk.green("ANSI") + chalk.dim(" (terminal colors)"),
        value: "ansi" as const,
        description: "Perfect for terminal output with colors and styling",
      },
      {
        name: chalk.blue("HTML") + chalk.dim(" (web/browser)"),
        value: "html" as const,
        description: "Generates HTML with inline styles for web display",
      },
    ],
  });

  
  const wantPreview = await confirm({
    message: "👀 Show a preview with your settings?",
    default: true,
  });

  if (wantPreview) {
    console.log("\n" + chalk.bold("🎬 Preview with your selected settings:"));
    const logsDX = LogsDX.getInstance({
      theme: finalTheme,
      outputFormat,
    });
    const styledSample = logsDX.processLog(SAMPLE_LOG);
    ui.showThemePreview(
      `${finalTheme} (${outputFormat.toUpperCase()})`,
      styledSample,
    );
  }

  const saveConfig = await confirm({
    message: "💾 Save these settings as default?",
    default: false,
  });

  if (saveConfig) {
    ui.showInfo("Configuration saved to ~/.logsdxrc.json");
  }

  const result = interactiveConfigSchema.parse({
    theme: finalTheme,
    outputFormat,
    preview: wantPreview,
  });

  return result;
}

export async function selectThemeInteractively(): Promise<string> {
  const themeNames = getThemeNames();

  return await select({
    message: "🎨 Select a theme:",
    choices: themeNames.map((name: string) => ({
      name: chalk.cyan(name),
      value: name,
    })),
  });
}

export function showThemeList(): void {
  ui.showInfo("Available Themes:\n");

  const themeNames = getThemeNames();
  const logsDX = LogsDX.getInstance({
    theme: themeNames[0],
    outputFormat: "ansi",
  });

  themeNames.forEach((themeName: string, index: number) => {
    const theme = getTheme(themeName);
    const sample = `${index + 1}. ${themeName}`;
    const styledSample = logsDX.processLine(
      `INFO Sample log with ${themeName} theme - GET /api/test 200 OK`,
    );

    console.log(chalk.bold.cyan(`\n${sample}:`));
    if (theme?.description) {
      console.log(chalk.dim(`   ${theme.description}`));
    }
    console.log(`   ${styledSample}`);
  });

  console.log(
    chalk.yellow("\n💡 Use --interactive for guided theme selection"),
  );
  console.log(
    chalk.yellow("💡 Use --preview to see all themes with sample logs"),
  );
}
