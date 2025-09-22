<div align="center"><img alt="logsdx" width="300" src="https://github.com/user-attachments/assets/cc2a3b55-5bfd-44e8-a330-bfa146b50059" /></div>

# LogsDX

**Beautiful, consistent log styling for terminal and browser environments.**

LogsDX is a schema-based theming engine that applies consistent visual styling to logs across all environments—write themes once, style logs everywhere.

## Features

- 🎨 **Unified Theming** - One theme works in terminal, browser, and CI/CD
- 🚀 **Zero Dependencies** - Works with any existing logger
- 📦 **8+ Built-in Themes** - Production-ready themes included
- 🛠️ **CLI Tool** - Process log files with beautiful formatting
- ♿ **Accessible** - WCAG compliance checking built-in
- 🌓 **Light/Dark Mode** - Automatic theme adaptation

## Installation

```bash
# npm
npm install logsdx

# bun (recommended for development)
bun add logsdx

# yarn
yarn add logsdx

# pnpm
pnpm add logsdx
```

**Requirements:** Node.js 18+ or Bun 1.0+

## Getting Started

### 1. Basic Usage - Style Your Console Logs

```javascript
import { getLogsDX } from "logsdx";

// Initialize with a built-in theme
const logger = getLogsDX("dracula");

// Style a log line
console.log(
  logger.processLine(
    "ERROR: Database connection failed at 2024-01-15T10:30:45Z",
  ),
);
// Output: Styled text with ERROR in red, timestamp in dim gray
```

### 2. Process Multiple Lines

```javascript
const logs = [
  "INFO: Server started on port 3000",
  "WARN: Memory usage above 80%",
  "ERROR: Failed to connect to database",
];

// Process all lines at once
const styledLogs = logger.processLines(logs);
styledLogs.forEach((line) => console.log(line));
```

### 3. Browser Integration (React Example)

```jsx
import { LogsDX } from "logsdx";

function LogViewer({ logs }) {
  const logger = LogsDX.getInstance({
    theme: "dracula",
    outputFormat: "html",
    htmlStyleFormat: "css",
  });

  return (
    <div className="log-container">
      {logs.map((log, i) => (
        <div
          key={i}
          dangerouslySetInnerHTML={{ __html: logger.processLine(log) }}
        />
      ))}
    </div>
  );
}
```

### 4. Use Different Output Formats

```javascript
// Terminal output with ANSI colors
const terminalLogger = getLogsDX("dracula", {
  outputFormat: "ansi",
});

// HTML with inline styles
const htmlLogger = getLogsDX("dracula", {
  outputFormat: "html",
  htmlStyleFormat: "css",
});

// HTML with CSS classes
const classLogger = getLogsDX("dracula", {
  outputFormat: "html",
  htmlStyleFormat: "className",
});

const line = "ERROR: Connection timeout";
console.log(terminalLogger.processLine(line)); // \x1b[31;1mERROR\x1b[0m: Connection timeout
console.log(htmlLogger.processLine(line)); // <span style="color:#ff5555;font-weight:bold">ERROR</span>: Connection timeout
console.log(classLogger.processLine(line)); // <span class="logsdx-error logsdx-bold">ERROR</span>: Connection timeout
```

## CLI Usage

After installation, the `logsdx` CLI tool is available globally:

### Setup & Basic Commands

```bash
# Process a log file with default theme
logsdx server.log

# Use a specific theme
logsdx server.log --theme nord

# Save formatted output
logsdx server.log --output formatted.log

# Process from stdin
tail -f app.log | logsdx

# List all available themes
logsdx --list-themes
```

### Real-World Examples

```bash
# Format nginx access logs
logsdx /var/log/nginx/access.log --theme github-dark

# Process Docker logs
docker logs my-container | logsdx --theme dracula

# Format and save application logs
logsdx app.log --theme nord --output styled-app.log

# Debug mode for troubleshooting
logsdx app.log --debug
```

## Creating Custom Themes

### Method 1: Using the Theme Creator (Interactive)

