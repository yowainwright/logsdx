export const CLI_NAME = "logsdx";
export const CLI_VERSION = "0.1.1";
export const CLI_DESCRIPTION = "Enhanced log styling and visualization tool";
export const THEME_CREATOR_VERSION = "Theme Creator v1.0.0";

export const DEFAULT_THEME = "default";
export const DEFAULT_OUTPUT = "styled";

export const EXIT_SUCCESS = 0;
export const EXIT_ERROR = 1;

export const INDENT = "  ";
export const indent = (text: string, level = 1): string =>
  INDENT.repeat(level) + text;

export const SIZE_UNITS: ReadonlyArray<string> = [
  "B",
  "KB",
  "MB",
  "GB",
  "TB",
] as const;
export const SIZE_UNIT_MULTIPLIER = 1024;

export const HEX_COLOR_PATTERN =
  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/;
export const RGB_COLOR_PATTERN =
  /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/;
export const NAMED_COLORS = [
  "red",
  "green",
  "blue",
  "yellow",
  "cyan",
  "magenta",
  "white",
  "black",
  "gray",
  "notacolor",
] as const;

export const BANNER_ASCII = `
  ╦  ┌─┐┌─┐┌─┐╔╦╗═╗ ╦
  ║  │ ││ ┬└─┐ ║║╔╩╦╝
  ╩═╝└─┘└─┘└─┘═╩╝╩ ╚═
  `;

export const SAMPLE_LOGS = [
  "INFO: Server started on port 3000",
  "WARN: Memory usage high: 85%",
  "ERROR: Database connection failed",
  "DEBUG: Processing request id=12345",
  "SUCCESS: All tests passed",
  "[2024-01-15 10:23:45] Request completed",
  "GET /api/users 200 OK (123ms)",
  "Cache hit ratio: 92.5%",
] as const;

export const INTERACTIVE_SAMPLE_LOG = `2024-01-15 10:30:45 INFO [server] Application started successfully
2024-01-15 10:30:46 DEBUG [auth] Loading user credentials from /etc/config
2024-01-15 10:30:47 WARN [database] Connection pool at 80% capacity
2024-01-15 10:30:48 ERROR [api] Failed to process request: /users/123/profile
2024-01-15 10:30:49 INFO [cache] Cache hit ratio: 94.5%
GET /api/users/123 200 142ms - "Mozilla/5.0"
POST /api/auth/login 401 23ms - Invalid credentials
192.168.1.100 - "GET /health HTTP/1.1" 200 5ms`;

export const COLOR_PRESETS = {
  Vibrant: {
    primary: "#007acc",
    error: "#ff4444",
    warning: "#ff9900",
    success: "#00cc66",
    info: "#00aaff",
    muted: "#666666",
  },
  Pastel: {
    primary: "#87ceeb",
    error: "#ffb6c1",
    warning: "#ffd700",
    success: "#98fb98",
    info: "#add8e6",
    muted: "#d3d3d3",
  },
  Neon: {
    primary: "#00ffff",
    error: "#ff0080",
    warning: "#ffff00",
    success: "#00ff00",
    info: "#ff00ff",
    muted: "#808080",
  },
  Earth: {
    primary: "#8b7355",
    error: "#cd5c5c",
    warning: "#daa520",
    success: "#228b22",
    info: "#4682b4",
    muted: "#696969",
  },
  Ocean: {
    primary: "#006994",
    error: "#ff6b6b",
    warning: "#ffd93d",
    success: "#4ecdc4",
    info: "#45b7d1",
    muted: "#95a5a6",
  },
  Custom: null,
} as const;

export const DEFAULT_COLORS = {
  primary: "#ffffff",
  error: "#ff4444",
  warning: "#ff9900",
  success: "#00cc66",
  info: "#00aaff",
  muted: "#666666",
} as const;

export const UI_LABELS = {
  ok: "[ok]",
  error: "[error]",
  warn: "[warn]",
  info: "[info]",
  hint: "hint:",
  file: "File:",
  lines: "Lines:",
  size: "Size:",
} as const;

export const PROMPTS = {
  themeName: "Theme name:",
  themeNameRequired: "Theme name is required",
  themeExists: "A theme with this name already exists",
  themeDescription: "Theme description:",
  themeMode: "Theme mode:",
  chooseColorPreset: "Choose a color preset:",
  customDefineOwn: "Custom (define your own)",
  loadingColorPicker: "Loading color picker...",
  primaryColor: "Primary color (hex):",
  errorColor: "Error color (hex):",
  warningColor: "Warning color (hex):",
  successColor: "Success color (hex):",
  infoColor: "Info color (hex):",
  mutedColor: "Muted color (hex):",
  invalidHexColor: "Invalid hex color",
  selectFeatures: "Select features to highlight:",
  creatingTheme: "Creating theme...",
  themeCreated: "Theme created!",
  checkAccessibility: "Check accessibility compliance?",
  checkingAccessibility: "Checking accessibility...",
  accessibilityReport: "Accessibility Report",
  noIssuesFound: "No issues found",
  autoFixAccessibility: "Auto-fix accessibility issues?",
  fixingAccessibility: "Fixing accessibility issues...",
  accessibilityFixed: "Accessibility issues fixed!",
  saveThemeHow: "How would you like to save the theme?",
  themeCreationComplete: "Theme creation complete!",
  saveAs: "Save as:",
  chooseTheme: "Choose a theme:",
  previewThemes: "Preview themes",
  previewDescription: "See how each theme looks with sample logs",
  themePreviews: "Theme Previews:",
  nowChooseTheme: "Now choose your theme:",
  chooseOutputFormat: "Choose output format:",
  showPreview: "Show a preview with your settings?",
  previewWithSettings: "Preview with your selected settings:",
  saveAsDefault: "Save these settings as default?",
  configSaved: "Configuration saved to ~/.logsdxrc.json",
  selectTheme: "Select a theme:",
  availableThemes: "Available Themes:",
  useInteractive: "Use --interactive for guided theme selection",
  usePreview: "Use --preview to see all themes with sample logs",
  welcomeInteractive: "Welcome to LogsDX Interactive Mode!",
  wizardHelp:
    "This wizard will help you select the perfect theme and settings for your logs.",
  noDescription: "No description available",
} as const;

export const THEME_MODES = [
  { name: "Dark (for dark terminals)", value: "dark" },
  { name: "Light (for light terminals)", value: "light" },
  { name: "Auto (system preference)", value: "auto" },
] as const;

export const SAVE_OPTIONS = [
  { name: "Export as JSON file", value: "json" },
  { name: "Export as TypeScript file", value: "typescript" },
  { name: "Copy to clipboard", value: "clipboard" },
  { name: "Register for immediate use", value: "register" },
  { name: "Don't save", value: "none" },
] as const;

export const OUTPUT_FORMATS = {
  ansi: {
    label: "ANSI",
    hint: "terminal colors",
    desc: "Perfect for terminal output with colors and styling",
  },
  html: {
    label: "HTML",
    hint: "web/browser",
    desc: "Generates HTML with inline styles for web display",
  },
} as const;

export const FEATURE_PRESETS = [
  { name: "Log levels (ERROR, WARN, INFO)", value: "logLevels", checked: true },
  { name: "Numbers and numeric values", value: "numbers", checked: true },
  { name: "Dates and timestamps", value: "dates", checked: true },
  { name: "Boolean values", value: "booleans", checked: true },
  { name: "Brackets and punctuation", value: "brackets", checked: true },
  { name: "Quoted strings", value: "strings", checked: false },
] as const;
