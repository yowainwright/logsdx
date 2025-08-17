import React from "react";

export function ExamplesSection() {
  return (
    <section id="examples" className="bg-slate-50 dark:bg-slate-900 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-4xl font-bold">Examples</h2>

          <div className="space-y-12">
            <div>
              <h3 className="mb-4 text-2xl font-semibold">
                With Popular Loggers
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium">Winston</h4>
                  <div className="rounded-lg bg-slate-900 p-4 text-sm text-white">
                    <pre>{`import winston from 'winston'
import { style, themes } from 'logsdx'

const logger = winston.createLogger({
  format: winston.format.printf(info => {
    return style(info.message, { 
      theme: themes.dracula 
    }).ansi
  })
})`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Pino</h4>
                  <div className="rounded-lg bg-slate-900 p-4 text-sm text-white">
                    <pre>{`import pino from 'pino'
import { style, themes } from 'logsdx'

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      customPrettifiers: {
        log: msg => style(msg, { 
          theme: themes.dracula 
        }).ansi
      }
    }
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
              <div className="rounded-lg bg-slate-900 p-4 text-white">
                <pre>{`import { createTheme } from 'logsdx'

const advancedTheme = createTheme({
  name: 'custom-advanced',
  colorPalette: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
  },
  customWords: {
    'CRITICAL': { color: '#dc2626', background: '#fef2f2', bold: true },
    'TODO': { color: '#7c3aed', underline: true },
    'DEPRECATED': { color: '#6b7280', strikethrough: true },
  },
  patterns: [
    {
      regex: /\\b(GET|POST|PUT|DELETE)\\b/g,
      style: { color: '#3b82f6', bold: true }
    },
    {
      regex: /\\d{3}\\s(OK|Created|Bad Request|Not Found)/g,
      style: { color: '#10b981', background: '#d1fae5' }
    }
  ],
  presets: ['logLevels', 'booleans', 'numbers', 'dates', 'urls', 'brackets']
})`}</pre>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-2xl font-semibold">
                Browser Console Integration
              </h3>
              <div className="rounded-lg bg-slate-900 p-4 text-white">
                <pre>{`import { style, themes } from 'logsdx'

// Override console methods for styled output
const originalLog = console.log
console.log = (...args) => {
  const styled = args.map(arg => 
    typeof arg === 'string' 
      ? style(arg, { theme: themes.dracula }).html
      : arg
  )
  originalLog(...styled)
}

// Now all console.log calls are styled!
console.log('Server started successfully')
console.log('Warning: API rate limit approaching')
console.log('Error: Connection timeout')`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
