# @logsdx/parser-regex

Regex-based log parser for LogsDX.

## Installation

```bash
npm install @logsdx/parser-regex
# or
yarn add @logsdx/parser-regex
# or
bun add @logsdx/parser-regex
```

## Usage

```typescript
import { createRegexLineParser, logParserRules } from '@logsdx/parser-regex';

// Create a regex parser with default rules
const regexParser = createRegexLineParser(logParserRules);

// Parse a log line
const log = '2023-04-21T12:34:56.789Z [INFO] Hello, world!';
const result = regexParser(log);
console.log(result);
```

## Features

- Parses logs using regular expressions
- Extracts common fields like level, timestamp, and message
- Supports custom regex rules
- Handles various log formats

## API

### Functions

- `createRegexLineParser(rules)`: Create a line parser with the given regex rules
- `regexBasedParser`: Default regex parser with common rules

### Types

- `RegexParserRule`: Type for regex parsing rules

## License

MIT
