#!/usr/bin/env bun

import fs from "node:fs/promises";
import path from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  tokenSchema,
  tokenListSchema,
  themePresetSchema,
  styleOptionsSchema,
  schemaConfigSchema,
} from "../src/schema/index";
import { JsonSchemaOptions } from "../src/schema/types";

async function main() {
  const args = process.argv.slice(2);
  const outputDir = args[0] || "dist/schemas";

  const packageJson = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "package.json"), "utf-8"),
  );
  const version = packageJson.version;

  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`Creating schemas in ${outputDir}`);

    const schemas = [
      {
        name: "token",
        schema: tokenSchema,
        filename: "token.schema.json",
      },
      {
        name: "token-list", 
        schema: tokenListSchema,
        filename: "token-list.schema.json",
      },
      {
        name: "theme",
        schema: themePresetSchema,
        filename: "theme.schema.json",
      },
      {
        name: "style-options",
        schema: styleOptionsSchema,
        filename: "style-options.schema.json",
      },
      {
        name: "schema-config",
        schema: schemaConfigSchema,
        filename: "schema-config.schema.json",
      },
    ];

    for (const { name, schema, filename } of schemas) {
      console.log(`Generating ${name} schema...`);
      
      const jsonSchema = zodToJsonSchema(schema, {
        name,
        $refStrategy: "relative",
        definitionPath: "$defs",
        definitions: {},
      } as JsonSchemaOptions);

      // Add version to the schema
      jsonSchema.version = version;

      const outputPath = path.join(outputDir, filename);
      await fs.writeFile(outputPath, JSON.stringify(jsonSchema, null, 2));
      console.log(`✓ ${filename}`);
    }

    console.log(`\n✅ Successfully generated ${schemas.length} schema files`);
  } catch (error) {
    console.error("Error generating schemas:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}