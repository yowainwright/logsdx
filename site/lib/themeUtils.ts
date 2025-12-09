import type { ThemeColors } from "@/components/themegenerator/types";
import { DEFAULT_DARK_COLORS } from "@/components/themegenerator/constants";

interface ThemeExport {
  name: string;
  colors: ThemeColors;
  presets: string[];
  version: string;
}

export function exportThemeToShareCode(
  name: string,
  colors: ThemeColors,
  presets: string[],
): string {
  const data: ThemeExport = {
    name,
    colors,
    presets,
    version: "1.0.0",
  };
  return btoa(JSON.stringify(data));
}

export function importThemeFromShareCode(shareCode: string): {
  name: string;
  colors: ThemeColors;
  presets: string[];
} | null {
  try {
    const data = JSON.parse(atob(shareCode)) as ThemeExport;
    return {
      name: data.name || "imported-theme",
      colors: data.colors || DEFAULT_DARK_COLORS,
      presets: data.presets || [],
    };
  } catch (error) {
    console.error("Failed to import theme:", error);
    return null;
  }
}

export function generateShareUrl(shareCode: string): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return `${baseUrl}/theme/${shareCode}`;
}

export function generateThemeCode(
  name: string,
  colors: ThemeColors,
  presets: string[],
): string {
  const varName = name.replace(/-/g, "_");

  return `import { createSimpleTheme, registerTheme } from 'logsdx';

const ${varName}Theme = createSimpleTheme('${name}', ${JSON.stringify(colors, null, 2)}, {
  mode: 'dark',
  presets: ${JSON.stringify(presets)}
});

registerTheme(${varName}Theme);

export default ${varName}Theme;`;
}
