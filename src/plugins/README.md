# LogsDX Plugins

This directory contains plugins for enhancing log output with additional features like syntax highlighting, formatting, and more.

## Available Plugins

### Prism Plugin

The Prism plugin provides syntax highlighting for code blocks in logs using Prism.js.

```typescript
import { createPrismPlugin } from "logsx/plugins/prism";

// Basic usage with default options
const prismPlugin = createPrismPlugin();

// With custom options
const prismPlugin = createPrismPlugin({
  lang: "javascript", // Default language for syntax highlighting
  theme: "github-dark", // Theme to use for highlighting
});

// Use with LogEnhancer
import { createLogEnhancer } from "logsx";

const enhancer = createLogEnhancer();
enhancer.use(prismPlugin);
```

#### Supported Languages

The Prism plugin supports all languages that Prism.js supports. By default, it includes:

- TypeScript
- JavaScript

To use additional languages, import them from Prism.js:

```typescript
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
// ... import other languages as needed
```

#### Themes

The plugin supports different themes for syntax highlighting. Available themes include:

- `default`
- `github-dark`
- `github-light`
- `dracula`
- `monokai`

### Shiki Plugin

The Shiki plugin provides an alternative syntax highlighting engine using Shiki.

```typescript
import { createShikiPlugin } from "logsx/plugins/shiki";

const shikiPlugin = createShikiPlugin({
  theme: "github-dark",
  langs: ["typescript", "javascript"],
});
```

## Creating Custom Plugins

You can create your own plugins by implementing the `LogEnhancerPlugin` interface:

```typescript
import type { LogEnhancerPlugin, LineParseResult } from "../types";
import type { ReactElement } from "react";

interface MyPluginProps {
  // Define your plugin's configuration options
  option1?: string;
  option2?: number;
}

export function createMyPlugin(
  options: MyPluginProps = {},
): LogEnhancerPlugin<ReactElement> {
  return {
    enhanceLine: (
      line: string,
      lineIndex: number,
      context?: LineParseResult,
    ) => {
      // Implement your line enhancement logic
      return {
        type: "div",
        props: {
          children: line,
          className: "my-plugin-class",
        },
      };
    },
  };
}
```

### Plugin Interface

```typescript
interface LogEnhancerPlugin<T = string> {
  enhanceLine: (
    line: string,
    lineIndex: number,
    context?: LineParseResult,
  ) => T;
}
```

## Best Practices

1. **Plugin Configuration**

   - Keep plugin options simple and well-documented
   - Provide sensible defaults for all options
   - Use TypeScript interfaces for type safety

2. **Performance**

   - Cache expensive operations
   - Avoid unnecessary re-renders
   - Use memoization when appropriate

3. **Error Handling**

   - Gracefully handle unsupported languages or themes
   - Provide helpful error messages
   - Fall back to default behavior when possible

4. **Testing**
   - Write tests for your plugins
   - Include edge cases and error scenarios
   - Test with different input types and configurations

## Examples

### Combining Multiple Plugins

```typescript
import { createLogEnhancer } from "logsx";
import { createPrismPlugin } from "logsx/plugins/prism";
import { createShikiPlugin } from "logsx/plugins/shiki";

const enhancer = createLogEnhancer();

// Use both syntax highlighting plugins
enhancer.use(createPrismPlugin({ theme: "github-dark" }));
enhancer.use(createShikiPlugin({ theme: "github-dark" }));

// Process logs
const enhancedLogs = enhancer.process(logContent);
```

### Custom Formatting Plugin

```typescript
import { createLogEnhancer } from "logsx";
import type { LogEnhancerPlugin } from "../types";

const timestampPlugin: LogEnhancerPlugin = {
  enhanceLine: (line, index) => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${line}`;
  },
};

const enhancer = createLogEnhancer();
enhancer.use(timestampPlugin);
```
