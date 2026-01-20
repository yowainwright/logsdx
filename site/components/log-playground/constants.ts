export const DEFAULT_LOGS = `[2024-01-15 10:23:45] INFO: Application starting...
[2024-01-15 10:23:46] DEBUG: Loading configuration from /etc/app/config.json
[2024-01-15 10:23:47] SUCCESS: Database connected to postgres://localhost:5432/myapp
[2024-01-15 10:23:48] WARN: Memory usage at 75% - consider scaling
[2024-01-15 10:23:49] ERROR: Failed to connect to Redis: ECONNREFUSED 127.0.0.1:6379
GET /api/users 200 OK (45ms)
POST /api/auth/login 401 Unauthorized (12ms)
{"level":"info","message":"User logged in","userId":123,"timestamp":"2024-01-15T10:23:50Z"}
Processing batch job... [████████████████████] 100%
✓ All 42 tests passed in 3.2s`;

export const AVAILABLE_THEMES = [
  "oh-my-zsh",
  "dracula",
  "nord",
  "monokai",
  "github-light",
  "github-dark",
  "solarized-light",
  "solarized-dark",
] as const;

export const THEME_LABELS: Record<string, string> = {
  "oh-my-zsh": "Oh My Zsh",
  dracula: "Dracula",
  nord: "Nord",
  monokai: "Monokai",
  "github-light": "GitHub Light",
  "github-dark": "GitHub Dark",
  "solarized-light": "Solarized Light",
  "solarized-dark": "Solarized Dark",
};

export const TEXT_TITLE_HIGHLIGHT = "Live";
export const TEXT_TITLE_REST = "Log Playground";
export const TEXT_DESCRIPTION =
  "Paste your logs below and see them transformed in real-time";
export const TEXT_CARD_TITLE = "Try It Yourself";
export const TEXT_LABEL_INPUT_LOGS = "Input Logs";
export const TEXT_LABEL_INPUT_PLACEHOLDER = "Paste your logs here...";
export const TEXT_LABEL_BROWSER_CONSOLE = "Browser Console";
export const TEXT_LABEL_TERMINAL = "Terminal";
export const TEXT_LABEL_RESET = "Reset";

export const CLASS_SECTION = "py-24 bg-white dark:bg-slate-950";
export const CLASS_CONTAINER = "container mx-auto px-4";
export const CLASS_WRAPPER = "mx-auto max-w-6xl";
export const CLASS_HEADER_TITLE =
  "mb-4 text-center text-5xl lg:text-6xl font-bold";
export const CLASS_HEADER_GRADIENT =
  "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent";
export const CLASS_HEADER_DESCRIPTION =
  "mb-12 text-center text-xl text-slate-600 dark:text-slate-400";
export const CLASS_CARD_HEADER =
  "flex flex-row items-center justify-between pb-4";
export const CLASS_CARD_TITLE = "text-xl";
export const CLASS_CARD_CONTROLS = "flex items-center gap-4";
export const CLASS_CARD_CONTENT = "pt-0";
export const CLASS_MAIN_GRID = "grid lg:grid-cols-3 gap-4";
export const CLASS_PANE_WRAPPER =
  "border rounded-lg overflow-hidden dark:border-slate-700";
export const CLASS_PANE_HEADER =
  "px-4 py-2 bg-slate-800 text-white text-sm font-medium";
export const CLASS_TEXTAREA =
  "w-full h-full min-h-[400px] p-4 font-mono text-sm bg-slate-50 dark:bg-slate-900 border-0 resize-none focus:outline-none";
export const CLASS_OUTPUT_CONTENT =
  "flex-1 p-4 font-mono text-xs overflow-auto min-h-[400px]";

export const HEADER_DROP_SHADOW = "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))";
export const LIGHT_BG = "#ffffff";
export const DARK_BG = "#1e1e1e";
