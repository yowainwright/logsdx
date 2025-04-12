# logsx CLI – Chat + Code Summary

This file documents the conversation and full code scaffold for building a minimal, modular, dependency-free `logsx` CLI tool with plugins, line parsing, and styled output.

---

## 💬 Conversation Summary

You asked to:

- Drop `chalk` and `readline`
- Make everything pure Node.js + Bun
- Support file input, stdout, and CLI flags like `--quiet`, `--level=warn`, and `--output`
- Keep the structure as a single clean package (not monorepo)
- Add dev runner, Dockerfile, CI, and Tilt support

---

## ✅ Final Code – `src/cli.ts`

```ts
#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { createRegexLineParser } from "./src/parsers/regexParsers";
import { loadJsonRules } from "./src/parsers/loadRulesFromJson";
import { styleLine } from "./src/styles";

type LogLevel = "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  info: 1,
  warn: 2,
  error: 3,
};

const args = process.argv.slice(2);
const flags = new Set<string>();
let inputFile = "";
let outputFile = "";
let minLevel: LogLevel | undefined;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--quiet") flags.add("quiet");
  else if (arg === "--output") outputFile = args[++i];
  else if (arg.startsWith("--level=")) minLevel = arg.split("=")[1] as LogLevel;
  else if (!arg.startsWith("--")) inputFile = arg;
}

const output = outputFile
  ? fs.createWriteStream(outputFile, { flags: "a" })
  : process.stdout;

async function getParser() {
  const rulePath = path.resolve(process.cwd(), "log_rules.json");
  if (fs.existsSync(rulePath)) {
    return await loadJsonRules(rulePath);
  }

  return createRegexLineParser([
    { match: /ERROR/, extract: () => ({ level: "error" }) },
    { match: /WARN/, extract: () => ({ level: "warn" }) },
    { match: /INFO/, extract: () => ({ level: "info" }) },
  ]);
}

function shouldRender(level?: string): boolean {
  if (!minLevel) return true;
  if (!level) return true;
  const current = LEVEL_PRIORITY[level as LogLevel] ?? 0;
  const min = LEVEL_PRIORITY[minLevel] ?? 0;
  return current >= min;
}

function handleLine(
  parser: ReturnType<typeof createRegexLineParser>,
  line: string,
) {
  const parsed = parser(line);
  const level = parsed?.level;
  const styled = styleLine(line, level);

  if (shouldRender(level)) {
    if (!flags.has("quiet")) console.log(styled);
    if (output !== process.stdout) output.write(styled + "\n");
  }
}

async function main() {
  const parser = await getParser();

  if (inputFile) {
    const content = fs.readFileSync(inputFile, "utf-8");
    const lines = content.split("\n");
    lines.forEach((line) => handleLine(parser, line));
    if (output !== process.stdout) output.end();
    return;
  }

  let buffer = "";
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    lines.forEach((line) => handleLine(parser, line));
  });

  process.stdin.on("end", () => {
    if (buffer) handleLine(parser, buffer);
    if (output !== process.stdout) output.end();
  });
}

main();
```

---

## 🎨 `src/styles.ts`

```ts
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

export function styleLine(line: string, level?: string): string {
  switch (level) {
    case 'error':
      return \`\${ANSI.bold}\${ANSI.red}\${line}\${ANSI.reset}\`;
    case 'warn':
      return \`\${ANSI.yellow}\${line}\${ANSI.reset}\`;
    case 'info':
      return \`\${ANSI.blue}\${line}\${ANSI.reset}\`;
    default:
      return line;
  }
}
```

---

## 📦 All other code blocks were saved in the previous zip archive.

Enjoy building `logsx`! 🚀
