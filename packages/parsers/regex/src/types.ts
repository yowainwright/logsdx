import { type LogLevel } from "@logsdx/parser-core";

export type RegexParserRule = {
  match: RegExp;
  extract?: (line: string, match: RegExpMatchArray) => Record<string, any>;
};
