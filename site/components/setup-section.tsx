import React from "react";

export function SetupSection() {
  return (
    <section id="setup" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-4xl font-bold">Quick Setup</h2>

          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-2xl font-semibold">1. Install</h3>
              <div className="rounded-lg bg-slate-900 p-4 text-white">
                <code>npm install logsdx</code>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-2xl font-semibold">2. Import and Use</h3>
              <div className="rounded-lg bg-slate-900 p-4 text-white">
                <pre>{`import { getLogsDX } from 'logsdx'

// Use a built-in theme
const logger = getLogsDX('dracula')

// Terminal output (ANSI)
console.log(logger.processLine('ERROR: Hello World'))

// Browser output (HTML)
const htmlLogger = getLogsDX('dracula', {
  outputFormat: 'html'
})
const safeHTML = htmlLogger.processLine('ERROR: Hello World')`}</pre>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-2xl font-semibold">
                3. Create Custom Themes
              </h3>
              <div className="rounded-lg bg-slate-900 p-4 text-white">
                <pre>{`import { createTheme, registerTheme, getLogsDX } from 'logsdx'

const myTheme = createTheme({
  name: 'my-theme',
  colors: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  presets: ['logLevels', 'timestamps'],
})

// Register and use the theme
registerTheme(myTheme)
const logger = getLogsDX('my-theme')`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
