import type { Theme } from "../../types";
import { createTheme } from "../builder";

export const nord: Theme = createTheme({
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

export default nord;
