import { type LineParser } from "./types";
import { defaultLineParser } from "./default";

// Registry to store available parsers
export const parserRegistry: Record<
  string,
  (options?: any) => Promise<LineParser>
> = {
  // Default parser
  default: async () => defaultLineParser,
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
