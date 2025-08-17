#!/usr/bin/env bun

import { supportsColors, getColorDefinition } from "../src/renderer/constants";

console.log("Renderer debugging:");
console.log("==================\n");

console.log("Supports colors:", supportsColors());
console.log("NO_COLOR:", process.env.NO_COLOR);
console.log("FORCE_COLOR:", process.env.FORCE_COLOR);
console.log("stdout.isTTY:", process.stdout.isTTY);
console.log("TERM:", process.env.TERM);

console.log("\nColor definition for #1f2328:");
const colorDef = getColorDefinition("#1f2328");
console.log(colorDef);

// Test forced colors
import { tokensToString } from "../src/renderer";
const testToken = [
  {
    content: "TEST",
    metadata: {
      style: { color: "#1f2328" },
    },
  },
];

console.log("\nWith force colors = true:");
console.log(tokensToString(testToken, true));

console.log("\nWith force colors = false:");
console.log(tokensToString(testToken, false));
