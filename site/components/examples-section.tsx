import React from "react";

export function ExamplesSection() {
  return (
    <section id="examples" className="bg-slate-50 dark:bg-slate-900 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold">Examples</h2>

          <div className="space-y-12">
            <div>
              <h3 className="mb-4 text-2xl font-semibold">
                With Popular Loggers
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h4 className="mb-2 font-medium">Winston</h4>
                  <div className="rounded-lg bg-slate-900 p-4 text-sm text-white">
                    <pre>{`import winston from 'winston'
import { getLogsDX } from 'logsdx'

const logsDX = getLogsDX('dracula')

const logger = winston.createLogger({
  format: winston.format.printf(info => {
    return logsDX.processLine(info.message)
  })
})`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Pino</h4>
                  <div className="rounded-lg bg-slate-900 p-4 text-sm text-white">
                    <pre>{`import pino from 'pino'
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
})`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Console.log</h4>
                  <div className="rounded-lg bg-slate-900 p-4 text-sm text-white">
                    <pre>{`import { getLogsDX } from 'logsdx'

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
}`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Bunyan</h4>
                  <div className="rounded-lg bg-slate-900 p-4 text-sm text-white">
                    <pre>{`import bunyan from 'bunyan'
import { getLogsDX } from 'logsdx'

const logsDX = getLogsDX('dracula')

const logger = bunyan.createLogger({
  name: 'myapp',
  stream: {
    write: (rec) => {
      const msg = logsDX.processLine(rec.msg)
      process.stdout.write(msg + '\n')
    }
  }
})`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Debug</h4>
                  <div className="rounded-lg bg-slate-900 p-4 text-sm text-white">
                    <pre>{`import debug from 'debug'
import { getLogsDX } from 'logsdx'

const logsDX = getLogsDX('dracula')

debug.formatters.h = (v) => {
  return logsDX.processLine(v.toString())
}

const log = debug('app')
log('%h', 'Server started')`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Log4js</h4>
                  <div className="rounded-lg bg-slate-900 p-4 text-sm text-white">
                    <pre>{`import log4js from 'log4js'
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
})`}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-2xl font-semibold">
                Advanced Theme Configuration
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-slate-900 p-4 text-white">
                <pre>{`// Using createTheme helper
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
})`}</pre>
                </div>
                <div className="rounded-lg bg-slate-900 p-4 text-white">
                  <pre>{`// Define full schema manually
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
}`}</pre>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-2xl font-semibold">
                Browser Console Integration
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-slate-900 p-4 text-white">
                <pre>{`import { getLogsDX } from 'logsdx'

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
}`}</pre>
                </div>
                <div className="rounded-lg bg-slate-900 p-4 text-white">
                  <pre>{`// Example outputs:
renderLog('ERROR: Connection failed')
// <span style="color: #ff4444; font-weight: bold">ERROR</span>: Connection failed

renderLog('INFO: Server started on port 3000')
// <span style="color: #00aaff">INFO</span>: Server started on port 3000

renderLog('WARN: Memory usage high')
// <span style="color: #ffaa00">WARN</span>: Memory usage high

renderLog('SUCCESS: Build completed')
// <span style="color: #00ff00">SUCCESS</span>: Build completed`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
