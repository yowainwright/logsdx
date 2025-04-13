# JSON Parser

The JSON parser is a flexible component that can parse JSON log lines with customizable field mappings and rules.

## Features

- Parse standard JSON log formats
- Customize field mappings through rules
- Fallback to common field names when custom mappings aren't found
- Support for additional metadata fields
- Immutable and functional implementation

## Usage

### Basic Usage

```typescript
import { loadJsonRules } from "@/src/parsers/json";

// Load the parser with default rules
const parser = await loadJsonRules();

// Parse a JSON log line
const result = parser('{"level":"info","message":"test message","timestamp":"2023-01-01T00:00:00Z"}');

console.log(result);
// {
//   level: "info",
//   message: "test message",
//   timestamp: "2023-01-01T00:00:00Z",
//   language: "json"
// }
```

### Custom Rules

You can provide custom rules to map fields from your JSON logs to the standard log format.

```typescript
import { loadJsonRules } from "@/src/parsers/json";

// Load the parser with custom rules
const parser = await loadJsonRules("path/to/rules.json");

// Parse a JSON log line with custom field names
const result = parser('{"lvl":"debug","msg":"test message","ts":"2023-01-01T00:00:00Z","app":"myapp"}');

console.log(result);
// {
//   level: "debug",
//   message: "test message",
//   timestamp: "2023-01-01T00:00:00Z",
//   service: "myapp",
//   language: "custom-json"
// }
```

### Rules File Format

The rules file should be a JSON file containing an array of rule objects. Each rule has the following structure:

```json
[
  {
    "match": "\\{.*\\}",
    "lang": "custom-json",
    "level": "debug",
    "meta": {
      "service": "app",
      "timestamp": "ts",
      "message": "msg",
      "level": "lvl"
    }
  }
]
```

#### Rule Properties

- `match`: A regular expression string to match log lines (required)
- `lang`: The language identifier for the log (optional, defaults to "json")
- `level`: The default log level (optional, defaults to "info")
- `meta`: Field mappings from your JSON to standard log fields (optional)

#### Meta Field Mappings

The `meta` object maps your JSON field names to standard log fields:

- `service`: The service name
- `timestamp`: The timestamp field
- `message`: The log message
- `level`: The log level

You can add additional mappings for any other fields you want to extract.

### Field Fallbacks

If custom mappings aren't provided or fields aren't found, the parser will fall back to common field names:

- Timestamp: `timestamp`, `time`, `date`, `@timestamp`
- Message: `message`, `msg`, `log`, `text`
- Level: `level`, `status`, `severity`

### Debug Mode

You can enable debug mode to see more information about rule loading:

```typescript
import { loadJsonRules } from "@/src/parsers/json";

// Load the parser with debug mode enabled
const parser = await loadJsonRules("path/to/rules.json", true);
```

## API Reference

### `loadJsonRules(filePath?: string, debug?: boolean): Promise<LineParser>`

Loads a JSON parser with optional custom rules.

- `filePath`: Path to a custom rules file (optional)
- `debug`: Enable debug mode (optional, defaults to false)
- Returns: A function that parses JSON log lines

### `parseJsonLine(json: ParsedJSON, matchingRule: JSONRule): LineParseResult`

Parses a JSON object according to a matching rule.

- `json`: The parsed JSON object
- `matchingRule`: The rule that matched the log line
- Returns: A standardized log result

### `applyMetadata(result: LineParseResult, json: ParsedJSON, meta: Record<string, string>): LineParseResult`

Applies metadata mappings to a log result.

- `result`: The base log result
- `json`: The parsed JSON object
- `meta`: Field mappings
- Returns: A new log result with metadata applied

### `testRule(rules: JSONRule[], line: string): JSONRule | undefined`

Tests a log line against a list of rules.

- `rules`: Array of rules to test
- `line`: The log line to test
- Returns: The first matching rule or undefined

### `createBaseResult(matchingRule: JSONRule): LineParseResult`

Creates a base log result from a matching rule.

- `matchingRule`: The rule that matched the log line
- Returns: A base log result

## Examples

### Standard JSON Logs

```json
{"level":"info","message":"User logged in","timestamp":"2023-01-01T00:00:00Z","userId":123}
```

### Custom JSON Format

```json
{"lvl":"debug","msg":"Database query executed","ts":"2023-01-01T00:00:00Z","app":"api","query":"SELECT * FROM users","duration":150}
```

With custom rules:

```json
[
  {
    "match": "\\{.*\\}",
    "lang": "custom-json",
    "level": "debug",
    "meta": {
      "service": "app",
      "timestamp": "ts",
      "message": "msg",
      "level": "lvl",
      "query": "query",
      "duration": "duration"
    }
  }
]
```

### Complex JSON Logs

```json
{"status":"error","text":"Connection failed","date":"2023-01-01T00:00:00Z","error":{"code":500,"message":"Internal Server Error"},"context":{"requestId":"abc123","path":"/api/users"}}
```

The parser will automatically extract the error information and add it as metadata. 