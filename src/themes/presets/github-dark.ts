import type { Theme } from "../../types";
import { createTheme } from "../builder";

export const githubDark: Theme = createTheme({
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

export default githubDark;
