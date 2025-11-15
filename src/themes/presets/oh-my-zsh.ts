import type { Theme } from "../../types";
import { createTheme } from "../builder";

export const ohMyZsh: Theme = createTheme({
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

export default ohMyZsh;
