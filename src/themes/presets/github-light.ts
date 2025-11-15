import type { Theme } from "../../types";
import { createTheme } from "../builder";

export const githubLight: Theme = createTheme({
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

export default githubLight;
