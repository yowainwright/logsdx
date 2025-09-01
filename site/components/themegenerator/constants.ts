import type { ThemeColors, ThemePreset, SampleLog } from "./types";

export const DEFAULT_DARK_COLORS: ThemeColors = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  accent: "#06b6d4",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#0ea5e9",
  success: "#10b981",
  debug: "#6b7280",
  text: "#e5e7eb",
  background: "#111827",
  muted: "#6b7280",
  highlight: "#fbbf24",
};

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
  {
    text: "2024-01-15T10:30:45.123Z INFO: Server started on port 3000",
    category: "info",
  },
  {
    text: "ERROR: Connection failed to database at localhost:5432",
    category: "error",
  },
  {
    text: 'DEBUG: Processing user request { id: 123, status: true, name: "John Doe" }',
    category: "debug",
  },
  {
    text: "WARN: Memory usage high (85.3%) - threshold exceeded",
    category: "warning",
  },
  {
    text: "SUCCESS: Build completed in 3.45 seconds - v2.1.0",
    category: "success",
  },
  {
    text: "[API] GET https://api.example.com/users/123 - 200 OK (45ms)",
    category: "general",
  },
  {
    text: "Loading configuration from /etc/app/config.json",
    category: "general",
  },
  {
    text: "Database query: SELECT * FROM users WHERE active = true LIMIT 100",
    category: "general",
  },
  {
    text: "TypeError: Cannot read property 'length' of undefined at index.js:42",
    category: "error",
  },
  {
    text: "Cache hit ratio: 0.923 | Total requests: 10450 | Hits: 9646",
    category: "info",
  },
];
