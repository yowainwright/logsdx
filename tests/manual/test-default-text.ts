#!/usr/bin/env bun

import { getLogsDX } from '../src/index'
import { tokenize, applyTheme } from '../src/tokenizer'
import { getTheme } from '../src/themes'

// Test text with some plain text that should use defaultStyle
const testLine = 'INFO: This is plain text that should be styled with default color'

console.log('Testing Default Text Styling')
console.log('===========================\n')

// Get the github-light theme
const theme = getTheme('github-light')
console.log('Theme defaultStyle:', theme.schema.defaultStyle)

// Tokenize the line
const tokens = tokenize(testLine, theme)
console.log('\nTokens after tokenization:')
tokens.forEach((token, i) => {
  console.log(`  [${i}] "${token.content}" - metadata:`, token.metadata)
})

// Apply theme
const styledTokens = applyTheme(tokens, theme)
console.log('\nTokens after applyTheme:')
styledTokens.forEach((token, i) => {
  console.log(`  [${i}] "${token.content}" - metadata:`, token.metadata)
})

// Process with LogsDX
console.log('\n\nProcessed output:')
const logger = getLogsDX({ theme: 'github-light', outputFormat: 'ansi', autoAdjustTerminal: false })
console.log(logger.processLine(testLine))

console.log('\n\nWith auto-adjustment:')
const autoLogger = getLogsDX({ theme: 'github-light', outputFormat: 'ansi' })
console.log(autoLogger.processLine(testLine))