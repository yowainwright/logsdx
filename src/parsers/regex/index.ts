
import { createRegexLineParser } from './line';
import { logParserRules } from './rules';

export const regexBasedParser = createRegexLineParser(logParserRules);
export {
  logParserRules,
  createRegexLineParser,
}