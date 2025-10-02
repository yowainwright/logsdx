export const TIMESTAMP_PATTERN = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/;
export const LOG_LEVEL_PATTERN = /\b(ERROR|WARN|INFO|DEBUG)\b/;
export const TAB_PATTERN = /\t+/;
export const MULTIPLE_SPACES_PATTERN = / {2,}/;
export const SINGLE_SPACE_PATTERN = / /;
export const NEWLINE_PATTERN = /\n/;
export const CARRIAGE_RETURN_PATTERN = /\r/;
export const WHITESPACE_PATTERN = /\s/;

export const TOKEN_TYPE_TAB = "tab";
export const TOKEN_TYPE_SPACES = "spaces";
export const TOKEN_TYPE_SPACE = "space";
export const TOKEN_TYPE_NEWLINE = "newline";
export const TOKEN_TYPE_CARRIAGE_RETURN = "carriage-return";
export const TOKEN_TYPE_WHITESPACE = "whitespace";
export const TOKEN_TYPE_TIMESTAMP = "timestamp";
export const TOKEN_TYPE_LEVEL = "level";
export const TOKEN_TYPE_WORD = "word";
export const TOKEN_TYPE_REGEX = "regex";
export const TOKEN_TYPE_DEFAULT = "default";
export const TOKEN_TYPE_CHAR = "char";

export const MATCH_TYPE_WORD = "word";
export const MATCH_TYPE_REGEX = "regex";
export const MATCH_TYPE_DEFAULT = "default";

export const WHITESPACE_TRIM = "trim";
export const NEWLINE_TRIM = "trim";

export const DEFAULT_RULES = [
  {
    pattern:
      /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?\b/,
    type: "timestamp",
  },
  {
    pattern: /\b(DEBUG|INFO|WARN(?:ING)?|ERROR|FATAL|TRACE)\b/i,
    type: "level",
  },
  {
    pattern: /\b([a-zA-Z0-9_-]+)=(['"])((?:\\.|(?!\2).)*?)\2/,
    type: "key-value",
  },
  {
    pattern: /\b([a-zA-Z0-9_-]+)=([^\s,;]+)/,
    type: "key-value",
  },
  {
    pattern: /\{[^}]*\}/,
    type: "json",
  },
  {
    pattern: /\[[^\]]*\]/,
    type: "brackets",
  },
  {
    pattern: /"[^"]*"/,
    type: "string",
  },
  {
    pattern: /'[^']*'/,
    type: "string",
  },
  {
    pattern: /\b\d+\b/,
    type: "number",
  },
  {
    pattern: /\s+/,
    type: "whitespace",
  },
  {
    pattern: /./,
    type: "char",
  },
];
