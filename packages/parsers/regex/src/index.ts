import { createRegexLineParser } from "./line";
import { logParserRules } from "./rules";
import { type RegexParserRule } from "./types";

export const regexBasedParser = createRegexLineParser(logParserRules);
export { logParserRules, createRegexLineParser };
export type { RegexParserRule };
