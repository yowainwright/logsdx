"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ThemeCardProps {
  themeName: string;
  animationDelay?: number;
  isVisible?: boolean;
}

// Enhanced sample logs with different levels for better theme demonstration
const sampleLogs = [
  "[2024-01-15 10:23:45] INFO: Server started on port 3000",
  "GET /api/users 200 OK (123ms)",
  "WARN: Memory usage high: 85% (1.7GB/2GB)", 
  "[ERROR] Database connection failed: ECONNREFUSED 127.0.0.1:5432",
  "DEBUG: SQL Query executed in 45ms",
  "✓ All tests passed (42 tests, 0 failures)",
  "Processing batch job... [████████████████████] 100%",
  "🚀 Deployment completed to production environment",
]

// Format theme name for display
const formatThemeName = (name: string) => {
  return name
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Get theme colors with proper contrast - using direct theme definitions
const getThemeColors = (themeName: string) => {
  const themeColors: Record<string, { bg: string; text: string; border: string; mode: 'light' | 'dark' }> = {
    'oh-my-zsh': { 
      bg: '#2c3e50', 
      text: '#ecf0f1', 
      border: '#34495e',
      mode: 'dark'
    },
    'dracula': { 
      bg: '#282a36', 
      text: '#f8f8f2', 
      border: '#44475a',
      mode: 'dark'
    },
    'github-light': { 
      bg: '#ffffff', 
      text: '#1f2328', 
      border: '#d1d9e0',
      mode: 'light'
    },
    'github-dark': { 
      bg: '#0d1117', 
      text: '#e6edf3', 
      border: '#30363d',
      mode: 'dark'
    },
    'solarized-light': { 
      bg: '#fdf6e3', 
      text: '#657b83', 
      border: '#eee8d5',
      mode: 'light'
    },
    'solarized-dark': { 
      bg: '#002b36', 
      text: '#839496', 
      border: '#073642',
      mode: 'dark'
    },
    'nord': {
      bg: '#2e3440',
      text: '#eceff4',
      border: '#4c566a',
      mode: 'dark'
    },
    'monokai': {
      bg: '#272822',
      text: '#f8f8f2',
      border: '#75715e',
      mode: 'dark'
    }
  }
  
  return themeColors[themeName] || { 
    bg: '#1a1a1a', 
    text: '#ffffff', 
    border: '#333333',
    mode: 'dark'
  }
}

// Simple theme-based log styling
const getStyledLogs = (themeName: string) => {
  const colors = getThemeColors(themeName)
  
  // Theme-specific color mappings
  const getLogColors = (logType: string) => {
    const colorMaps: Record<string, Record<string, string>> = {
      'oh-my-zsh': {
        info: '#3498db',
        warn: '#f39c12', 
        error: '#e74c3c',
        success: '#27ae60',
        debug: '#2ecc71'
      },
      'dracula': {
        info: '#8be9fd',
        warn: '#ffb86c',
        error: '#ff5555', 
        success: '#50fa7b',
        debug: '#bd93f9'
      },
      'github-light': {
        info: '#0969da',
        warn: '#fb8500',
        error: '#cf222e',
        success: '#1f883d', 
        debug: '#8250df'
      },
      'github-dark': {
        info: '#58a6ff',
        warn: '#f0883e',
        error: '#f85149',
        success: '#3fb950',
        debug: '#a5a5ff'
      },
      'solarized-light': {
        info: '#268bd2',
        warn: '#cb4b16',
        error: '#dc322f',
        success: '#859900',
        debug: '#6c71c4'
      },
      'solarized-dark': {
        info: '#268bd2', 
        warn: '#cb4b16',
        error: '#dc322f',
        success: '#859900',
        debug: '#6c71c4'
      },
      'nord': {
        info: '#5e81ac',
        warn: '#d08770',
        error: '#bf616a',
        success: '#a3be8c',
        debug: '#b48ead'
      },
      'monokai': {
        info: '#66d9ef',
        warn: '#fd971f', 
        error: '#f92672',
        success: '#a6e22e',
        debug: '#ae81ff'
      }
    }
    
    return colorMaps[themeName]?.[logType] || colors.text
  }

  return sampleLogs.map(log => {
    let logType = 'info'
    let styledLog = log
    
    if (log.includes('WARN') || log.includes('Memory usage')) {
      logType = 'warn'
      styledLog = `<span style="color: ${getLogColors('warn')}">${log}</span>`
    } else if (log.includes('ERROR') || log.includes('failed')) {
      logType = 'error' 
      styledLog = `<span style="color: ${getLogColors('error')}">${log}</span>`
    } else if (log.includes('✓') || log.includes('🚀') || log.includes('successful')) {
      logType = 'success'
      styledLog = `<span style="color: ${getLogColors('success')}">${log}</span>`
    } else if (log.includes('DEBUG')) {
      logType = 'debug'
      styledLog = `<span style="color: ${getLogColors('debug')}">${log}</span>`
    } else {
      styledLog = `<span style="color: ${getLogColors('info')}">${log}</span>`
    }
    
    return styledLog
  })
}

export function ThemeCard({ themeName, animationDelay = 0, isVisible = true }: ThemeCardProps) {
  const colors = getThemeColors(themeName)
  const styledLogs = getStyledLogs(themeName)
  
  if (!isVisible) return null

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{formatThemeName(themeName)}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Dual-pane layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[200px]">
          {/* Browser Pane */}
          <div className="relative border-r border-border">
            <div 
              className="h-full p-4 font-mono text-xs relative overflow-hidden"
              style={{ 
                backgroundColor: colors.bg,
                color: colors.text,
                borderColor: colors.border
              }}
            >
              {/* Browser header */}
              <div 
                className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b to-transparent z-10 flex items-center justify-center"
                style={{ 
                  background: colors.mode === 'light' 
                    ? 'linear-gradient(to bottom, rgba(0,0,0,0.05), transparent)' 
                    : 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)'
                }}
              >
                <span 
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ 
                    color: colors.mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'
                  }}
                >
                  Browser
                </span>
              </div>
              
              {/* Browser content with styled logs */}
              <div className="pt-8 space-y-1 h-40 overflow-hidden">
                {styledLogs.slice(0, 6).map((log, i) => (
                  <div 
                    key={i} 
                    className="px-2 py-0.5 text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: log }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Terminal Pane */}
          <div className="relative">
            <div 
              className="h-full p-4 font-mono text-xs relative overflow-hidden"
              style={{ 
                backgroundColor: colors.bg,
                color: colors.text
              }}
            >
              {/* Terminal header */}
              <div 
                className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b to-transparent z-10 flex items-center justify-center"
                style={{ 
                  background: colors.mode === 'light' 
                    ? 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)' 
                    : 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)'
                }}
              >
                <span 
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ 
                    color: colors.mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'
                  }}
                >
                  Terminal
                </span>
              </div>
              
              {/* Terminal content with styled logs */}
              <div className="pt-8 space-y-1 h-40 overflow-hidden">
                {styledLogs.slice(0, 6).map((log, i) => (
                  <div 
                    key={i} 
                    className="px-2 py-0.5 text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: log }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}