import type { ThemeColors } from "@/types/theme";

export function exportThemeToShareCode(
  name: string,
  colors: ThemeColors,
  presets: string[]
): string {
  const themeData = {
    name,
    colors,
    presets,
    version: "1.0.0",
  };
  return btoa(JSON.stringify(themeData));
}

export function importThemeFromShareCode(shareCode: string): {
  name: string;
  colors: ThemeColors;
  presets: string[];
} | null {
  try {
    const decoded = atob(shareCode);
    const data = JSON.parse(decoded);
    
    return {
      name: data.name || "imported-theme",
      colors: data.colors || {},
      presets: data.presets || [],
    };
  } catch {
    return null;
  }
}

export function generateShareUrl(shareCode: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/theme/${shareCode}`;
}

export function generateThemeCode(
  name: string,
  colors: ThemeColors,
  presets: string[]
): string {
  const varName = name.replace(/-/g, "_");
  const presetsStr = presets.map(p => `"${p}"`).join(", ");
  const colorsJson = JSON.stringify(colors, null, 2);
  
  return `import { createSimpleTheme, registerTheme } from "logsdx";

const ${varName}Theme = createSimpleTheme(
  "${name}",
  ${colorsJson},
  { mode: "dark", presets: [${presetsStr}] }
);

registerTheme(${varName}Theme);

export default ${varName}Theme;
`;
}
