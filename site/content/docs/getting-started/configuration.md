---
title: Configuration
description: Configure LogsDX to match your workflow
order: 3
---

# Configuration

LogsDX can be configured through options passed to `getLogsDX()` or `LogsDX.getInstance()`.

## Configuration Options

```typescript
interface LogsDXOptions {
  theme?: string | Theme | ThemePair;
  outputFormat?: "ansi" | "html";
  htmlStyleFormat?: "css" | "className";
  escapeHtml?: boolean;
  debug?: boolean;
  autoAdjustTerminal?: boolean;
}
```

## Options Reference

### theme

The theme to use for styling logs.

```typescript
// Use a built-in theme by name
const logsdx = await getLogsDX({ theme: "dracula" });

// Use a custom Theme object
const logsdx = await getLogsDX({
  theme: {
    name: "my-theme",
    mode: "dark",
    schema: {
      /* ... */
    },
  },
});

// Use a ThemePair for light/dark mode
const logsdx = await getLogsDX({
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
});
```

**Default:** `"oh-my-zsh"`

### outputFormat

Controls the output format of processed logs.

| Value    | Description                           |
| -------- | ------------------------------------- |
| `"ansi"` | ANSI escape codes for terminal output |
| `"html"` | HTML markup for browser rendering     |

```typescript
// Terminal output
const terminal = await getLogsDX({ outputFormat: "ansi" });

// Browser output
const browser = await getLogsDX({ outputFormat: "html" });
```

**Default:** `"ansi"`

### htmlStyleFormat

When using HTML output, controls how styles are applied.

| Value         | Description                              |
| ------------- | ---------------------------------------- |
| `"css"`       | Inline CSS styles via `style` attribute  |
| `"className"` | CSS class names for external stylesheets |

```typescript
// Inline styles: <span style="color: #ff5555">ERROR</span>
const inline = await getLogsDX({
  outputFormat: "html",
  htmlStyleFormat: "css",
});

// Class names: <span class="logsdx-error">ERROR</span>
const classes = await getLogsDX({
  outputFormat: "html",
  htmlStyleFormat: "className",
});
```

**Default:** `"css"`

### escapeHtml

Whether to escape HTML entities in the output when using HTML format.

```typescript
// Escape HTML (safe for user content)
const safe = await getLogsDX({ escapeHtml: true });

// Raw HTML (for trusted content only)
const raw = await getLogsDX({ escapeHtml: false });
```

**Default:** `true`

### autoAdjustTerminal

Automatically detect terminal background and switch to appropriate theme variant.

```typescript
// Auto-switch between github-dark and github-light
const logsdx = await getLogsDX({
  theme: "github-dark",
  autoAdjustTerminal: true,
});
```

When enabled, LogsDX will:

1. Detect if your terminal has a light or dark background
2. Automatically switch between `-light` and `-dark` theme variants
3. Fall back to the specified theme if no variant exists

**Default:** `true`

### debug

Enable debug logging for troubleshooting.

```typescript
const logsdx = await getLogsDX({ debug: true });
```

**Default:** `false`

## Runtime Configuration

You can change configuration after initialization:

```typescript
const logsdx = await getLogsDX({ theme: "dracula" });

// Change theme
await logsdx.setTheme("nord");

// Change output format
logsdx.setOutputFormat("html");

// Change HTML style format
logsdx.setHtmlStyleFormat("className");
```

## Environment Variables

LogsDX respects these environment variables:

| Variable       | Description                           |
| -------------- | ------------------------------------- |
| `COLORFGBG`    | Terminal foreground/background colors |
| `TERM_PROGRAM` | Terminal application name             |
| `COLORTERM`    | Color support level                   |

These are used for automatic theme mode detection when `autoAdjustTerminal` is enabled.

## Next Steps

- [API Reference](/docs/api/logsdx) - Complete API documentation
- [Custom Themes](/docs/guides/custom-themes) - Create your own themes
- [CLI Usage](/docs/guides/cli-usage) - Use LogsDX from the command line
