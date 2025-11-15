import type { Theme } from "../../types";
import { createTheme } from "../builder";

export const solarizedLight: Theme = createTheme({
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

export default solarizedLight;
