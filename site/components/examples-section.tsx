import React from "react";
import { CodeBlock } from "./codeblock";

interface Example {
  title?: string;
  theme: string;
  code: string;
}

const LOGGER_EXAMPLES: Example[] = [
  {
    title: "Winston",
    theme: "monokai",
    code: `import winston from 'winston'
import { getLogsDX } from 'logsdx'

const logsDX = getLogsDX('dracula')

const logger = winston.createLogger({
  format: winston.format.printf(info => {
    return logsDX.processLine(info.message)
  })
})`,
  },
  {
    title: "Pino",
    theme: "nord",
    code: `import pino from 'pino'
import { getLogsDX } from 'logsdx'

const logsDX = getLogsDX('dracula')

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      customPrettifiers: {
        log: msg => logsDX.processLine(msg)
      }
    }
  }
})`,
  },
  {
    title: "Console.log",
    theme: "github-dark",
    code: `import { getLogsDX } from 'logsdx'

const logsDX = getLogsDX('dracula')

// Override console.log
const originalLog = console.log
console.log = (...args) => {
  const styled = args.map(arg => 
    typeof arg === 'string' 
      ? logsDX.processLine(arg)
      : arg
  )
  originalLog(...styled)
}`,
  },
  {
    title: "Bunyan",
    theme: "solarized-dark",
    code: `import bunyan from 'bunyan'
import { getLogsDX } from 'logsdx'

const logsDX = getLogsDX('dracula')

const logger = bunyan.createLogger({
  name: 'myapp',
  stream: {
    write: (rec) => {
      const msg = logsDX.processLine(rec.msg)
      process.stdout.write(msg + '\\n')
    }
  }
})`,
  },
  {
    title: "Debug",
    theme: "dracula",
    code: `import debug from 'debug'
import { getLogsDX } from 'logsdx'

const logsDX = getLogsDX('dracula')

debug.formatters.h = (v) => {
  return logsDX.processLine(v.toString())
}

const log = debug('app')
log('%h', 'Server started')`,
  },
  {
    title: "Log4js",
    theme: "oh-my-zsh",
    code: `import log4js from 'log4js'
import { getLogsDX } from 'logsdx'

const logsDX = getLogsDX('dracula')

log4js.configure({
  appenders: {
    styled: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%m',
        tokens: {
          m: (event) => logsDX.processLine(event.data[0])
        }
      }
    }
  },
  categories: {
    default: { appenders: ['styled'], level: 'info' }
  }
})`,
  },
];

const ADVANCED_EXAMPLES: Example[] = [
  {
    theme: "github-dark",
    code: `// Using createTheme helper
import { createTheme } from 'logsdx'

const simpleTheme = createTheme({
  name: 'my-custom',
  colors: {
    primary: '#3b82f6',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#06b6d4',
    muted: '#6b7280'
  },
  presets: ['logLevels', 'timestamps', 'numbers']
})`,
  },
  {
    theme: "monokai",
    code: `// Define full schema manually
const advancedTheme = {
  name: 'advanced',
  mode: 'dark',
  schema: {
    defaultStyle: { color: '#e0e0e0' },
    matchWords: {
      'CRITICAL': { color: '#dc2626', styleCodes: ['bold', 'blink'] },
      'TODO': { color: '#7c3aed', styleCodes: ['underline'] }
    },
    matchPatterns: [
      {
        name: 'http-methods',
        pattern: '\\\\b(GET|POST|PUT|DELETE)\\\\b',
        options: { color: '#3b82f6', styleCodes: ['bold'] }
      }
    ]
  }
}`,
  },
];

const BROWSER_EXAMPLES: Example[] = [
  {
    theme: "dracula",
    code: `import { getLogsDX } from 'logsdx'

// Create HTML logger for browser
const logger = getLogsDX('dracula', {
  outputFormat: 'html',
  htmlStyleFormat: 'css'
})

// Safe rendering example (no innerHTML)
function renderLog(message) {
  const styledHTML = logger.processLine(message)
  // styledHTML contains escaped HTML with inline styles
  // Use a safe rendering method in your framework
  return styledHTML
}`,
  },
  {
    theme: "nord",
    code: `// Example outputs:
renderLog('ERROR: Connection failed')
// <span style="color: #ff4444; font-weight: bold">ERROR</span>: Connection failed

renderLog('INFO: Server started on port 3000')
// <span style="color: #00aaff">INFO</span>: Server started on port 3000

renderLog('WARN: Memory usage high')
// <span style="color: #ffaa00">WARN</span>: Memory usage high

renderLog('SUCCESS: Build completed')
// <span style="color: #00ff00">SUCCESS</span>: Build completed`,
  },
];

function ExampleGrid({ examples }: { examples: Example[] }) {
  const hasTitles = examples.some((example) => example.title);
  const gridClassName = hasTitles
    ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    : "grid gap-6 md:grid-cols-2";

  return (
    <div className={gridClassName}>
      {examples.map((example) => (
        <div key={example.code}>
          {example.title && (
            <h4 className="mb-2 font-medium">{example.title}</h4>
          )}
          <CodeBlock theme={example.theme} language="javascript">
            {example.code}
          </CodeBlock>
        </div>
      ))}
    </div>
  );
}

function ExampleGroup({
  title,
  examples,
}: {
  title: string;
  examples: Example[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-2xl font-semibold">{title}</h3>
      <ExampleGrid examples={examples} />
    </div>
  );
}

export function ExamplesSection() {
  return (
    <section id="examples" className="bg-slate-50 dark:bg-slate-900 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold">Examples</h2>

          <div className="space-y-12">
            <ExampleGroup
              title="With Popular Loggers"
              examples={LOGGER_EXAMPLES}
            />
            <ExampleGroup
              title="Advanced Theme Configuration"
              examples={ADVANCED_EXAMPLES}
            />
            <ExampleGroup
              title="Browser Console Integration"
              examples={BROWSER_EXAMPLES}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
