#!/usr/bin/env bun

import { getLogsDX, getTheme, isLightThemeStyle } from "../src/index";
import { renderLightBox } from "../src/renderer/light-box";

console.log("Theme Mode Testing");
console.log("==================\n");

// Check current theme modes
const themes = [
  "github-light",
  "github-dark",
  "solarized-light",
  "solarized-dark",
  "dracula",
  "oh-my-zsh",
];

console.log("Current theme modes:");
themes.forEach((name) => {
  const theme = getTheme(name);
  console.log(
    `${name.padEnd(20)} mode: ${theme.mode || "not specified"} (isLight: ${isLightThemeStyle(theme)})`,
  );
});

// Test creating a custom theme with explicit mode
const customDarkTheme = {
  name: "my-custom-theme",
  description: "A custom theme with light colors but dark mode",
  mode: "dark" as const,
  schema: {
    defaultStyle: {
      color: "#ffffff", // Light text
    },
    matchWords: {
      ERROR: { color: "#ff9999", styleCodes: ["bold"] },
      INFO: { color: "#99ccff", styleCodes: ["bold"] },
    },
  },
};

const customLightTheme = {
  name: "my-light-theme",
  description: "A custom theme explicitly marked as light",
  mode: "light" as const,
  schema: {
    defaultStyle: {
      color: "#000000", // Dark text
    },
    matchWords: {
      ERROR: { color: "#cc0000", styleCodes: ["bold"] },
      INFO: { color: "#0066cc", styleCodes: ["bold"] },
    },
  },
};

console.log("\n\nCustom theme detection:");
console.log(
  `Custom dark theme - isLight: ${isLightThemeStyle(customDarkTheme)}`,
);
console.log(
  `Custom light theme - isLight: ${isLightThemeStyle(customLightTheme)}`,
);

// Demo with custom themes
const sampleLog = "INFO: Testing custom theme mode detection";

console.log("\n\nCustom theme rendering:");

// Dark theme (no box needed)
const darkLogger = getLogsDX({ theme: customDarkTheme, outputFormat: "ansi" });
console.log("\nDark theme (no box):");
console.log(darkLogger.processLine(sampleLog));

// Light theme (with box)
const lightLogger = getLogsDX({
  theme: customLightTheme,
  outputFormat: "ansi",
});
console.log("\nLight theme (with box):");
const boxLines = renderLightBox(
  [lightLogger.processLine(sampleLog)],
  customLightTheme,
  "CUSTOM LIGHT THEME",
  { width: 60 },
);
boxLines.forEach((line) => console.log(line));
