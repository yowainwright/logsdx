import { loadConfig, loadThemeFromFile, getAllThemes } from "./loader";

import {
  THEMES,
  createStyle,
  formatJsonCompact,
  styleManager,
  setTheme,
  getTheme,
} from "./styles";

// Define default theme
const DEFAULT_THEME = "dracula";

export {
  loadConfig,
  loadThemeFromFile,
  getAllThemes,
  THEMES,
  createStyle,
  formatJsonCompact,
  styleManager,
  setTheme,
  getTheme,
  DEFAULT_THEME,
};
