<div align="center"><img alt="logsdx" width="300" src="https://github.com/user-attachments/assets/cc2a3b55-5bfd-44e8-a330-bfa146b50059" /></div>

# LogsDX

**A schema-based styling layer that makes logs look identical between terminal and browser.**

LogsDX is not a logger replacement—it's a theming engine that applies consistent visual styling to logs across environments.

## Table of Contents

- [The Problem](#the-problem)
- [The LogsDX Solution](#the-logsdx-solution)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Schema Reference](#schema-reference)
- [CLI Usage](#cli-usage)
- [API Reference](#api-reference)
- [Themes](#themes)
- [Contributing](#contributing)

## The Problem

Logs look different everywhere:

- Terminal logs use ANSI colors
- Browser logs are plain text or basic HTML
- CI/CD tools have their own styling
- Each environment requires separate theming efforts

## The LogsDX Solution

**Write themes once, style logs everywhere.** LogsDX uses a unified schema to define log styling patterns that work identically in:

- **Terminal** (ANSI escape codes)
- **Browser** (HTML with CSS or CSS classes)
- **Any environment** (extensible rendering system)

**Key concept:** LogsDX sits between your existing logger and the display layer, applying consistent theming without replacing your logging infrastructure.

## Quick Start

```javascript
import { getLogsDX } from "logsdx";

const logger = getLogsDX("dracula");
console.log(
  logger.processLine(
    "ERROR: Database connection failed at 2024-01-15T10:30:45Z",
  ),
);
// Outputs styled text with ERROR in red, timestamp in dim gray
```

## Schema Reference

### Theme Structure

```json
{
  "name": "my-theme",
  "description": "Optional description",
  "mode": "dark", // "light" | "dark" | "auto"
  "schema": {
    /* SchemaConfig */
  }
}
```

### SchemaConfig Options

| Field             | Type                         | Description                 |
| ----------------- | ---------------------------- | --------------------------- |
| `defaultStyle`    | StyleOptions                 | Fallback for unmatched text |
| `matchWords`      | Record<string, StyleOptions> | Exact word matches          |
| `matchPatterns`   | PatternMatch[]               | Regex patterns              |
| `matchStartsWith` | Record<string, StyleOptions> | Prefix matches              |
| `matchEndsWith`   | Record<string, StyleOptions> | Suffix matches              |
| `matchContains`   | Record<string, StyleOptions> | Substring matches           |

### StyleOptions

```json
{
  "color": "#ff4444", // hex, rgb(), hsl(), or named
  "styleCodes": ["bold", "underline"], // optional decorations
  "htmlStyleFormat": "css" // "css" | "className"
}
```

**Available style codes:** `bold`, `italic`, `underline`, `dim`, `blink`, `reverse`, `strikethrough`

### Pattern Matching

```json
"matchPatterns": [
  {
    "name": "timestamp",
    "pattern": "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}",
    "options": { "color": "#888888", "styleCodes": ["dim"] }
  }
]
```

### Complete Example

```json
{
  "name": "production",
  "mode": "dark",
  "schema": {
    "defaultStyle": { "color": "#e0e0e0" },
    "matchWords": {
      "ERROR": { "color": "#ff4444", "styleCodes": ["bold"] },
      "WARN": { "color": "#ff9900" },
      "INFO": { "color": "#00aaff" }
    },
    "matchPatterns": [
      {
        "name": "ip",
        "pattern": "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
        "options": { "color": "#ff00ff" }
      }
    ]
  }
}
```

### Matching Priority

1. `matchWords` - Highest priority
2. `matchPatterns`
3. `matchStartsWith`
4. `matchEndsWith`
5. `matchContains`
6. `defaultStyle` - Lowest priority

## Integration Approach

LogsDX works as a styling middleware:

```
Your Logger → LogsDX Styling → Output (Terminal/Browser)
```

**Terminal Integration:**

```typescript
import { LogsDX } from "logsdx";
const logsDX = LogsDX.getInstance({ theme: "my-theme", outputFormat: "ansi" });
console.log(logsDX.processLine(logLine)); // ANSI-styled output
```

**Browser Integration:**

```typescript
import { LogsDX } from 'logsdx';
const logsDX = LogsDX.getInstance({ theme: 'my-theme', outputFormat: 'html' });
return <div dangerouslySetInnerHTML={{__html: logsDX.processLine(logLine)}} />;
```

**Same theme, different formats, identical appearance.**

## Installation

```bash
# Using npm
npm install logsdx

# Using bun (recommended)
bun add logsdx

# Using yarn
yarn add logsdx

# Using pnpm
pnpm add logsdx
```

---

## CLI Usage

LogsDX provides a powerful command-line interface for processing and formatting logs.

### Basic Usage

```bash
# Process a log file
logsdx input.log

# Process logs from stdin
cat input.log | logsdx

# Save output to a file
logsdx input.log --output formatted.log
```

### Options

```bash
--debug, -d           Enable debug mode
--output, -o <file>   Path to output file
--theme, -t <theme>   Theme to use (default: "oh-my-zsh")
--list-themes         List available themes
--config, -c <file>   Path to config file
```

### Examples

#### List Available Themes

```bash
logsdx --list-themes
```

#### Using a Specific Theme

```bash
logsdx input.log --theme dark
```

#### Parse JSON Logs

```bash
# Parse a JSON log file
logsdx input.json --parser=json

# Parse JSON logs from stdin
echo '{"level":"info","message":"Test message","timestamp":"2023-01-01T00:00:00.000Z"}' | logsdx --parser=json
```

#### Parse with Custom Rules

```bash
# Parse logs with custom regex rules
logsdx input.log --parser=regex --rules=rules.json
```

#### Filter by Log Level

```bash
# Show only warnings and errors
logsdx input.log --level=warn

# Show only errors
logsdx input.log --level=error
```

#### Debug Mode

```bash
# Enable debug mode for verbose output
logsdx input.log --debug
```

## API Reference

### Core Functions

```javascript
import { getLogsDX, createTheme, validateTheme } from "logsdx";

// Get a logger instance
const logger = getLogsDX("dracula"); // built-in theme
const logger2 = getLogsDX(customTheme); // custom theme object

// Process logs
logger.processLine(line); // Single line
logger.processLines(lines); // Multiple lines
```

### Theme Management

```javascript
// Create a theme
const theme = createTheme({
  name: "my-theme",
  colors: { primary: "#ff0000", error: "#ff4444" },
  presets: ["logLevels", "timestamps"],
});

// Validate a theme
const result = validateTheme(theme);
if (!result.valid) console.error(result.errors);

// Register a theme
import { registerTheme, getTheme } from "logsdx";
registerTheme(theme);
const retrieved = getTheme("my-theme");
```

### Configuration Options

```javascript
const logger = getLogsDX("theme-name", {
  outputFormat: "ansi", // 'ansi' | 'html'
  htmlStyleFormat: "css", // 'css' | 'className'
  debug: false, // Enable debug output
  autoAdjustTerminal: true, // Auto-adapt for terminal
});
```

### Output Formats

LogsDX provides three output formats:

```javascript
// 1. ANSI - Terminal output with escape codes
const ansiLogger = getLogsDX("dracula", { outputFormat: "ansi" });
console.log(ansiLogger.processLine("ERROR: Failed"));
// Output: \x1b[31;1mERROR\x1b[0m: Failed

// 2. HTML with inline CSS (safe, escaped)
const htmlLogger = getLogsDX("dracula", {
  outputFormat: "html",
  htmlStyleFormat: "css",
});
htmlLogger.processLine("ERROR: Failed");
// Output: <span style="color: #ff4444; font-weight: bold">ERROR</span>: Failed

// 3. HTML with CSS classes (safe, escaped)
const classLogger = getLogsDX("dracula", {
  outputFormat: "html",
  htmlStyleFormat: "className",
});
classLogger.processLine("ERROR: Failed");
// Output: <span class="logsdx-error logsdx-bold">ERROR</span>: Failed
```

All HTML output is automatically escaped for security.

### Light Box Rendering

For light themes in dark terminals, LogsDX provides a light-box renderer that creates a bordered background:

```javascript
import { renderLightBox, isLightTheme } from "logsdx";

// Check if a theme is light
if (isLightTheme("github-light")) {
  // Render with light box background
  const boxedOutput = renderLightBox(
    ["INFO: Server started", "WARN: High memory usage"],
    "github-light",
    "Server Logs", // Optional title
    {
      width: 80,
      padding: 2,
      border: true,
      borderStyle: "rounded", // 'rounded' | 'square' | 'double' | 'simple'
    },
  );
}
```

---

## Light/Dark Mode & Accessibility

LogsDX provides comprehensive tools to ensure your themes work perfectly in both light and dark environments with full accessibility compliance. The system automatically detects browser/terminal color preferences, validates WCAG contrast ratios using industry-standard tools (tinycolor2), and generates CSS for multiple output formats including BEM, Tailwind, and utility classes.

```typescript
import {
  detectColorScheme,
  validateTheme,
  checkWCAGCompliance,
  adjustThemeForAccessibility,
  generateBEMClasses,
  generateTailwindTheme,
  generateCompleteCSS,
} from "logsdx";

// Auto-detect system preference and validate accessibility
const colorScheme = detectColorScheme(); // 'light' | 'dark' | 'auto'
const validation = validateTheme(theme);
const wcag = checkWCAGCompliance(theme); // Returns AAA/AA/A/FAIL level

// Auto-fix accessibility issues and generate CSS
const fixedTheme = adjustThemeForAccessibility(theme, 4.5);
const { bem, utilities, tailwind } = generateCompleteCSS(fixedTheme);
```

---

## API Reference

### Core API

```tsx
import { LogsDX, getTheme, getAllThemes, getThemeNames } from "logsdx";

// Get LogsDX instance
const logsDX = LogsDX.getInstance({
  theme: "oh-my-zsh",
  outputFormat: "ansi", // or 'html'
  htmlStyleFormat: "css", // or 'className'
  debug: false,
});

// Process a single line
const styledLine = logsDX.processLine("INFO: Application started");

// Process multiple lines
const styledLog = logsDX.processLog("INFO: Line 1\nERROR: Line 2");

// Get available themes
const themeNames = getThemeNames();
const themes = getAllThemes();
const myTheme = getTheme("oh-my-zsh");
```

### Themes

LogsDX comes with built-in themes and supports custom themes:

```tsx
// Using a built-in theme
const logsDX = LogsDX.getInstance({ theme: "oh-my-zsh" });

// Using a custom theme
const logsDX = LogsDX.getInstance({
  theme: {
    name: "my-custom-theme",
    styles: {
      error: { color: "red", bold: true },
      warning: { color: "yellow" },
      info: { color: "blue" },
      // Add more style definitions
    },
    // Add pattern definitions
  },
});
```

---

## Themes

### Built-in Themes

| Theme             | Mode  | Description                  |
| ----------------- | ----- | ---------------------------- |
| `oh-my-zsh`       | Dark  | Oh My Zsh terminal colors    |
| `dracula`         | Dark  | Popular Dracula color scheme |
| `github-light`    | Light | GitHub's default colors      |
| `github-dark`     | Dark  | GitHub's dark mode           |
| `solarized-light` | Light | Solarized light variant      |
| `solarized-dark`  | Dark  | Solarized dark variant       |
| `nord`            | Dark  | Arctic, north-bluish theme   |
| `monokai`         | Dark  | Classic Monokai colors       |

### Creating Custom Themes

```bash
# Interactive theme creator
bun run create-theme
```

Features:

- 🎨 Color presets (Vibrant, Pastel, Neon, Earth, Ocean)
- ✨ Live preview
- ♿ WCAG compliance checking
- 💾 Export to JSON/TypeScript

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies (`bun install`)
4. Run tests (`bun test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development

```bash
# Install dependencies (we use Bun for development)
bun install

# Run tests
bun test

# Build the project
bun run build

# Create a custom theme interactively
bun run create-theme

# Using mise for development tasks
# brew install mise
mise install
```

<!--

```css
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background: linear-gradient(135deg, #42d392, #647eff, #A463BF, #bf6399)
```

```html
<span style="-webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background: linear-gradient(135deg, #42d392, #647eff, #A463BF, #bf6399);">Your Text Here</span>
```
-->
