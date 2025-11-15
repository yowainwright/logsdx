import type { ThemeColors } from "@/components/themegenerator/types";

export const mockColors: ThemeColors = {
  primary: "#bd93f9",
  secondary: "#ff79c6",
  accent: "#8be9fd",
  error: "#ff5555",
  warning: "#ffb86c",
  info: "#8be9fd",
  success: "#50fa7b",
  debug: "#6272a4",
  text: "#f8f8f2",
  background: "#282a36",
  muted: "#6272a4",
  highlight: "#f1fa8c",
};

export const mockPresets = [
  {
    id: "logLevels",
    label: "Log Levels",
    description: "ERROR, WARN, INFO, DEBUG, SUCCESS",
  },
  {
    id: "numbers",
    label: "Numbers",
    description: "Integers and decimal values",
  },
  {
    id: "strings",
    label: "Strings",
    description: "Quoted text",
  },
];
