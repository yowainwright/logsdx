---
title: Quick Start
description: Get started with LogsDX in 5 minutes
order: 2
---

## Quick Start Guide

This guide will help you get started with LogsDX in just a few minutes.

## Basic Usage

### Import and Initialize

```javascript
import LogsDX from 'logsdx'

// Create a logger instance with default settings
const logger = new LogsDX()

// Or with a specific theme
const themedLogger = new LogsDX({ theme: 'dracula' })
```

### Log Levels

LogsDX supports multiple log levels for different types of messages:

```javascript
logger.info('Information message')
logger.success('Operation completed successfully')
logger.warn('Warning: Cache is nearly full')
logger.error('Error: Failed to connect to database')
logger.debug('Debug: User ID = 12345')
```

## Formatting Options

### Timestamps

Add timestamps to your log messages:

```javascript
const logger = new LogsDX({
  showTimestamp: true,
  timestampFormat: 'HH:mm:ss'
})

logger.info('Server started')
// Output: [14:23:45] INFO Server started
```

### Structured Logging

Log objects and complex data:

```javascript
const userData = {
  id: 123,
  name: 'John Doe',
  email: 'john@example.com'
}

logger.info('User logged in', userData)
```

### Custom Prefixes

Add custom prefixes to your logs:

```javascript
const logger = new LogsDX({
  prefix: '[MyApp]'
})

logger.info('Application started')
// Output: [MyApp] INFO Application started
```

## Using Themes

### Built-in Themes

LogsDX comes with several built-in themes:

```javascript
// Dark themes
const dracula = new LogsDX({ theme: 'dracula' })
const nord = new LogsDX({ theme: 'nord' })
const monokai = new LogsDX({ theme: 'monokai' })

// Light themes
const github = new LogsDX({ theme: 'github-light' })
const solarized = new LogsDX({ theme: 'solarized-light' })
```

### List Available Themes

```javascript
import { getAvailableThemes } from 'logsdx'

const themes = getAvailableThemes()
console.log('Available themes:', themes)
```

## Browser Usage

LogsDX works seamlessly in browser environments:

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import LogsDX from 'https://unpkg.com/logsdx/dist/index.mjs'
    
    const logger = new LogsDX({ theme: 'dracula' })
    logger.info('LogsDX loaded in browser!')
  </script>
</head>
</html>
```

## CLI Usage

Use LogsDX from the command line to style log files:

```bash
# Style a log file
logsdx style server.log --theme dracula

# Pipe logs through LogsDX
tail -f app.log | logsdx style --theme nord

# Show available themes
logsdx themes
```

## Integration Examples

### Express.js

```javascript
import express from 'express'
import LogsDX from 'logsdx'

const app = express()
const logger = new LogsDX({ theme: 'dracula' })

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`)
  next()
})

app.listen(3000, () => {
  logger.success('Server running on port 3000')
})
```

### Next.js

```javascript
// middleware.js
import { NextResponse } from 'next/server'
import LogsDX from 'logsdx'

const logger = new LogsDX({ theme: 'github-dark' })

export function middleware(request) {
  logger.info(`Request: ${request.method} ${request.url}`)
  return NextResponse.next()
}
```

## Next Steps

- Learn how to [create custom themes](/docs/guides/custom-themes)
- Explore the [API Reference](/docs/api/logsdx)
- Check out [advanced configuration](/docs/getting-started/configuration)