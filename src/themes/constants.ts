import { Theme } from "../types";
import { createTheme } from "./builder";

export const DEFAULT_THEME = "oh-my-zsh";

export const THEMES: Record<string, Theme> = {};

THEMES[DEFAULT_THEME] = createTheme({
  name: "oh-my-zsh",
  description: "Theme inspired by Oh My Zsh terminal colors",
  mode: "dark",
  colors: {
    primary: "#f1c40f",
    secondary: "#1abc9c",
    accent: "#f39c12",
    error: "#e74c3c",
    warning: "#f39c12",
    info: "#3498db",
    success: "#27ae60",
    debug: "#2ecc71",
    text: "#ecf0f1",
    background: "#2c3e50",
    muted: "#9b59b6",
  },
});

THEMES.dracula = createTheme({
  name: "dracula",
  description: "Dark theme based on the popular Dracula color scheme",
  mode: "dark",
  colors: {
    primary: "#ff79c6",
    secondary: "#8be9fd",
    accent: "#ffb86c",
    error: "#ff5555",
    warning: "#ffb86c",
    info: "#8be9fd",
    success: "#50fa7b",
    debug: "#bd93f9",
    text: "#f8f8f2",
    background: "#282a36",
    muted: "#6272a4",
  },
});

THEMES["github-light"] = createTheme({
  name: "github-light",
  description: "Light theme inspired by GitHub's default color scheme",
  mode: "light",
  colors: {
    primary: "#0969da",
    secondary: "#1f883d",
    accent: "#656d76",
    error: "#cf222e",
    warning: "#fb8500",
    info: "#0969da",
    success: "#1f883d",
    debug: "#8250df",
    text: "#1f2328",
    background: "#ffffff",
    muted: "#656d76",
  },
});

THEMES["github-dark"] = createTheme({
  name: "github-dark",
  description: "Dark theme inspired by GitHub's dark mode",
  mode: "dark",
  colors: {
    primary: "#58a6ff",
    secondary: "#3fb950",
    accent: "#8b949e",
    error: "#f85149",
    warning: "#f0883e",
    info: "#58a6ff",
    success: "#3fb950",
    debug: "#a5a5ff",
    text: "#e6edf3",
    background: "#0d1117",
    muted: "#8b949e",
  },
});

THEMES["solarized-light"] = createTheme({
  name: "solarized-light",
  description: "Light theme based on the popular Solarized color scheme",
  mode: "light",
  colors: {
    primary: "#2aa198",
    secondary: "#859900",
    accent: "#b58900",
    error: "#dc322f",
    warning: "#cb4b16",
    info: "#268bd2",
    success: "#859900",
    debug: "#6c71c4",
    text: "#657b83",
    background: "#fdf6e3",
    muted: "#d33682",
  },
});

THEMES["solarized-dark"] = createTheme({
  name: "solarized-dark",
  description: "Dark theme based on the popular Solarized color scheme",
  mode: "dark",
  colors: {
    primary: "#2aa198",
    secondary: "#859900",
    accent: "#b58900",
    error: "#dc322f",
    warning: "#cb4b16",
    info: "#268bd2",
    success: "#859900",
    debug: "#6c71c4",
    text: "#839496",
    background: "#002b36",
    muted: "#d33682",
  },
});

THEMES.nord = createTheme({
  name: "nord",
  description: "Arctic, north-bluish clean and elegant theme",
  mode: "dark",
  colors: {
    primary: "#88c0d0",
    secondary: "#a3be8c",
    accent: "#ebcb8b",
    error: "#bf616a",
    warning: "#d08770",
    info: "#5e81ac",
    success: "#a3be8c",
    debug: "#b48ead",
    text: "#eceff4",
    background: "#2e3440",
    muted: "#4c566a",
  },
});

THEMES.monokai = createTheme({
  name: "monokai",
  description: "Classic Monokai color scheme",
  mode: "dark",
  colors: {
    primary: "#f92672",
    secondary: "#a6e22e",
    accent: "#fd971f",
    error: "#f92672",
    warning: "#fd971f",
    info: "#66d9ef",
    success: "#a6e22e",
    debug: "#ae81ff",
    text: "#f8f8f2",
    background: "#272822",
    muted: "#75715e",
  },
});
