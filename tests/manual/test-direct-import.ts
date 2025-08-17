#!/usr/bin/env bun

// Import directly from source to test
import { tokenize, applyTheme } from "../src/tokenizer";
import { getTheme } from "../src/themes";
import { tokensToString } from "../src/renderer";

const theme = getTheme("github-light");
const line = "INFO: This is a test message";

console.log("Testing tokenizer directly from source:");
console.log("=======================================\n");

console.log("Theme:", theme.name);
console.log("DefaultStyle:", theme.schema.defaultStyle);

const tokens = tokenize(line, theme);
console.log("\nTokens:", tokens.length);

const styledTokens = applyTheme(tokens, theme);
console.log("\nFirst few styled tokens:");
styledTokens.slice(0, 5).forEach((token, i) => {
  console.log(`  [${i}] "${token.content}" - style:`, token.metadata?.style);
});

const output = tokensToString(styledTokens);
console.log("\nANSI output:");
console.log(output);
