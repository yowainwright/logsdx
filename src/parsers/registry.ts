import { type LineParser } from "@/src/types";
import { createRegexLineParser } from "@/src/parsers/regex/line";
import { loadJsonRules } from "@/src/parsers/json";
import { defaultLineParser } from "@/src/parsers/default";

// Default configuration for regex parser
export const DEFAULT_CONFIG = {
  defaultRules: [
    {
      match:
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)\s+\[(\w+)\]\s+(.*)$/,
      extract: (line: string, match: RegExpMatchArray) => ({
        timestamp: match[1],
        level: match[2].toLowerCase() as any,
        message: match[3],
      }),
    },
  ],
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
};

// Registry to store available parsers
export const parserRegistry: Record<string, (options?: any) => Promise<LineParser>> = {
  // Default parser
  default: async () => defaultLineParser,

  // Built-in parsers
  regex: async () => {
    return createRegexLineParser(DEFAULT_CONFIG.defaultRules);
  },

  json: async (options?: { rulesFile?: string }) => {
    return loadJsonRules(options?.rulesFile);
  },
};

/**
 * Register a new parser
 * @param name The name of the parser
 * @param factory The factory function that creates the parser
 */
export function registerParser(
  name: string,
  factory: (options?: any) => Promise<LineParser>,
): void {
  parserRegistry[name] = factory;
}

/**
 * Get a parser by name
 * @param name The name of the parser
 * @param options Options to pass to the parser factory
 * @returns The parser function
 */
export async function getParser(
  name: string,
  options?: any,
): Promise<LineParser> {
  if (!parserRegistry[name]) {
    throw new Error(
      `Parser '${name}' not found. Available parsers: ${Object.keys(parserRegistry).join(", ")}`,
    );
  }

  return parserRegistry[name](options);
}

/**
 * Get all registered parser names
 * @returns Array of parser names
 */
export function getRegisteredParsers(): string[] {
  return Object.keys(parserRegistry);
}
