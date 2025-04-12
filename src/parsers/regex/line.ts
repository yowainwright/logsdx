  export function createRegexLineParser(rules: RegexParserRule[]): LineParser {
    return (line) => {
      for (const rule of rules) {
        const match = line.match(rule.match);
        if (match) {
          return rule.extract?.(line, match) || {};
        }
      }
      return undefined;
    };
  }