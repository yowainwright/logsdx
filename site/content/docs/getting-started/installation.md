---
title: Installation
description: How to install LogsDX in your project
order: 1
---

## Installation

LogsDX can be installed using your favorite package manager.

### npm

```bash
npm install logsdx
```

### yarn

```bash
yarn add logsdx
```

### pnpm

```bash
pnpm add logsdx
```

### bun

```bash
bun add logsdx
```

## CLI Installation

To use LogsDX from the command line, install it globally:

```bash
npm install -g logsdx
```

Or use it directly with npx:

```bash
npx logsdx --help
```

## Requirements

LogsDX supports the following environments:

- **Node.js** 16.0 or later
- **Modern browsers** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Deno** 1.0 or later
- **Bun** 1.0 or later

## Verify Installation

After installation, you can verify that LogsDX is working correctly:

```javascript
import LogsDX from 'logsdx'

const logger = new LogsDX()
logger.info('LogsDX is installed and working!')
```

## TypeScript Support

LogsDX includes TypeScript definitions out of the box. No additional packages are required.

```typescript
import LogsDX, { LogsDXOptions, Theme } from 'logsdx'

const options: LogsDXOptions = {
  theme: 'dracula',
  showTimestamp: true,
}

const logger = new LogsDX(options)
```

## Next Steps

Now that you have LogsDX installed, check out the [Quick Start Guide](/docs/getting-started/quick-start) to learn how to use it in your application.