import type { SchemaSection } from "./types";

export const TEXT = {
  title: {
    highlight: "Theme",
    rest: "Schema",
  },
  description: "Understand how themes work under the hood",
  labels: {
    matchingPriority: "Matching Priority",
    exampleTheme: "Example Theme",
    howMatching: "How Matching Works",
    required: "required",
    themeJson: "my-theme.json",
  },
  matchingSteps: [
    "Log line is tokenized into individual words and symbols",
    "Each token is checked against matching rules in priority order",
    "First matching rule determines the token's style",
    "Unmatched tokens use defaultStyle",
    "Styled tokens are rendered as ANSI or HTML",
  ],
} as const;

export const CLASSES = {
  section: "py-24",
  container: "container mx-auto px-4",
  wrapper: "mx-auto max-w-6xl",
  header: {
    title: "mb-4 text-center text-5xl lg:text-6xl font-bold",
    gradient: "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
    description: "mb-12 text-center text-xl text-slate-600 dark:text-slate-400",
  },
  grid: "grid gap-8 lg:grid-cols-2",
  tabs: {
    wrapper: "flex gap-2 mb-6 flex-wrap",
    button: {
      base: "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
      active: "bg-blue-600 text-white",
      inactive: "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600",
    },
  },
  card: "bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700",
  sectionTitle: "text-xl font-bold mb-2 text-blue-600 dark:text-blue-400",
  sectionDescription: "text-slate-600 dark:text-slate-400 mb-6",
  propertyList: "space-y-4",
  property: {
    wrapper: "border-l-2 border-blue-600/30 pl-4",
    header: "flex items-center gap-2 mb-1",
    name: "text-blue-600 dark:text-blue-400 font-semibold",
    required: "text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded",
    type: "text-xs text-slate-500 dark:text-slate-400",
    description: "text-sm text-slate-600 dark:text-slate-400",
    example: "text-xs text-slate-500 dark:text-slate-500 mt-1 block",
  },
  priority: {
    wrapper: "space-y-2",
    item: "flex items-center gap-3",
    number: "w-6 h-6 rounded-full bg-blue-600/20 text-blue-600 dark:text-blue-400 text-xs flex items-center justify-center font-bold",
    name: "text-sm text-blue-600 dark:text-blue-400",
    description: "text-xs text-slate-500",
  },
  terminal: {
    wrapper: "rounded-lg overflow-hidden border border-slate-700",
    header: "bg-slate-800 px-4 py-2 flex items-center gap-2",
    dots: "flex gap-1.5",
    dot: {
      red: "w-3 h-3 rounded-full bg-red-500",
      yellow: "w-3 h-3 rounded-full bg-yellow-500",
      green: "w-3 h-3 rounded-full bg-green-500",
    },
    title: "text-xs text-white/60 ml-2",
    content: "p-4 bg-slate-900 text-sm overflow-auto max-h-[600px]",
    code: "text-slate-300",
  },
  howMatching: {
    wrapper: "mt-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg p-6 border border-blue-600/20",
    title: "font-semibold mb-3 text-blue-600 dark:text-blue-400",
    list: "space-y-3 text-sm text-slate-600 dark:text-slate-400",
    item: "flex gap-2",
    number: "text-blue-600",
  },
  sectionLabel: "font-semibold mb-4 text-slate-900 dark:text-white",
} as const;

export const STYLES = {
  headerDropShadow: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
} as const;

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
