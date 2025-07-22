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
    await fs.readFile(path.join(process.cwd(), "package.json"), "utf-8")
  );
  const version = packageJson.version;

  try {
    await fs.mkdir(outputDir, { recursive: true });

    const schemas = [
      {
        schema: tokenSchema,
        filename: "token.schema.json",
        options: {
          name: "Token",
          description: "Schema for tokens in the LogsDX styling system",
        },
      },
      {
        schema: tokenListSchema,
        filename: "token-list.schema.json",
        options: {
          name: "TokenList",
          description: "Schema for token lists in the LogsDX styling system",
        },
      },
      {
        schema: themePresetSchema,
        filename: "theme.schema.json",
        options: {
          name: "Theme",
          description: "Schema for themes in the LogsDX styling system",
        },
      },
      {
        schema: styleOptionsSchema,
        filename: "style-options.schema.json",
        options: {
          name: "StyleOptions",
          description: "Schema for style options in the LogsDX styling system",
        },
      },
      {
        schema: schemaConfigSchema,
        filename: "schema-config.schema.json",
        options: {
          name: "SchemaConfig",
          description:
            "Schema for theme configuration in the LogsDX styling system",
        },
      },
    ];

    for (const { schema, filename, options } of schemas) {
      const jsonSchema = zodToJsonSchema(schema, options as JsonSchemaOptions);
      
      const enhancedSchema = {
        ...jsonSchema,
        $version: version,
        $id: `https://unpkg.com/logsdx@${version}/dist/schemas/${filename}`,
        $comment: `LogsDX v${version} - Available via CDN at https://unpkg.com/logsdx@latest/dist/schemas/${filename}`,
      };
      
      await fs.writeFile(
        path.join(outputDir, filename),
        JSON.stringify(enhancedSchema, null, 2),
        "utf-8"
      );
      console.log(`Schema generated at: ${path.join(outputDir, filename)}`);
    }

    console.log("Schema generation completed successfully");
  } catch (error) {
    console.error("Error generating schema files:", error);
    process.exit(1);
  }
}

main();
