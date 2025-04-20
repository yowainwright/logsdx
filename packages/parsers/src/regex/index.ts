import { createRegexLineParser } from "@/src/parsers/regex/line";
import { logParserRules } from "@/src/parsers/regex/rules";

export const regexBasedParser = createRegexLineParser(logParserRules);
export { logParserRules, createRegexLineParser };
