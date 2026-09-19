---
title: Quick Start
description: Get started with LogsDX in 5 minutes
order: 2
---

## Quick Start Guide

LogsDX styles the same log text as ANSI for terminals or HTML for browsers.

## Basic Usage

```typescript
import { getLogsDX } from "logsdx";

const logger = await getLogsDX({ theme: "dracula" });
const lines = [
  "[INFO] Server started on port 3000",
  "[WARN] Memory usage is above 80%",
  "[ERROR] Database connection failed",
];

const styledLines = logger.processLines(lines);
styledLines.forEach((line) => console.log(line));
```

`processLine()` styles one line. `processLines()` handles a list, and
`processLog()` handles a complete string with newlines.

## Terminal and Browser Output

Use the same theme and input for both environments:

```typescript
const logger = await getLogsDX({
  theme: "dracula",
  outputFormat: "ansi",
});

const line = "[ERROR] Connection timeout";
const ansi = logger.processLine(line);
logger.setOutputFormat("html");
const html = logger.processLine(line);

console.log(ansi);
document.body.innerHTML = html;
```

HTML output uses inline styles by default. Set `htmlStyleFormat: "className"`
when your application provides the CSS classes.

## Built-in Themes

```typescript
import { getThemeNames } from "logsdx";

console.log(getThemeNames());
```

Built-in themes include `dracula`, `nord`, `monokai`, `github-dark`,
`github-light`, `solarized-dark`, `solarized-light`, and `oh-my-zsh`.

## CLI Usage

```bash
# Process a file
logsdx server.log --theme dracula

# Pipe logs from another command
tail -f server.log | logsdx --theme nord

# List and preview themes
logsdx --list-themes
logsdx --list-themes --preview
```

Use `logsdx --help` for all options, including HTML output and the theme
generator.

## Custom Themes

Create a theme with `ThemeBuilder`, register it, and pass its name to
`getLogsDX()`:

```typescript
import { ThemeBuilder, getLogsDX, registerTheme } from "logsdx";

const theme = new ThemeBuilder("my-theme")
  .mode("dark")
  .defaultStyle({ color: "#f8f8f2" })
  .matchWord("ERROR", { color: "#ff5555", styleCodes: ["bold"] })
  .matchWord("INFO", { color: "#8be9fd" })
  .build();

registerTheme(theme);
const logger = await getLogsDX({ theme: "my-theme" });
console.log(logger.processLine("[ERROR] Connection failed"));
```

See [Custom Themes](/docs/guides/custom-themes) for the full schema.

## Next Steps

- Learn how to [create custom themes](/docs/guides/custom-themes)
- Explore the [API Reference](/docs/api/logsdx)
- Check the [CLI guide](/docs/guides/cli-usage)
