#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createRegexLineParser } from '../parsers/regexParsers';
import { loadJsonRules } from '../parsers/loadRulesFromJson';
import { styleLine } from './styles';
import { LEVEL_PRIORITY } from '../constants';
import { LogLevel } from '../types';

// Parse CLI args
const args = process.argv.slice(2);
const flags = new Set<string>();
let inputFile = '';
let outputFile = '';
let minLevel: LogLevel | undefined;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--quiet') flags.add('quiet');
  else if (arg === '--output') outputFile = args[++i];
  else if (arg.startsWith('--level=')) minLevel = arg.split('=')[1] as LogLevel;
  else if (!arg.startsWith('--')) inputFile = arg;
}

// Write output stream
const output = outputFile ? fs.createWriteStream(outputFile, { flags: 'a' }) : process.stdout;

async function getParser() {
  const rulePath = path.resolve(process.cwd(), 'log_rules.json');
  if (fs.existsSync(rulePath)) {
    return await loadJsonRules(rulePath);
  }

  return createRegexLineParser([
    { match: /ERROR/, extract: () => ({ level: 'error' }) },
    { match: /WARN/, extract: () => ({ level: 'warn' }) },
    { match: /INFO/, extract: () => ({ level: 'info' }) },
  ]);
}

function shouldRender(level?: string): boolean {
  if (!minLevel) return true;
  if (!level) return true;
  const current = LEVEL_PRIORITY[level as LogLevel] ?? 0;
  const min = LEVEL_PRIORITY[minLevel] ?? 0;
  return current >= min;
}

function handleLine(parser: ReturnType<typeof createRegexLineParser>, line: string) {
  const parsed = parser(line);
  const level = parsed?.level;
  const styled = styleLine(line, level);

  if (shouldRender(level)) {
    if (!flags.has('quiet')) console.log(styled);
    if (output !== process.stdout) output.write(styled + '\n');
  }
}

async function main() {
  const parser = await getParser();

  if (inputFile) {
    // Read file line-by-line
    const content = fs.readFileSync(inputFile, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line) => handleLine(parser, line));
    if (output !== process.stdout) output.end();
    return;
  }

  // Read from stdin
  let buffer = '';
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    lines.forEach((line) => handleLine(parser, line));
  });

  process.stdin.on('end', () => {
    if (buffer) handleLine(parser, buffer);
    if (output !== process.stdout) output.end();
  });
}

main();