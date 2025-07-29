#!/usr/bin/env bun

import { getLogsDX, getAllThemes } from '../src/index'

// Sample log messages to demonstrate each theme
const sampleMessages = [
  'INFO: Server started on port 3000',
  'WARN: Memory usage high: 85%', 
  'ERROR: Database connection failed',
  'DEBUG: Processing request id=12345',
  'SUCCESS: All tests passed ✓',
  '[2024-01-15 10:23:45] Request completed',
  'GET /api/users 200 OK (123ms)',
  'Cache hit ratio: 92.5%',
]

// Get all available themes
const themes = getAllThemes()

console.log('LogsDX Theme Showcase')
console.log('====================\n')

// Process each theme
Object.entries(themes).forEach(([themeName, theme]) => {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`THEME: ${themeName.toUpperCase()}`)
  console.log(`${'='.repeat(60)}`)
  
  // Show theme metadata
  console.log(`Name: ${theme.name}`)
  console.log(`Description: ${theme.description || 'No description'}`)
  console.log(`Author: ${theme.author || 'Unknown'}`)
  
  // Show color palette
  if (theme.colorPalette) {
    console.log('\nColor Palette:')
    Object.entries(theme.colorPalette).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`)
    })
  }

  // Create logger for this theme
  const logger = getLogsDX({ theme: themeName, outputFormat: 'ansi' })
  
  // Show sample output
  console.log('\nSample Output:')
  
  // For light themes in dark terminals, show with background
  const isLightTheme = themeName.includes('light')
  const isDarkTerminal = process.env.COLORFGBG?.includes('0;') || 
                        process.env.TERM_PROGRAM === 'iTerm.app' ||
                        process.env.TERM_PROGRAM === 'WarpTerminal' ||
                        true // Default to assuming dark terminal
  
  if (isLightTheme && isDarkTerminal) {
    // Use theme-specific backgrounds
    const backgrounds: Record<string, string> = {
      'github-light': '\x1b[48;2;255;255;255m', // Pure white
      'solarized-light': '\x1b[48;2;253;246;227m', // Solarized base3
    }
    const bg = backgrounds[themeName] || '\x1b[48;5;255m' // Fallback to 256-color
    const reset = '\x1b[0m'
    
    console.log('  (Shown with light background for visibility)')
    sampleMessages.forEach(msg => {
      const styled = logger.processLine(msg)
      console.log(`  ${bg} ${styled} ${reset}`)
    })
  } else {
    sampleMessages.forEach(msg => {
      const styled = logger.processLine(msg)
      console.log(`  ${styled}`)
    })
  }
  
  console.log('')
})

// Summary
console.log(`\n${'='.repeat(60)}`)
console.log('SUMMARY')
console.log(`${'='.repeat(60)}`)
console.log(`Total themes available: ${Object.keys(themes).length}`)
console.log(`Themes: ${Object.keys(themes).join(', ')}`)