```bash
bun run create-theme
```

This launches an interactive wizard that helps you:

- Choose color presets (Vibrant, Pastel, Neon, etc.)
- Preview your theme in real-time
- Check WCAG accessibility compliance
- Export to JSON or TypeScript

### Method 2: Define Programmatically

```javascript
import { createTheme, registerTheme } from "logsdx";

const myTheme = createTheme({
  name: "my-company-theme",
  mode: "dark",
  schema: {
    defaultStyle: {
      color: "#e0e0e0",
    },
    matchWords: {
      ERROR: { color: "#ff5555", styleCodes: ["bold"] },
      WARN: { color: "#ffaa00" },
      INFO: { color: "#00aaff" },
      DEBUG: { color: "#888888", styleCodes: ["dim"] },
    },
    matchPatterns: [
      {
        name: "timestamp",
        pattern: "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}",
        options: { color: "#666666", styleCodes: ["italic"] },
      },
      {
        name: "ip-address",
        pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
        options: { color: "#ff00ff" },
      },
    ],
    matchStartsWith: {
      "[": { color: "#aaaaaa" },
      "{": { color: "#00ff00" },
    },
  },
});

// Register and use the theme
registerTheme(myTheme);
const logger = getLogsDX("my-company-theme");
```

### Method 3: JSON Configuration File

Create `my-theme.json`:

```json
{
  "name": "production",
  "mode": "dark",
  "schema": {
    "defaultStyle": {
      "color": "#ffffff"
    },
    "matchWords": {
      "ERROR": {
        "color": "#ff4444",
        "styleCodes": ["bold", "underline"]
      },
      "SUCCESS": {
        "color": "#00ff00",
        "styleCodes": ["bold"]
      }
    },
    "matchPatterns": [
      {
        "name": "uuid",
        "pattern": "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
        "options": {
          "color": "#cyan",
          "styleCodes": ["italic"]
        }
      }
    ]
  }
}
```

Load and use:

```javascript
import theme from "./my-theme.json";
const logger = getLogsDX(theme);
```

## Integration with Popular Loggers

LogsDX works as a styling layer on top of any logger:

### Winston

```javascript
import winston from "winston";
import { getLogsDX } from "logsdx";

const logsDX = getLogsDX("dracula");

const logger = winston.createLogger({
  format: winston.format.printf((info) => {
    const message = `${info.level.toUpperCase()}: ${info.message}`;
    return logsDX.processLine(message);
  }),
  transports: [new winston.transports.Console()],
});

logger.info("Application started");
logger.error("Database connection failed");
```

### Pino

```javascript
import pino from "pino";
import { getLogsDX } from "logsdx";

const logsDX = getLogsDX("nord");

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      messageFormat: (log, messageKey) => {
        const msg = log[messageKey];
        return logsDX.processLine(msg);
      },
    },
  },
});
```

### Console Override (Global)

```javascript
import { getLogsDX } from "logsdx";

const logsDX = getLogsDX("github-dark");
const originalLog = console.log;

console.log = (...args) => {
  const message = args.join(" ");
  originalLog(logsDX.processLine(message));
};

// Now all console.log calls are styled
console.log("ERROR: Something went wrong");
console.log("INFO: Process completed");
```

## API Reference

### Core Functions

#### `getLogsDX(theme, options?)`

Returns a LogsDX instance configured with the specified theme.

```typescript
const logger = getLogsDX("dracula", {
  outputFormat: "ansi", // "ansi" | "html"
  htmlStyleFormat: "css", // "css" | "className"
  debug: false, // Enable debug output
});
```

#### `LogsDX.getInstance(config)`

Singleton pattern for getting a LogsDX instance.

```typescript
const logger = LogsDX.getInstance({
  theme: "nord",
  outputFormat: "html",
});
```

### Instance Methods

#### `processLine(line: string): string`

Process a single log line with theme styling.

#### `processLines(lines: string[]): string[]`

Process multiple log lines at once.

#### `processLog(text: string): string`

