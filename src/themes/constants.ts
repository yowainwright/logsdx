import { Theme } from "@/src/types";
import { createTheme } from "@/src/themes/builder";

export const DEFAULT_THEME = "oh-my-zsh";

export const THEMES: Record<string, Theme> = {};

THEMES[DEFAULT_THEME] = createTheme({
  name: "oh-my-zsh",
  description: "Theme inspired by Oh My Zsh terminal colors",
  colors: {
    primary: "yellow",
    secondary: "cyan",
    accent: "yellow",
    error: "red",
    warning: "yellow",
    info: "blue",
    success: "green",
    debug: "green",
    text: "white",
    muted: "magenta",
  },
});

THEMES.dracula = createTheme({
  name: "dracula",
  description: "Dark theme based on the popular Dracula color scheme",
  colors: {
    primary: "pink",
    secondary: "lightBlue",
    accent: "orange",
    error: "red",
    warning: "orange",
    info: "cyan",
    success: "lightGreen",
    debug: "purple",
    text: "lightGray",
    muted: "purple",
  },
});

THEMES["github-light"] = createTheme({
  name: "github-light",
  description: "Light theme inspired by GitHub's default color scheme",
  colors: {
    primary: "blue",
    secondary: "forestGreen",
    accent: "darkGray",
    error: "red",
    warning: "orange",
    info: "blue",
    success: "green",
    debug: "purple",
    text: "black",
    muted: "gray",
  },
});

THEMES["github-dark"] = createTheme({
  name: "github-dark",
  description: "Dark theme inspired by GitHub's dark mode",
  colors: {
    primary: "lightBlue",
    secondary: "lightGreen",
    accent: "gray",
    error: "red",
    warning: "orange",
    info: "lightBlue",
    success: "lightGreen",
    debug: "purple",
    text: "lightGray",
    muted: "gray",
  },
});

THEMES["solarized-light"] = createTheme({
  name: "solarized-light",
  description: "Light theme based on the popular Solarized color scheme",
  colors: {
    primary: "cyan",
    secondary: "green",
    accent: "yellow",
    error: "red",
    warning: "orange",
    info: "blue",
    success: "green",
    debug: "violet",
    text: "base00",
    muted: "magenta",
  },
});

THEMES["solarized-dark"] = createTheme({
  name: "solarized-dark",
  description: "Dark theme based on the popular Solarized color scheme",
  colors: {
    primary: "cyan",
    secondary: "green",
    accent: "yellow",
    error: "red",
    warning: "orange",
    info: "blue",
    success: "green",
    debug: "violet",
    text: "base0",
    muted: "magenta",
  },
});
