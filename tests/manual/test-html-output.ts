#!/usr/bin/env bun

import { getLogsDX } from '../src/index'

// Test HTML output for github-light theme
const logger = getLogsDX({ theme: 'github-light', outputFormat: 'html' })

const testLines = [
  'INFO: This is a test log message',
  'Plain text without any special markers',
  'ERROR: Something went wrong',
  '[2024-01-15 10:23:45] Timestamp example'
]

console.log('Testing HTML output for github-light theme')
console.log('=========================================\n')

testLines.forEach(line => {
  console.log(`Input: ${line}`)
  console.log(`Output: ${logger.processLine(line)}`)
  console.log('---')
})