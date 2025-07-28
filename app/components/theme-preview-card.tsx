"use client"

import React, { useEffect, useState } from "react"
import { getLogsDX, getAllThemes, LogsDX } from "logsdx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ThemePreviewCardProps {
  themeName: string
}

// More diverse log examples to showcase theme capabilities
const sampleLogs = [
  "[2024-01-15 10:23:45] INFO: Server started on port 3000",
  "GET /api/users 200 OK (123ms)",
  "WARN: Memory usage high: 85% (1.7GB/2GB)",
  "[ERROR] Database connection failed: ECONNREFUSED 127.0.0.1:5432",
  "✓ All tests passed (42 tests, 0 failures)",
  "Processing batch job... [████████████████████] 100%",
  "User authentication successful for admin@example.com",
  "Cache hit ratio: 92.5% | Requests: 10,543 | Hits: 9,752",
  "🚀 Deployment completed to production environment",
  "DEBUG: SQL Query: SELECT * FROM users WHERE active = true",
]

export function ThemePreviewCard({ themeName }: ThemePreviewCardProps) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [browserOutput, setBrowserOutput] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    
    try {
      // Get all themes
      const themes = getAllThemes()
      const theme = themes[themeName as keyof typeof themes]
      
      if (!theme) {
        console.error(`Theme "${themeName}" not found`)
        setIsLoading(false)
        return
      }

      // Create logsDx instances for terminal and browser
      const terminalLogger = getLogsDX({ theme: themeName, outputFormat: "ansi" })
      const browserLogger = getLogsDX({ theme: themeName, outputFormat: "html" })

      // Generate terminal output
      const terminalLogs = sampleLogs.map(log => {
        try {
          // @ts-ignore
          return terminalLogger.processLine(log)
        } catch (e) {
          console.error(`Error styling log for terminal: ${e}`)
          return log
        }
      })
      setTerminalOutput(terminalLogs)

      // Generate browser output
      const browserLogs = sampleLogs.map(log => {
        try {
          // @ts-ignore
          return browserLogger.processLine(log)
        } catch (e) {
          console.error(`Error styling log for browser: ${e}`)
          return log
        }
      })
      setBrowserOutput(browserLogs)
    } catch (error) {
      console.error(`Error loading theme ${themeName}:`, error)
    } finally {
      setIsLoading(false)
    }
  }, [themeName])

  const formatThemeName = (name: string) => {
    return name
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">{formatThemeName(themeName)}</CardTitle>
          <CardDescription>Loading theme...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{formatThemeName(themeName)}</CardTitle>
        <CardDescription>Click to copy theme name</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Terminal Preview */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            Terminal
          </h4>
          <div className="terminal-preview rounded-md border border-slate-700 bg-slate-900 p-4 font-mono text-xs overflow-x-auto">
            {terminalOutput.map((line, i) => (
              <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
            ))}
          </div>
        </div>

        {/* Browser Preview */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
            Browser
          </h4>
          <div className="browser-preview rounded-md border bg-white dark:bg-slate-950 p-4 font-mono text-xs overflow-x-auto">
            {browserOutput.map((line, i) => (
              <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}