export type ColorMode = "light" | "dark" | "system";

export interface ThemeControlsProps {
  selectedTheme: string;
  colorMode: ColorMode;
  isDarkOnly: boolean;
  onThemeChange: (theme: string) => void;
  onColorModeChange: (mode: ColorMode) => void;
}
