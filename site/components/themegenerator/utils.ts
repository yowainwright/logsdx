import type { ThemeColors } from "./types";

export function generateThemeCode(
  themeName: string,
  mode: string,
  colors: ThemeColors,
  selectedPresets: string[],
  customPatterns?: Array<{
    name: string;
    pattern: string;
    color: string;
  }>,
): string {
  const safeThemeName = themeName.replace(/-/g, "_");

  const themeConfig: Record<string, any> = {
    name: themeName,
    mode,
    colors,
    presets: selectedPresets,
  };

  if (customPatterns && customPatterns.length > 0) {
    themeConfig.customPatterns = customPatterns.map((p) => ({
      name: p.name || "custom",
      pattern: p.pattern,
      color: p.color,
    }));
  }

  const configString = JSON.stringify(themeConfig, null, 2)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/"pattern":\s*"([^"]+)"/g, "pattern: /$1/g");

  return `import { createSimpleTheme, registerTheme, getLogsDX } from 'logsdx';

const ${safeThemeName}Theme = createSimpleTheme(${configString});

registerTheme(${safeThemeName}Theme);

const logsDX = getLogsDX({ theme: '${themeName}' });

console.log(logsDX.processLine('ERROR: Something went wrong'));
console.log(logsDX.processLine('INFO: Server started on port 3000'));
console.log(logsDX.processLine('DEBUG: { user: "john", status: true }'));`;
}
