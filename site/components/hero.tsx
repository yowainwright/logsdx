"use client"

import React, { useEffect, useState } from "react"
import { getLogsDX } from "logsdx"
// @ts-ignore
import AnsiToHtml from "ansi-to-html"

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

export function Hero() {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [browserOutput, setBrowserOutput] = useState<string[]>([])

  useEffect(() => {
    try {
      const terminalLogger = getLogsDX({ theme: "dracula", outputFormat: "ansi" })
      const browserLogger = getLogsDX({ theme: "dracula", outputFormat: "html" })
      const convert = new AnsiToHtml({ fg: '#c9d1d9', bg: '#0d1117' })

      const terminalLogs = sampleLogs.map(log => {
        try {
          // @ts-ignore
          const ansiLog = terminalLogger.processLine(log)
          // Convert ANSI codes to HTML for display
          return convert.toHtml(ansiLog)
        } catch {
          return log
        }
      })
      setTerminalOutput(terminalLogs)

      const browserLogs = sampleLogs.map(log => {
        try {
          // @ts-ignore
          return browserLogger.processLine(log)
        } catch {
          return log
        }
      })
      setBrowserOutput(browserLogs)
    } catch (error) {
      console.error("Error loading logs:", error)
    }
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-24">
      {/* Background animated logs */}
      <div className="absolute inset-0 flex">
        {/* Terminal Preview */}
        <div className="w-1/2 relative">
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(40, 42, 54, 0.15)' }} // Dracula terminal bg with opacity
          >
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent z-10 flex items-center justify-center">
              <span className="text-lg font-medium text-white/40 uppercase tracking-wider">Terminal</span>
            </div>
            <div className="pt-20 px-8 space-y-2 font-mono text-xs">
              {terminalOutput.concat(terminalOutput).map((line, i) => (
                <div 
                  key={i} 
                  className="animate-scroll-up px-2 py-1 rounded opacity-30"
                  style={{ 
                    animationDelay: `${(i % 10) * 0.5}s`,
                    animationDuration: `${15 + (i % 10) * 0.2}s`,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)'
                  }}
                  dangerouslySetInnerHTML={{ __html: line }} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Browser Preview */}
        <div className="w-1/2 relative">
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(40, 42, 54, 0.15)' }} // Dracula browser bg with opacity
          >
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent z-10 flex items-center justify-center">
              <span className="text-lg font-medium text-white/40 uppercase tracking-wider">Browser</span>
            </div>
            <div className="pt-20 px-8 space-y-2 font-mono text-xs">
              {browserOutput.concat(browserOutput).map((line, i) => (
                <div 
                  key={i} 
                  className="animate-scroll-up px-2 py-1 rounded opacity-30"
                  style={{ 
                    animationDelay: `${(i % 10) * 0.5}s`,
                    animationDuration: `${15 + (i % 10) * 0.2}s`,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                  }}
                  dangerouslySetInnerHTML={{ __html: line }} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 text-center relative z-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-[6rem] font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              logsDx
            </span>
          </h1>
          <p className="mb-8 text-[2rem] leading-[1.25] text-slate-600 dark:text-slate-400">
            Schema-based styling layer that makes logs look identical between terminal and browser environments
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#setup"
              className="rounded-lg bg-slate-900 px-6 py-3 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Get Started
            </a>
            <a
              href="https://github.com/yourusername/logsdx"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}