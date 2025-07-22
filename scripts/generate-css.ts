#!/usr/bin/env bun

import fs from "node:fs/promises";
import path from "node:path";
import { COLORS, STYLE_CODES } from "../src/renderer/constants";

/**
 * Generate CSS for all color and style definitions
 *
 * @returns A string containing CSS rules for all colors and styles
 */
export function generateCSS(): string {
  let css = "/* LogsDX Generated CSS */\n\n";

  // Add color classes
  css += "/* Color Classes */\n";
  Object.entries(COLORS).forEach(([name, def]) => {
    if (def.className) {
      css += `.${def.className} {\n`;
      css += `  color: ${def.hex};\n`;
      css += `}\n\n`;

      css += `.${def.className.replace("--", "--bg-")} {\n`;
      css += `  background-color: ${def.hex};\n`;
      css += `}\n\n`;
    }
  });

  // Add style classes
  css += "/* Style Classes */\n";
  Object.entries(STYLE_CODES).forEach(([name, def]) => {
    if (def.className && def.css) {
      css += `.${def.className} {\n`;
      css += `  ${def.css}\n`;
      css += `}\n\n`;
    }
  });

  // Add blink animation
  css += "/* Animations */\n";
  css += "@keyframes blink {\n";
  css += "  0%, 100% { opacity: 1; }\n";
  css += "  50% { opacity: 0; }\n";
  css += "}\n\n";

  // Add utility classes
  css += "/* Utility Classes */\n";
  css += ".logsdx__container {\n";
  css += "  font-family: monospace;\n";
  css += "  white-space: pre;\n";
  css += "  line-height: 1.5;\n";
  css += "}\n\n";

  css += ".logsdx__line {\n";
  css += "  display: block;\n";
  css += "}\n\n";

  css += ".logsdx__line--highlighted {\n";
  css += "  background-color: rgba(128, 128, 128, 0.2);\n";
  css += "}\n\n";

  return css;
}

/**
 * Main function to generate and write CSS file
 */
async function main() {
  const args = process.argv.slice(2);
  const outputPath = args[0] || "dist/logsdx.css";

  try {
    // Ensure the directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    // Generate and write the CSS
    const css = generateCSS();
    await fs.writeFile(outputPath, css, "utf-8");

    console.log(`CSS file generated at: ${outputPath}`);
  } catch (error) {
    console.error("Error generating CSS file:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
