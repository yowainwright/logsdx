# Log Parsers

This directory contains the log parsing system for LogSDX. The system is designed to be extensible and flexible, allowing for custom parsers to be added as needed.

## Available Parsers

### Built-in Parsers

- `default`: A basic parser that handles common log formats
- `regex`: A flexible parser that uses regular expressions to match and extract information
- `json`: A parser for JSON-formatted logs
- `custom`: A framework for creating custom parsers

## Using Parsers

```typescript
import { getParser } from "./registry";

// Get a parser
const parser = await getParser("regex");

// Parse a line
const result = parser("2024-03-14T12:34:56Z [INFO] Hello, world!");
```

## Customizing Parsers

### Using the Custom Parser Framework

The custom parser framework provides a structured way to create new parsers. Here's how to use it:

```typescript
import { createParserFactory, mapLogLevel } from "./custom";
import { registerParser } from "./registry";

// Create a custom parser
const myParser = createParserFactory({
  name: "my-parser",
  description: "A custom parser for my application",
  canParse: (line: string) => line.startsWith("[MYAPP]"),
  parse: (line: string) => {
    // Parse the line and return a LineParseResult
    return {
      timestamp: "2024-03-14T12:34:56Z",
      level: "info",
      message: "Hello, world!",
      service: "myapp",
    };
  },
});

// Register the parser
registerParser("my-parser", myParser);
```

### Example: CSV Log Parser

```typescript
import { createCsvLogParser } from "./custom";
import { registerParser } from "./registry";

// Register the CSV log parser
registerParser("csv-logs", createCsvLogParser());

// Example log line:
// CSV_LOG:2024-03-14T12:34:56Z,info,Hello world,service=myapp,user=123
```

### Example: Application Log Parser

```typescript
import { createAppLogParser } from "./custom";
import { registerParser } from "./registry";

// Register the application log parser
registerParser("app-logs", createAppLogParser());

// Example log lines:
// [APP] 2024-03-14 12:34:56 [INFO] Hello world
// [APP] ERROR TypeError: Cannot read property 'x' of undefined
```

## Parser Registry

The parser registry manages the available parsers and their configurations:

```typescript
import { registerParser, getParser } from "./registry";

// Register a parser
registerParser("my-parser", async () => {
  // Return a parser function
  return (line: string) => {
    // Parse the line
    return {
      timestamp: "2024-03-14T12:34:56Z",
      level: "info",
      message: "Hello, world!",
    };
  };
});

// Get a parser
const parser = await getParser("my-parser");
```

## Parser Types

### LineParser

A function that takes a string and returns a `LineParseResult` or `undefined`.

### LineParseResult

```typescript
interface LineParseResult {
  timestamp?: string;
  level: LogLevel;
  message: string;
  [key: string]: any;
}
```

### LogLevel

```typescript
type LogLevel = "debug" | "info" | "warn" | "error" | "success" | "trace";
```

## Examples

### Custom Parser for Application Logs

```typescript
import { createParserFactory } from "./custom";
import { registerParser } from "./registry";

const appParser = createParserFactory({
  name: "app-logs",
  description: "Parser for application logs",
  canParse: (line: string) => line.startsWith("[APP]"),
  parse: (line: string) => {
    const match = line.match(/^\[APP\]\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+\[(\w+)\]\s+(.*)$/);
    if (match) {
      return {
        timestamp: match[1],
        level: mapLogLevel(match[2]),
        message: match[3],
        service: "app",
      };
    }
    return undefined;
  },
});

registerParser("app-logs", appParser);
```

### Custom Parser for API Logs

```typescript
import { createParserFactory } from "./custom";
import { registerParser } from "./registry";

const apiParser = createParserFactory({
  name: "api-logs",
  description: "Parser for API logs",
  canParse: (line: string) => line.startsWith("[API]"),
  parse: (line: string) => {
    const match = line.match(/^\[API\]\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(\w+)\s+(\d{3})\s+(.*)$/);
    if (match) {
      return {
        timestamp: match[1],
        level: mapLogLevel(match[2]),
        statusCode: parseInt(match[3], 10),
        message: match[4],
        service: "api",
      };
    }
    return undefined;
  },
});

registerParser("api-logs", apiParser);
```

### Completely Custom Format

```typescript
import { createParserFactory } from "./custom";
import { registerParser } from "./registry";

const customParser = createParserFactory({
  name: "custom-logs",
  description: "Parser for custom log format",
  canParse: (line: string) => line.startsWith(">>>"),
  parse: (line: string) => {
    // Remove the prefix
    const content = line.substring(3);
    
    // Split by pipe character
    const parts = content.split("|");
    
    // Extract information
    const timestamp = parts[0]?.trim() || "";
    const level = mapLogLevel(parts[1]?.trim() || "");
    const message = parts[2]?.trim() || "";
    
    // Create the result
    const result: LineParseResult = {
      timestamp,
      level,
      message,
      format: "custom",
    };
    
    // Add any additional fields
    for (let i = 3; i < parts.length; i++) {
      const part = parts[i];
      if (part) {
        const [key, value] = part.split("=");
        if (key && value) {
          result[key.trim()] = value.trim();
        }
      }
    }
    
    return result;
  },
});

registerParser("custom-logs", customParser);
``` 