#!/usr/bin/env bun

import { getLogsDX } from '../src/index'

// ANSI codes for backgrounds
const BG_WHITE = '\x1b[47m'
const BG_LIGHT_GRAY = '\x1b[107m'
const BG_RESET = '\x1b[49m'
const CLEAR_LINE = '\x1b[2K'
const RESET_ALL = '\x1b[0m'

// Box drawing characters
const BOX_TOP_LEFT = '╭'
const BOX_TOP_RIGHT = '╮'
const BOX_BOTTOM_LEFT = '╰'
const BOX_BOTTOM_RIGHT = '╯'
const BOX_HORIZONTAL = '─'
const BOX_VERTICAL = '│'

function createLightBox(title: string, lines: string[], width: number = 60) {
  const paddedTitle = ` ${title} `
  const titlePadding = Math.floor((width - paddedTitle.length - 2) / 2)
  
  // Top border with title
  console.log(BOX_TOP_LEFT + BOX_HORIZONTAL.repeat(titlePadding) + paddedTitle + BOX_HORIZONTAL.repeat(width - titlePadding - paddedTitle.length - 2) + BOX_TOP_RIGHT)
  
  // Content lines with light background
  lines.forEach(line => {
    // Apply white background to entire line
    process.stdout.write(BOX_VERTICAL + BG_WHITE + ' ')
    process.stdout.write(line)
    // Pad the rest of the line
    const padding = width - 4 - stripAnsi(line).length
    process.stdout.write(' '.repeat(Math.max(0, padding)))
    process.stdout.write(' ' + BG_RESET + BOX_VERTICAL + '\n')
  })
  
  // Bottom border
  console.log(BOX_BOTTOM_LEFT + BOX_HORIZONTAL.repeat(width - 2) + BOX_BOTTOM_RIGHT)
}

// Simple ANSI stripping for length calculation
function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

// Demo light themes in dark terminal
const lightThemes = ['github-light', 'solarized-light']
const sampleLogs = [
  'INFO: Server started successfully',
  'WARN: Memory usage at 75%',
  'ERROR: Connection timeout',
  'DEBUG: Processing request ID=12345',
  '[2024-01-15] Log entry with timestamp',
  'SUCCESS: All tests passed ✓'
]

console.log('\nLight Theme Preview in Dark Terminal')
console.log('====================================\n')

lightThemes.forEach(themeName => {
  // Create logger without auto-adjustment to preserve light theme colors
  const logger = getLogsDX({ 
    theme: themeName, 
    outputFormat: 'ansi',
    autoAdjustTerminal: false 
  })
  
  const styledLogs = sampleLogs.map(log => logger.processLine(log))
  
  createLightBox(themeName.toUpperCase(), styledLogs)
  console.log() // Empty line between themes
})

// Alternative approach using 256-color backgrounds
console.log('\nAlternative: Using 256-color backgrounds')
console.log('========================================\n')

// Light gray background (closer to real light theme backgrounds)
const BG_256_LIGHT = '\x1b[48;5;255m' // Very light gray
const BG_256_WHITE = '\x1b[48;5;231m' // Pure white

lightThemes.forEach(themeName => {
  const logger = getLogsDX({ 
    theme: themeName, 
    outputFormat: 'ansi',
    autoAdjustTerminal: false 
  })
  
  console.log(`${themeName.toUpperCase()}:`)
  sampleLogs.forEach(log => {
    const styled = logger.processLine(log)
    console.log(`${BG_256_LIGHT} ${styled} ${BG_RESET}`)
  })
  console.log()
})

// Full block approach with padding
console.log('\nFull Block Preview')
console.log('==================\n')

function createFullBlock(title: string, lines: string[], width: number = 70) {
  // Use 24-bit color for exact background matching
  const backgrounds: Record<string, string> = {
    'github-light': '\x1b[48;2;255;255;255m', // Pure white
    'solarized-light': '\x1b[48;2;253;246;227m', // Solarized base3
  }
  
  const bg = backgrounds[title] || BG_WHITE
  const blockChar = '█'
  
  // Title bar
  console.log(bg + '\x1b[38;2;0;0;0m' + ' '.repeat(width))
  console.log(bg + '\x1b[38;2;0;0;0m' + ` ${title.toUpperCase()} THEME PREVIEW`.padEnd(width))
  console.log(bg + '\x1b[38;2;0;0;0m' + ' '.repeat(width))
  
  // Content
  lines.forEach(line => {
    process.stdout.write(bg + '  ' + line)
    const padding = width - 4 - stripAnsi(line).length
    process.stdout.write(' '.repeat(Math.max(0, padding)) + '  ' + RESET_ALL + '\n')
  })
  
  // Bottom padding
  console.log(bg + ' '.repeat(width) + RESET_ALL)
}

lightThemes.forEach(themeName => {
  const logger = getLogsDX({ 
    theme: themeName, 
    outputFormat: 'ansi',
    autoAdjustTerminal: false 
  })
  
  const styledLogs = sampleLogs.map(log => logger.processLine(log))
  createFullBlock(themeName, styledLogs)
  console.log()
})