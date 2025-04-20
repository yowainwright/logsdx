import type {
  Schema,
  StyleOptions,
  PatternMatch,
  WordMatch,
} from "../types/schema";

export class BaseParser {
  private schema: Schema;

  constructor(schema: Schema) {
    this.schema = schema;
  }

  protected applyWordMatches(line: string, matches: WordMatch): string {
    return Object.entries(matches).reduce((acc, [word, options]) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      return acc.replace(regex, (match) => this.applyStyle(match, options));
    }, line);
  }

  protected applyPatternMatches(
    line: string,
    patterns: PatternMatch[],
  ): string {
    return patterns.reduce((acc, { pattern, options }) => {
      return acc.replace(pattern, (match) => this.applyStyle(match, options));
    }, line);
  }

  protected applyStyle(text: string, options: StyleOptions): string {
    // Implementation depends on the output target (Terminal, HTML, etc.)
    return text;
  }

  public parse(line: string): string {
    let result = line;

    if (this.schema.matchWords) {
      result = this.applyWordMatches(result, this.schema.matchWords);
    }

    if (this.schema.matchPatterns) {
      result = this.applyPatternMatches(result, this.schema.matchPatterns);
    }

    if (this.schema.defaultStyle) {
      result = this.applyStyle(result, this.schema.defaultStyle);
    }

    return result;
  }
}