Process a multi-line log string (splits by newlines).

### Theme Management

#### `getAllThemes(): Theme[]`

Get all available themes.

#### `getThemeNames(): string[]`

Get names of all available themes.

#### `getTheme(name: string): Theme | undefined`

Get a specific theme by name.

#### `registerTheme(theme: Theme): void`

Register a custom theme for use.

#### `validateTheme(theme: Theme): ValidationResult`

Validate theme schema and check for errors.

### Configuration Options

| Option            | Type                   | Default       | Description                       |
| ----------------- | ---------------------- | ------------- | --------------------------------- |
| `theme`           | `string \| Theme`      | `"oh-my-zsh"` | Theme name or custom theme object |
| `outputFormat`    | `"ansi" \| "html"`     | `"ansi"`      | Output format for styled text     |
| `htmlStyleFormat` | `"css" \| "className"` | `"css"`       | HTML styling method               |
| `debug`           | `boolean`              | `false`       | Enable debug output               |

### Style Codes

Available style codes for text decoration:

- `bold` - Bold text
- `italic` - Italic text
- `underline` - Underlined text
- `dim` - Dimmed/faded text
- `blink` - Blinking text (terminal support varies)
- `reverse` - Reversed colors
- `strikethrough` - Strikethrough text

### Pattern Matching Priority

LogsDX applies styles in this priority order (highest to lowest):

1. **`matchWords`** - Exact word matches
2. **`matchPatterns`** - Regular expression patterns
3. **`matchStartsWith`** - String prefix matches
4. **`matchEndsWith`** - String suffix matches
5. **`matchContains`** - Substring matches
6. **`defaultStyle`** - Fallback style

## Built-in Themes

| Theme             | Mode  | Description                      |
| ----------------- | ----- | -------------------------------- |
| `oh-my-zsh`       | Dark  | Popular Oh My Zsh terminal theme |
| `dracula`         | Dark  | Dracula color scheme             |
| `nord`            | Dark  | Arctic, north-bluish theme       |
| `monokai`         | Dark  | Classic Monokai colors           |
| `github-dark`     | Dark  | GitHub's dark mode               |
| `github-light`    | Light | GitHub's default light theme     |
| `solarized-dark`  | Dark  | Solarized dark variant           |
| `solarized-light` | Light | Solarized light variant          |

## Advanced Features

### Light Box Rendering

For light themes in dark terminals, use the light box renderer:

```javascript
import { renderLightBox, isLightTheme } from "logsdx";

if (isLightTheme("github-light")) {
  const output = renderLightBox(
    ["INFO: Server started", "WARN: High memory"],
    "github-light",
    "Server Logs",
    {
      width: 80,
      padding: 2,
      borderStyle: "rounded",
    },
  );
  console.log(output);
}
```

### WCAG Accessibility Compliance

```javascript
import { checkWCAGCompliance, adjustThemeForAccessibility } from "logsdx";

// Check theme accessibility
const compliance = checkWCAGCompliance(myTheme);
console.log(compliance); // "AAA" | "AA" | "A" | "FAIL"

// Auto-fix contrast issues
const accessibleTheme = adjustThemeForAccessibility(myTheme, 4.5);
```

### CSS Generation

Generate CSS for web applications:

```javascript
import { generateCompleteCSS } from "logsdx";

const { bem, utilities, tailwind } = generateCompleteCSS(theme);

// Use generated CSS in your app
// bem: BEM-style classes (.logsdx__error)
// utilities: Utility classes (.text-red-500)
// tailwind: Tailwind config extension
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yowainwright/logsdx.git
cd logsdx

# Install dependencies
bun install

# Run tests
bun test

# Build the project
bun run build

# Run linting
bun run lint
```

## License

MIT © LogsDX Contributors

## Support

- 📘 [Documentation](https://jeffry.in/logsdx)
- 🐛 [Report Issues](https://github.com/yowainwright/logsdx/issues)
- 💬 [Discussions](https://github.com/yowainwright/logsdx/discussions)
