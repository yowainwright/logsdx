import type { SchemaSection } from "./types";

export const SCHEMA_SECTIONS: SchemaSection[] = [
  {
    title: "Theme",
    description: "Root theme object that defines styling rules",
    properties: [
      {
        name: "name",
        type: "string",
        description: "Unique identifier for the theme",
        required: true,
        example: '"dracula"',
      },
      {
        name: "description",
        type: "string",
        description: "Human-readable description",
        example: '"A dark theme inspired by Dracula"',
      },
      {
        name: "mode",
        type: '"light" | "dark" | "auto"',
        description: "Theme color mode for terminal detection",
        example: '"dark"',
      },
      {
        name: "schema",
        type: "SchemaConfig",
        description: "Matching rules and styling definitions",
        required: true,
      },
      {
        name: "colors",
        type: "Record<string, string>",
        description: "Named color palette for the theme",
        example: '{ error: "#ff5555", info: "#8be9fd" }',
      },
    ],
  },
  {
    title: "SchemaConfig",
    description: "Defines how log content is matched and styled",
    properties: [
      {
        name: "defaultStyle",
        type: "StyleOptions",
        description: "Default styling for unmatched content",
        example: '{ color: "#f8f8f2" }',
      },
      {
        name: "matchWords",
        type: "Record<string, StyleOptions>",
        description: "Exact word matches (case-insensitive)",
        example: '{ "ERROR": { color: "#ff5555", styleCodes: ["bold"] } }',
      },
      {
        name: "matchStartsWith",
        type: "Record<string, StyleOptions>",
        description: "Match tokens starting with a prefix",
        example: '{ "[": { color: "#6272a4" } }',
      },
      {
        name: "matchEndsWith",
        type: "Record<string, StyleOptions>",
        description: "Match tokens ending with a suffix",
        example: '{ "ms": { color: "#bd93f9" } }',
      },
      {
        name: "matchContains",
        type: "Record<string, StyleOptions>",
        description: "Match tokens containing a substring",
        example: '{ "://": { color: "#8be9fd" } }',
      },
      {
        name: "matchPatterns",
        type: "PatternMatch[]",
        description: "Regex patterns for complex matching",
        example: '{ pattern: /\\d+\\.\\d+/, options: { color: "#bd93f9" } }',
      },
    ],
  },
  {
    title: "StyleOptions",
    description: "Styling applied to matched content",
    properties: [
      {
        name: "color",
        type: "string",
        description: "Hex color code for the text",
        required: true,
        example: '"#ff5555"',
      },
      {
        name: "styleCodes",
        type: "StyleCode[]",
        description: "Text decorations: bold, italic, underline, dim, etc.",
        example: '["bold", "underline"]',
      },
      {
        name: "htmlStyleFormat",
        type: '"css" | "className"',
        description: "HTML output format preference",
        example: '"css"',
      },
    ],
  },
];

export const MATCHING_PRIORITY = [
  { name: "matchPatterns", description: "Checked first, highest priority" },
  { name: "matchWords", description: "Exact word match" },
  { name: "matchStartsWith", description: "Prefix match" },
  { name: "matchEndsWith", description: "Suffix match" },
  { name: "matchContains", description: "Substring match" },
  { name: "defaultStyle", description: "Fallback for unmatched tokens" },
];

export const EXAMPLE_THEME = `{
  "name": "my-theme",
  "mode": "dark",
  "schema": {
    "defaultStyle": { "color": "#f8f8f2" },
    "matchWords": {
      "ERROR": { "color": "#ff5555", "styleCodes": ["bold"] },
      "WARN": { "color": "#ffb86c" },
      "INFO": { "color": "#8be9fd" }
    },
    "matchPatterns": [
      {
        "pattern": "\\\\d{4}-\\\\d{2}-\\\\d{2}",
        "options": { "color": "#6272a4" }
      }
    ]
  }
}`;
