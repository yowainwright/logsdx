import fs from 'fs';
import { createRegexLineParser, RegexParserRule } from '../regex/line';
import { type LineParser, type LineParseResult, type JSONRule } from '../../types';


export async function loadJsonRules(filePath: string = 'log_rules.json'): Promise<LineParser> {
  const data = fs.readFileSync(filePath, 'utf-8');
  const json: JSONRule[] = JSON.parse(data);

  const rules: RegexParserRule[] = json.map((rule) => ({
    match: new RegExp(rule.match),
    extract: () => ({
      lang: rule.lang,
      level: rule.level,
      meta: rule.meta,
    } as LineParseResult),
  }));

  return createRegexLineParser(rules);
}
