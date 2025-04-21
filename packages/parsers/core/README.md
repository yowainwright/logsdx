# @logsdx/parser-core

Core parsing functionality for LogsDX.

## Installation

```bash
npm install @logsdx/parser-core
# or
yarn add @logsdx/parser-core
# or
bun add @logsdx/parser-core
```

## Usage

```typescript
import { LineParser, ParsedLog } from '@logsdx/parser-core';

// Create a simple parser
const myParser: LineParser = (line: string): ParsedLog => {
  return {
    level: 'info',
    message: line,
    timestamp: new Date().toISOString()
  };
};

// Use the parser
const result = myParser('Hello, world!');
console.log(result);
```

## API

### Types

- `LogLevel`: Enum of log levels ('debug', 'info', 'warn', 'error', 'trace', 'success')
- `ParsedLog`: Interface for parsed log data
- `LineParser`: Function type for line parsers

### Functions

- `defaultLineParser`: Default implementation of a line parser
- `registerParser`: Register a parser with the registry
- `getParser`: Get a parser from the registry
- `getRegisteredParsers`: Get all registered parser names

## License

MIT
