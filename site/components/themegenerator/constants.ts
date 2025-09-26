import type { ThemeColors, ThemePreset, SampleLog } from "./types";

export const DRACULA_COLORS: ThemeColors = {
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

export const DEFAULT_DARK_COLORS: ThemeColors = DRACULA_COLORS;

export const DEFAULT_LIGHT_COLORS: ThemeColors = {
  primary: "#2563eb",
  secondary: "#7c3aed",
  accent: "#0891b2",
  error: "#dc2626",
  warning: "#d97706",
  info: "#0284c7",
  success: "#059669",
  debug: "#4b5563",
  text: "#111827",
  background: "#ffffff",
  muted: "#9ca3af",
  highlight: "#f59e0b",
};

export const PRESET_OPTIONS: ThemePreset[] = [
  {
    id: "logLevels",
    label: "Log Levels",
    description: "ERROR, WARN, INFO, DEBUG, SUCCESS",
  },
  {
    id: "booleans",
    label: "Booleans",
    description: "true, false, null, undefined",
  },
  {
    id: "brackets",
    label: "Brackets",
    description: "{ } [ ] ( ) < >",
  },
  {
    id: "strings",
    label: "Strings",
    description: "Quoted text with single or double quotes",
  },
  {
    id: "numbers",
    label: "Numbers",
    description: "Integers and decimal values",
  },
  {
    id: "dates",
    label: "Dates",
    description: "Various date formats",
  },
  {
    id: "timestamps",
    label: "Timestamps",
    description: "ISO 8601 timestamps",
  },
  {
    id: "urls",
    label: "URLs",
    description: "HTTP/HTTPS web addresses",
  },
  {
    id: "paths",
    label: "File Paths",
    description: "Unix and Windows file paths",
  },
  {
    id: "json",
    label: "JSON Keys",
    description: "JSON object keys and structure",
  },
  {
    id: "semantic",
    label: "Semantic Versions",
    description: "Version numbers like 1.2.3",
  },
];

export const SAMPLE_LOGS: SampleLog[] = [
  // Log Levels (affected by logLevels preset)
  {
    text: "[INFO] Server initialized on port 3000",
    category: "info",
  },
  {
    text: "[ERROR] Database connection failed: ECONNREFUSED",
    category: "error",
  },
  {
    text: "[WARN] Memory usage: 85% - approaching limit",
    category: "warning",
  },
  {
    text: "[SUCCESS] Deployment completed successfully",
    category: "success",
  },
  {
    text: "[DEBUG] Query execution time: 45ms",
    category: "debug",
  },

  // Strings (affected by strings preset)
  {
    text: 'Processing request: "POST /api/users" with body: "admin@example.com"',
    category: "general",
  },
  {
    text: "Loading module: 'authentication-service' from './auth/index.js'",
    category: "general",
  },

  // Numbers (affected by numbers preset)
  {
    text: "Response time: 123.45ms | Status: 200 | Size: 1024 bytes",
    category: "general",
  },
  {
    text: "Cache stats: Hit ratio: 0.95 | Requests: 10000 | Hits: 9500",
    category: "general",
  },

  // Brackets (affected by brackets preset)
  {
    text: "Parsing JSON: { user: { id: 123, role: [admin, user] } }",
    category: "general",
  },
  {
    text: "Array processing: [1, 2, 3] => map(x => x * 2) => [2, 4, 6]",
    category: "general",
  },

  // Booleans (affected by booleans preset)
  {
    text: "Config loaded: { production: true, debug: false, ssl: null }",
    category: "general",
  },
  {
    text: "Feature flags: analytics=true, beta=false, legacy=undefined",
    category: "general",
  },

  // URLs (affected by urls preset)
  {
    text: "API endpoint: https://api.example.com/v2/users?limit=100",
    category: "general",
  },
  {
    text: "Webhook registered: http://localhost:3000/webhooks/github",
    category: "general",
  },

  // Paths (affected by paths preset)
  {
    text: "Loading config from: /etc/app/config.json",
    category: "general",
  },
  {
    text: "Saving logs to: C:\\Users\\Admin\\AppData\\logs\\app.log",
    category: "general",
  },

  // Timestamps (affected by timestamps preset)
  {
    text: "2024-01-15T10:30:45.123Z - Request received",
    category: "general",
  },
  {
    text: "[2024-01-15 10:30:45] User session started",
    category: "general",
  },

  // Semantic Versions (affected by semantic preset)
  {
    text: "Application version: v2.1.0 | Node: v20.10.0 | npm: v10.2.3",
    category: "general",
  },
];
