import type { ThemeColors, Preset, SampleLog } from "@/types/theme";

export const DEFAULT_DARK_COLORS: ThemeColors = {
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

export const AVAILABLE_PRESETS: Preset[] = [
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

export const SAMPLE_LOGS: SampleLog[] = [
  { text: "[ERROR] Failed to connect to database", category: "error" },
  { text: "[WARN] Deprecated API usage detected", category: "warning" },
  { text: "[INFO] Server started on port 3000", category: "info" },
  { text: "[DEBUG] Processing request payload: {\"user\": \"john\", \"count\": 42}", category: "debug" },
  { text: "[SUCCESS] Data sync completed successfully", category: "success" },
  { text: "Received 127 requests in the last minute", category: "metric" },
  { text: "User \"admin\" logged in from 192.168.1.1", category: "security" },
  { text: "Cache hit ratio: 0.87 (target: 0.80)", category: "performance" },
];
