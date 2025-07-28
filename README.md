<div align="center"><img alt="logsdx" width="300" src="https://github.com/user-attachments/assets/cc2a3b55-5bfd-44e8-a330-bfa146b50059" /></div>

# LogsDX

**A schema-based styling layer that makes logs look identical between terminal and browser.**

LogsDX is not a logger replacement—it's a theming engine that applies consistent visual styling to logs across environments.

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

## Schema-Based Theming

LogsDX themes are defined using a JSON schema that specifies:

- **matchWords**: Style specific terms (e.g., "ERROR", "GET", "200")  
- **matchPatterns**: Style regex patterns (e.g., URLs, IP addresses, timestamps)
- **defaultStyle**: Fallback styling for unmatched content

The same schema produces ANSI codes for terminal and HTML/CSS for browser, ensuring identical visual appearance.

**Schema Validation**: Use our JSON schema at `https://raw.githubusercontent.com/your-org/logsdx/main/schema.json`

## Integration Approach

LogsDX works as a styling middleware:

```
Your Logger → LogsDX Styling → Output (Terminal/Browser)
```

**Terminal Integration:**
```typescript
import { LogsDX } from 'logsdx';
const logsDX = LogsDX.getInstance({ theme: 'my-theme', outputFormat: 'ansi' });
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
  generateCompleteCSS 
} from 'logsdx';

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