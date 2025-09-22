---
title: LogsDX
description: Beautiful, themeable console output for Node.js and browsers
order: 1
---

# LogsDX

Beautiful, themeable console output for Node.js and browsers.

## Features

- 🎨 **8 Built-in Themes** - Dracula, Nord, Monokai, Solarized, and more
- 🚀 **Blazing Fast** - Optimized tokenizer with minimal overhead
- 📦 **Tiny Bundle** - 88KB minified, tree-shakeable
- 🔧 **Fully Customizable** - Create your own themes with ease
- 💻 **CLI Included** - Style logs directly from terminal
- 🌐 **Universal** - Works in Node.js, Deno, Bun, and browsers
- 🔍 **Smart Parsing** - Automatically detects log levels, timestamps, and more

## Installation

```bash
npm install logsdx
```

```bash
bun add logsdx
```

```bash
yarn add logsdx
```

## Basic Usage

```javascript
import LogsDX from "logsdx";

const logger = new LogsDX({ theme: "dracula" });

// Simple logging
logger.info("Server started on port 3000");
logger.success("Database connected");
logger.warn("Cache miss for key: user_123");
logger.error("Failed to fetch user data");

// Process raw log strings
const styledLog = logger.processLine("[2024-01-01] ERROR: Connection timeout");
console.log(styledLog);
```

## Themes

LogsDX includes these beautiful themes out of the box:

- **dracula** - Dark theme with vibrant colors
- **nord** - Arctic, north-bluish clean theme
- **monokai** - Classic Monokai colors
- **github-dark** - GitHub's dark mode theme
- **github-light** - GitHub's light theme
- **solarized-dark** - Precision colors for machines and people
- **solarized-light** - Light variant of Solarized
- **oh-my-zsh** - Inspired by Oh My Zsh defaults

## CLI Usage

```bash
# Install globally
npm install -g logsdx

# Style a log file
logsdx style app.log --theme dracula

# Pipe logs through LogsDX
tail -f server.log | logsdx style --theme nord

# List available themes
logsdx themes

# Preview all themes
logsdx preview
```

## Browser Usage

```html
<script type="module">
  import LogsDX from "https://unpkg.com/logsdx/dist/index.mjs";

  const logger = new LogsDX({ theme: "github-dark" });
  logger.info("Running in browser!");
</script>
```

## Next Steps

- [Installation Guide](/docs/getting-started/installation)
- [Quick Start Tutorial](/docs/getting-started/quick-start)
- [API Reference](/docs/api/logsdx)
- [Custom Themes Guide](/docs/guides/custom-themes)
