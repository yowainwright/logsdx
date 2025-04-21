# @logsdx/parser-json

JSON log parser for LogsDX.

## Installation

```bash
npm install @logsdx/parser-json
# or
yarn add @logsdx/parser-json
# or
bun add @logsdx/parser-json
```

## Usage

```typescript
import { loadJsonRules } from '@logsdx/parser-json';

// Create a JSON parser with default rules
const jsonParser = await loadJsonRules();

// Parse a JSON log
const log = '{"level":"info","message":"Hello, world!","timestamp":"2023-04-21T12:34:56.789Z"}';
const result = jsonParser(log);
console.log(result);
```

## Features

- Parses JSON-formatted logs
- Extracts common fields like level, timestamp, and message
- Maps various log level formats to standard levels
- Supports custom rules via configuration file

## API

### Functions

- `loadJsonRules(filePath?)`: Load JSON rules from a file or use defaults
- `mapLogLevel(level)`: Map various log level formats to standard levels

### Types

- `JSONRule`: Type for JSON parsing rules

## License

MIT
