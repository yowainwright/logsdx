#!/usr/bin/env bun
import { build } from "bun";
import { readdirSync } from "fs";
import { join } from "path";

const themesDir = join(import.meta.dir, "../src/themes/presets");
const outputDir = join(import.meta.dir, "../dist/themes/presets");

const themeFiles = readdirSync(themesDir).filter((file) =>
  file.endsWith(".ts"),
);

console.log(`Building ${themeFiles.length} theme presets...`);

const buildPromises = themeFiles.map(async (file) => {
  const themeName = file.replace(".ts", "");
  const inputPath = join(themesDir, file);

  await Promise.all([
    build({
      entrypoints: [inputPath],
      outdir: outputDir,
      format: "esm",
      minify: true,
      naming: `${themeName}.mjs`,
      target: "browser",
    }),

    build({
      entrypoints: [inputPath],
      outdir: outputDir,
      format: "cjs",
      minify: true,
      naming: `${themeName}.cjs`,
      target: "node",
    }),
  ]);

  console.log(`✓ Built theme: ${themeName}`);
});

await Promise.all(buildPromises);

console.log("✓ All themes built successfully!");
