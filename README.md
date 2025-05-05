<div align="center"><img alt="logsdx" width="300" src="https://github.com/user-attachments/assets/cc2a3b55-5bfd-44e8-a330-bfa146b50059" /></div>

# LogsDX

A flexible log visualization library that supports theming logs to be viewed in both a terminal and clients.

## Why

After dealing with inferior logs in various clients—ci, ui cloud tools, etc, a way to have the same visual aesthetic of logs in both the terminal and clients seemed necessary.

#### As of, 2025-04-13, these features are planned:

- [x] basic theming and theme support for piping JSON logs in a terminal
- [x] code functionality for non-specific logs in a terminal
- [ ] full example and importability of non-specific logs in a terminal (in progress)
- [x] code functionality for ANSI log theming in a react client
- [ ] full example and importability of ANSI log theming in a react client (in progress)
- [ ] more composable way to import and treeshake features
- [ ] documented working demo displaying the ability to add/use/create custom themes
- [ ] documented working demo displaying the ability to add/use/create custom parsers
- [ ] documented working demo displaying the ability to add/use/create custom clients
- [ ] clearly documented schemas for theming and parsing
- [ ] clearly documented way to create and use custom clients
- [ ] improve ways to use build artifacts—only client, only cli, etc

## Installation

```bash
npm install logsdx
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

## Client Usage

LogsDX provides support for rendering styled logs in various client environments.

### React Component Usage

```tsx
import { LogViewer } from "logsdx";

function App() {
  return (
    <LogViewer
      log={logContent}
      theme={{
        error: ["red"],
        warn: ["yellow"],
        info: ["blue"],
      }}
      outputFormat="html"
      htmlStyleFormat="css"
    />
  );
}
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
# Install dependencies
bun install

# Using mise for development tasks
# brew install mise
mise install
```
