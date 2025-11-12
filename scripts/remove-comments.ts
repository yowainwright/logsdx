#!/usr/bin/env bun

import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

async function getAllTsFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllTsFiles(fullPath)));
    } else if (entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

function removeComments(code: string): string {
  let result = "";
  let i = 0;
  let inString = false;
  let stringChar = "";
  let inTemplate = false;

  while (i < code.length) {
    const char = code[i];
    const nextChar = code[i + 1];

    if (!inString && !inTemplate && char === "/" && nextChar === "/") {
      const lineEnd = code.indexOf("\n", i);
      if (lineEnd === -1) {
        break;
      }
      result += "\n";
      i = lineEnd + 1;
      continue;
    }

    if (!inString && !inTemplate && char === "/" && nextChar === "*") {
      const commentEnd = code.indexOf("*/", i + 2);
      if (commentEnd === -1) {
        break;
      }
      const commentContent = code.substring(i, commentEnd + 2);
      const newlines = (commentContent.match(/\n/g) || []).length;
      result += "\n".repeat(newlines);
      i = commentEnd + 2;
      continue;
    }

    if (!inTemplate && (char === '"' || char === "'")) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar && code[i - 1] !== "\\") {
        inString = false;
        stringChar = "";
      }
    }

    if (!inString && char === "`") {
      inTemplate = !inTemplate;
    }

    result += char;
    i++;
  }

  return result;
}

async function processFile(filePath: string) {
  console.log(`Processing: ${filePath}`);
  const content = await readFile(filePath, "utf-8");
  const cleaned = removeComments(content);
  await writeFile(filePath, cleaned, "utf-8");
}

async function main() {
  const srcFiles = await getAllTsFiles("src");
  const testFiles = await getAllTsFiles("tests");
  const allFiles = [...srcFiles, ...testFiles];

  console.log(`Found ${allFiles.length} TypeScript files`);

  for (const file of allFiles) {
    await processFile(file);
  }

  console.log("Done!");
}

main().catch(console.error);
