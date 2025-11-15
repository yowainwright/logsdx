import type { Theme } from "../../types";
import { createTheme } from "../builder";

export const monokai: Theme = createTheme({
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

export default monokai;
