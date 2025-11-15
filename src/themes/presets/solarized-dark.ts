import type { Theme } from "../../types";
import { createTheme } from "../builder";

export const solarizedDark: Theme = createTheme({
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

export default solarizedDark;
