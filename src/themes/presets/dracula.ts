import type { Theme } from "../../types";
import { createTheme } from "../builder";

export const dracula: Theme = createTheme({
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

export default dracula;
