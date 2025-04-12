# LogsDX

A flexible log processing and visualization library that supports multiple output formats and syntax highlighting.

## Installation

```bash
npm install logsx
```

## CLI Usage

```bash
# Basic usage
logsx input.log

# With options
logsx input.log --output output.log --min-level warn --debug

# With syntax highlighting
logsx input.log --plugin @logsx/prism
```

## React Component Usage

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
mise run check      # Run all checks (tests, lint, format)
mise run pre-commit # Run pre-commit checks
mise run lint       # Run ESLint
mise run format     # Run Prettier
mise run test       # Run tests
mise run build      # Build the project
```

## License

MIT
