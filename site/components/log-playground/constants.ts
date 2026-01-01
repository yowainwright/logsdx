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
