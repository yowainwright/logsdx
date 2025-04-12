import { type RegexParserRule } from "../../types";

export const logParserRules: RegexParserRule[] = [
  {
    match: /^\[json\]/,
    extract: () => ({ lang: "json" }),
  },
  {
    match: /^\[sql\]/,
    extract: () => ({ lang: "sql" }),
  },
  {
    match: /ERROR/,
    extract: () => ({ level: "error" }),
  },
  {
    match: /WARN/,
    extract: () => ({ level: "warn" }),
  },
  {
    match: /INFO/,
    extract: () => ({ level: "info" }),
  },
  {
    match: /^\[lang:(\w+)\]/,
    extract: (_line, match) => ({ lang: match[1] }),
  },
];
