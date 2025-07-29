"use client"

import React, { useState, useEffect } from 'react'
import { getLogsDX } from 'logsdx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const THEME_PAIRS = {
  'GitHub': { light: 'github-light', dark: 'github-dark' },
  'Solarized': { light: 'solarized-light', dark: 'solarized-dark' },
  'Classic': { light: 'oh-my-zsh', dark: 'dracula' }
}

const sampleLogs = [
  'INFO: Application started successfully',
  'WARN: Memory usage at 75%',
  'ERROR: Failed to connect to database',
  'DEBUG: Processing user request id=12345',
  '[2024-01-15 10:23:45] Request completed in 123ms'
]

export function AdaptiveThemeDemo() {
  const [selectedPair, setSelectedPair] = useState('GitHub')
  const [isDark, setIsDark] = useState(false)
  const [autoDetect, setAutoDetect] = useState(true)
  const [logs, setLogs] = useState<{ original: string; styled: string }[]>([])

  // Detect system preference
  useEffect(() => {
    if (!autoDetect) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [autoDetect])

  // Update logs when theme changes
  useEffect(() => {
    const pair = THEME_PAIRS[selectedPair as keyof typeof THEME_PAIRS]
    const themeName = isDark ? pair.dark : pair.light
    const logger = getLogsDX({ theme: themeName })

    const styledLogs = sampleLogs.map(log => ({
      original: log,
      styled: logger ? logger.processLine(log) : log
    }))

    setLogs(styledLogs)
  }, [selectedPair, isDark])

  const currentTheme = THEME_PAIRS[selectedPair as keyof typeof THEME_PAIRS][isDark ? 'dark' : 'light']

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Adaptive Theme Demo</CardTitle>
        <CardDescription>
          See how themes adapt to your system preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme Pair</label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {Object.keys(THEME_PAIRS).map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Auto-detect</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoDetect}
                onChange={(e) => setAutoDetect(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-muted-foreground">
                Use system preference
              </span>
            </div>
          </div>

          {!autoDetect && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsDark(false)}
                  className={`px-3 py-2 rounded-md ${
                    !isDark ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setIsDark(true)}
                  className={`px-3 py-2 rounded-md ${
                    isDark ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current State */}
        <div className="p-4 bg-secondary rounded-md space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Current Theme:</span>
            <span className="font-mono">{currentTheme}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">System Preference:</span>
            <span className="font-mono">
              {typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">High Contrast:</span>
            <span className="font-mono">
              {typeof window !== 'undefined' && window.matchMedia('(prefers-contrast: high)').matches ? 'yes' : 'no'}
            </span>
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <h3 className="mb-2 font-medium">Live Preview</h3>
          <div 
            className="p-4 rounded-md border font-mono text-sm space-y-1"
            style={{
              backgroundColor: isDark ? (
                selectedPair === 'GitHub' ? '#0d1117' :
                selectedPair === 'Solarized' ? '#002b36' :
                '#282a36'
              ) : (
                selectedPair === 'GitHub' ? '#ffffff' :
                selectedPair === 'Solarized' ? '#fdf6e3' :
                '#2c3e50'
              ),
              color: isDark ? '#e6edf3' : '#1f2328'
            }}
          >
            {logs.map((log, i) => (
              <div key={i} dangerouslySetInnerHTML={{ __html: log.styled }} />
            ))}
          </div>
        </div>

        {/* CSS Variables */}
        <div>
          <h3 className="mb-2 font-medium">CSS Custom Properties</h3>
          <pre className="p-4 bg-secondary rounded-md text-xs overflow-x-auto">
{`/* Use these in your CSS */
.log-container {
  background: var(--logsdx-bg);
  color: var(--logsdx-fg);
}

.log-error {
  color: var(--logsdx-error);
}

.log-warning {
  color: var(--logsdx-warning);
}

.log-success {
  color: var(--logsdx-success);
}`}
          </pre>
        </div>

        {/* Integration Example */}
        <div>
          <h3 className="mb-2 font-medium">Integration Example</h3>
          <pre className="p-4 bg-secondary rounded-md text-xs overflow-x-auto">
{`import { AdaptiveLogger } from 'logsdx/adaptive'

// Create adaptive logger
const logger = new AdaptiveLogger('github')

// Listen for theme changes
logger.onThemeChange((theme) => {
  console.log('Theme changed to:', theme)
})

// Process logs with current theme
logger.processLine('INFO: Using adaptive theme')`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}