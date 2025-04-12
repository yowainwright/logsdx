# logsdx

xtreme log streams

## Installation

```bash
bun add logsdx
```

## Usage

```tsx
import { LogViewer } from 'logsdx';

function App() {
  return (
    <LogViewer
      logs={[
        '2024-03-31T12:00:00.000Z [INFO] Server started',
        '2024-03-31T12:00:01.000Z [ERROR] Failed to connect to database',
      ]}
    />
  );
}
```

## Features

- 🚀 Fast and efficient log parsing
- 🎨 Beautiful syntax highlighting
- 🔍 Smart log level detection
- ⚡️ Real-time log streaming
- 🛠️ Highly customizable
- 📦 Zero dependencies

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run linting
bun run lint

# Run formatting
bun run format

# Run all checks
bun run check

# Build
bun run build

# Release
bun run release
```

## License

MIT
