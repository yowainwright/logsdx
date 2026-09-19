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
import { getLogsDX } from "logsdx";

const logger = await getLogsDX({ theme: "dracula" });

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
logsdx app.log --theme dracula

# Pipe logs through LogsDX
tail -f server.log | logsdx --theme nord

# List available themes
logsdx --list-themes

# Preview all themes
logsdx --list-themes --preview
```

## Browser Usage

```html
<script type="module">
  import { getLogsDX } from "https://unpkg.com/logsdx/dist/index.mjs";

  const logger = await getLogsDX({
    theme: "github-dark",
    outputFormat: "html",
  });
  document.body.innerHTML = logger.processLine("[INFO] Running in browser!");
</script>
```

## Next Steps

- [Installation Guide](/docs/getting-started/installation)
- [Quick Start Tutorial](/docs/getting-started/quick-start)
- [API Reference](/docs/api/logsdx)
- [Custom Themes Guide](/docs/guides/custom-themes)
