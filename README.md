<div align="center"><img alt="logsdx" width="300" src="https://github.com/user-attachments/assets/cc2a3b55-5bfd-44e8-a330-bfa146b50059" /></div>

# LogsDX

A flexible log processing and visualization library that supports multiple output formats and, **most importantly**, 

## _`asci` syntax highlighting, theming, and extendability for all!_

LogsDX aims to provide the ability create use and extend asci themes that can be used in terminal and clients.

## Why

After dealing with inferior logs in various clients—ci, ui cloud tools, etc, a way to have the same visual athstetic of logs in both the terminal and clients seemed necessary.

#### As of, 2025-04-13, these features are planned:

- [x] basic theming and theme support for piping JSON logs in a terminal
- [x] code functionality for non-specific logs in a terminal
- [ ] full example and importability of non-specifiic logs in a terminal (in progress)
- [x] code functionality for asci log theming in a react client
- [ ] full example and importability of asci log theming in a react client (in progress)
- [ ] more composable way to import and treeshake features
- [ ] documented working demo displaying the ability to add/use/create custom themes
- [ ] documented working demo displaying the ability to add/use/create custom parsers
- [ ] documented workign demo displaying the ability to add/use/create custom clients
- [ ] clearly documented schemas for theming and parsing
- [ ] clearly documented way to create and use custome clients

## Installation

```bash
npm install logsx
```

---

## CLI Usage

LogsDX provides a powerful command-line interface for processing and formatting logs.

### Basic Usage

```bash
# Process a log file
logsx input.log

# Process logs from stdin
cat input.log | logsx

# Save output to a file
logsx input.log --output formatted.log
```

### Options

```bash
--quiet, -q           Suppress all output except errors
--debug, -d           Enable debug mode
--level, -l <level>   Minimum log level to display (default: "info")
--parser, -p <parser> Parser to use for log parsing (default: "default")
--rules, -r <file>    Path to custom rules file
--output, -o <file>   Path to output file
--list-parsers        List available parsers
```

### Examples

#### List Available Parsers

```bash
logsx --list-parsers
```

#### Parse JSON Logs

```bash
# Parse a JSON log file
logsx input.json --parser=json

# Parse JSON logs from stdin
echo '{"level":"info","message":"Test message","timestamp":"2023-01-01T00:00:00.000Z"}' | logsx --parser=json

# Parse complex JSON logs
echo '{"level":"error","message":"Database connection failed","timestamp":"2023-01-01T00:00:00.000Z","service":"api","user_id":123,"error_code":500}' | logsx --parser=json
```

#### Parse with Custom Rules

```bash
# Parse logs with custom regex rules
logsx input.log --parser=regex --rules=rules.json

# Example rules.json:
[
  {
    "match": "\\[(.*?)\\]\\s+(.*)",
    "extract": {
      "level": "$1",
      "message": "$2"
    }
  }
]
```

#### Filter by Log Level

```bash
# Show only warnings and errors
logsx input.log --level=warn

# Show only errors
logsx input.log --level=error
```

#### Debug Mode

```bash
# Enable debug mode for verbose output
logsx input.log --debug
```

## Client usage

LogDX aims to provide the ability create asci themes that can be used in clients.

### React Component Usage

```tsx
import { LogViewer } from "logsx";

function App() {
  return (
    <LogViewer
      log={logContent}
      enhancer={enhancer}
      showLineNumbers
      theme={{
        error: ["red"],
        warn: ["yellow"],
        info: ["blue"],
      }}
    />
  );
}
```

---

## Plugins

### Using Plugins

```tsx
import { createLogEnhancer } from "logsx";
import { PrismPlugin } from "@logsx/prism";
import { ShikiPlugin } from "@logsx/shiki";

const enhancer = createLogEnhancer();
enhancer.use(new PrismPlugin({ theme: "github-dark" }));
enhancer.use(new ShikiPlugin({ theme: "github-dark" }));
```

### Creating Plugins

```tsx
import { LogEnhancerPlugin } from "logsx";

const MyPlugin: LogEnhancerPlugin = {
  name: "my-plugin",
  enhanceLine: (line, index) => `[${index}] ${line}`,
  parseLevel: (line) => {
    if (line.includes("ERROR")) return "error";
    if (line.includes("WARN")) return "warn";
    return "info";
  },
};
```

---

## Clients

### Using Clients

```tsx
import { LogEnhancer } from "logsx";
import { InkClient } from "@logsx/ink";
import { ReactClient } from "@logsx/react";

const enhancer = new LogEnhancer({
  clients: [new InkClient(), new ReactClient()],
});
```

### Creating Clients

```tsx
import { LogClient } from "logsx";

const MyClient: LogClient = {
  name: "my-client",
  write: (line) => {
    // Custom output logic
    console.log(`[MyClient] ${line}`);
  },
};
```

---

## Parsers

### Using Parsers

```tsx
import { LogEnhancer } from "logsx";
import { JSONParser } from "@logsx/json";
import { RegexParser } from "@logsx/regex";

const enhancer = new LogEnhancer({
  parsers: [new JSONParser(), new RegexParser()],
});
```

### Creating Parsers

```tsx
import { LogParser } from "logsx";

const MyParser: LogParser = {
  name: "my-parser",
  parse: (line) => {
    // Custom parsing logic
    const match = line.match(/\[(.*?)\]/);
    return match ? { level: match[1] } : {};
  },
};
```

---



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
mise run check      # Run all checks (tests, lint, format)
mise run pre-commit # Run pre-commit checks
mise run lint       # Run ESLint
mise run format     # Run Prettier
mise run test       # Run tests
mise run build      # Build the project
```
