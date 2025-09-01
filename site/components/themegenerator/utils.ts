import type { ThemeColors } from "./types";

export function generateThemeCode(
  themeName: string,
  mode: string,
  colors: ThemeColors,
  selectedPresets: string[]
): string {
  const safeThemeName = themeName.replace(/-/g, "_");
  
  return `import { createSimpleTheme, registerTheme, getLogsDX } from 'logsdx';

// Create your custom theme
const ${safeThemeName}Theme = createSimpleTheme({
  name: '${themeName}',
  mode: '${mode}',
  colors: ${JSON.stringify(colors, null, 2).replace(/"([^"]+)":/g, "$1:")},
  presets: ${JSON.stringify(selectedPresets)},
});

// Register the theme
registerTheme(${safeThemeName}Theme);

// Use your custom theme
const logsDX = getLogsDX({ theme: '${themeName}' });

// Example usage
console.log(logsDX.processLine('ERROR: Something went wrong'));
console.log(logsDX.processLine('INFO: Server started on port 3000'));
console.log(logsDX.processLine('DEBUG: { user: "john", status: true }'));`;
}