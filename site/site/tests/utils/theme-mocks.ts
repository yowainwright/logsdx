import type { ThemeColors } from "@/types/theme";

export const mockColors: ThemeColors = {
  primary: "#bd93f9",
  secondary: "#8be9fd",
  accent: "#50fa7b",
  error: "#ff5555",
  warning: "#ffb86c",
  info: "#8be9fd",
  success: "#50fa7b",
  text: "#f8f8f2",
  background: "#282a36",
  border: "#44475a",
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
  {
    id: "brackets",
    label: "Brackets",
    description: "[], {}, ()",
  },
];
