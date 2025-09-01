/**
 * Default tokenization rules
 */

export const DEFAULT_RULES = [
  // Timestamps (ISO 8601)
  {
    pattern:
      /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?\b/,
    type: "timestamp",
  },

  // Log levels
  {
    pattern: /\b(DEBUG|INFO|WARN(?:ING)?|ERROR|FATAL|TRACE)\b/i,
    type: "level",
  },

  // Key-value pairs (quoted)
  {
    pattern: /\b([a-zA-Z0-9_-]+)=(['"])((?:\\.|(?!\2).)*?)\2/,
    type: "key-value",
  },

  // Key-value pairs (unquoted)
  {
    pattern: /\b([a-zA-Z0-9_-]+)=([^\s,;]+)/,
    type: "key-value",
  },

  // JSON objects
  {
    pattern: /\{[^}]*\}/,
    type: "json",
  },

  // Brackets
  {
    pattern: /\[[^\]]*\]/,
    type: "brackets",
  },

  // Quoted strings
  {
    pattern: /"[^"]*"/,
    type: "string",
  },
  {
    pattern: /'[^']*'/,
    type: "string",
  },

  // Numbers
  {
    pattern: /\b\d+\b/,
    type: "number",
  },

  // Whitespace
  {
    pattern: /\s+/,
    type: "whitespace",
  },

  // Any other character
  {
    pattern: /./,
    type: "char",
  },
];
