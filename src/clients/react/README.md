# LogDx React Client

This directory contains the React client component (`LogDx`) for displaying and interacting with logs processed by LogSDX.

## Overview

The `LogDx` component provides a simple interface for rendering logs within a React application. It includes features like:

- Displaying log lines.
- A search input to filter logs dynamically.
- Integration with a `LogEnhancer` instance for processing and potentially styling log lines.
- Persistence of the search query in `localStorage` (configurable TTL).

## Implementation

To use the `LogDx` component, you need to import it and provide the necessary props: the raw log string and an instance of `LogEnhancer`.

```tsx
import React from "react";
import { LogDx } from "@/src/clients/react";
import { LogEnhancer } from "@/src/logenhancer"; // Assuming enhancer is configured here

// 1. Configure your LogEnhancer instance
// (This might involve setting up parsers, formatters, themes, etc.)
const enhancer = new LogEnhancer({
  // Add any specific configuration for your enhancer
  // e.g., themes for syntax highlighting if supported by your enhancer setup
});

// 2. Get your raw log data (e.g., fetch from an API, read from a file)
const rawLogData = `
2023-10-27T10:00:00Z [INFO] Application started successfully.
2023-10-27T10:00:01Z [DEBUG] Initializing module A...
2023-10-27T10:00:02Z [WARN] Configuration value 'X' is deprecated.
2023-10-27T10:00:03Z [ERROR] Failed to connect to database.
{"level": "info", "message": "User logged in", "userId": 123, "timestamp": "2023-10-27T10:00:04Z"}
`;

// 3. Render the LogDx component
function MyLogViewerPage() {
  return (
    <div style={{ height: "500px", width: "800px", border: "1px solid #ccc" }}>
      <LogDx log={rawLogData} enhancer={enhancer} />
    </div>
  );
}

export default MyLogViewerPage;
```

## Props

The `LogDx` component accepts the following props:

- `log` (string, required): The raw log content as a single string. Lines are expected to be separated by newline characters (`\n`).
- `enhancer` (LogEnhancer, required): An instance of the `LogEnhancer` class. This instance is responsible for processing each log line before rendering. Customizations like parsing, formatting, and syntax highlighting are typically configured within this enhancer instance.
- `ttl` (number, optional): Time-to-live in **seconds** for storing the search query in `localStorage`. Defaults to `60` seconds.

## Customization & Modification

Most customization happens within the `LogEnhancer` instance you provide. The `LogDx` component itself is primarily concerned with displaying the processed output and handling the search filter.

- **Log Processing/Parsing:** Configure the parsers within your `LogEnhancer` instance to correctly interpret different log formats.
- **Log Formatting/Styling:** If your `LogEnhancer` configuration includes formatters or applies specific styles (e.g., based on log level), these will be reflected in the output.
- **Search Persistence:** Adjust the `ttl` prop to control how long the search query remains cached in the user's browser.

## Adding Syntax Highlighting (Shiki/Prism)

The `LogDx` React client **delegates** syntax highlighting and detailed line rendering to the `LogEnhancer` instance provided via the `enhancer` prop.

To add syntax highlighting using libraries like Shiki or Prism.js:

1.  **Configure `LogEnhancer`:** Modify or configure your `LogEnhancer` instance to use Shiki or Prism. This typically involves:
    - Setting up the chosen library within the enhancer's processing logic.
    - Specifying languages and themes.
    - Ensuring the enhancer's `process` method returns the highlighted HTML (or React elements) correctly.
2.  **Pass the Configured Enhancer:** Pass the enhancer instance, now configured with syntax highlighting capabilities, to the `LogDx` component.

**Conceptual Example (Illustrative):**

```tsx
import { LogDx } from "@/src/clients/react";
import { LogEnhancer } from "@/src/logenhancer";
// Assume LogEnhancer has been modified or configured to accept theme/language options
// for an internal Shiki/Prism setup.

// Configure enhancer for syntax highlighting
const syntaxHighlightingEnhancer = new LogEnhancer({
  syntaxHighlighter: "shiki", // Hypothetical option
  shikiTheme: "github-dark", // Hypothetical option
  // other enhancer options...
});

const rawLogData = `// JSON example
{"level": "info", "message": "Data processed"}
// SQL example
SELECT * FROM users WHERE id = 1;`;

function MyLogViewerWithSyntaxHighlighting() {
  return (
    <div style={{ height: "500px", width: "800px", border: "1px solid #ccc" }}>
      {/* Pass the specifically configured enhancer */}
      <LogDx log={rawLogData} enhancer={syntaxHighlightingEnhancer} />
    </div>
  );
}
```

**Note:** The exact configuration options (`syntaxHighlighter`, `shikiTheme`, etc.) depend entirely on how the `LogEnhancer` class itself is implemented or extended to support these features. Refer to the `LogEnhancer`'s own documentation or source code for details on enabling and configuring specific syntax highlighters.
