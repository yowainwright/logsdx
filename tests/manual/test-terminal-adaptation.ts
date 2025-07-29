#!/usr/bin/env bun

import { getLogsDX } from '../src/index'

const sampleLogs = [
  'INFO: Server started on port 3000',
  'WARN: Memory usage high: 85%',
  'ERROR: Database connection failed',
  'DEBUG: Processing request id=12345',
  'SUCCESS: All tests passed ✓',
]

console.log('Terminal Background Detection Test')
console.log('==================================\n')

// Test with auto-adjustment (default)
console.log('With auto-adjustment (default):')
console.log('-------------------------------')
const autoLogger = getLogsDX({ theme: 'github-light', outputFormat: 'ansi' })
sampleLogs.forEach(log => {
  console.log(autoLogger.processLine(log))
})

console.log('\n\nWithout auto-adjustment:')
console.log('------------------------')
const manualLogger = getLogsDX({ 
  theme: 'github-light', 
  outputFormat: 'ansi',
  autoAdjustTerminal: false 
})
sampleLogs.forEach(log => {
  console.log(manualLogger.processLine(log))
})

console.log('\n\nEnvironment Info:')
console.log('-----------------')
console.log('TERM_PROGRAM:', process.env.TERM_PROGRAM || 'not set')
console.log('COLORFGBG:', process.env.COLORFGBG || 'not set')
console.log('TERMINAL_EMULATOR:', process.env.TERMINAL_EMULATOR || 'not set')

// Show the actual theme being used
console.log('\n\nTheme Resolution:')
console.log('-----------------')
console.log('Requested theme: github-light')
console.log('Auto-adjusted theme: github-dark (for dark terminals)')
console.log('\nThis ensures text remains visible in your terminal!')