import { loadConfig, loadThemeFromFile, getAllThemes } from "./loader";

import {
  THEMES,
  createStyle,
  formatJsonCompact,
  styleManager,
  setTheme,
  getTheme,
} from "./styles";

// Re-export from core theme for compatibility
import { DEFAULT_THEME } from "../../../src/theme";

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
