import { createRegexLineParser, logParserRules } from "./regex";

import {
  DEFAULT_JSON_RULES as DEFAULT_JSON_RULES_DEFAULT,
  loadJsonRules,
} from "./json";

import {
  getRegisteredParsers,
  registerParser,
  getParser,
} from "./registry";

import {
  createCustomParser,
  createAppLogParser,
  createCsvLogParser,
  mapLogLevel,
  createParserFactory,
} from "./custom";

import { defaultLineParser } from "./default";

export {
  createCustomParser,
  createAppLogParser,
  createCsvLogParser,
  mapLogLevel,
  createParserFactory,
  getRegisteredParsers,
  registerParser,
  getParser,
  defaultLineParser,
  createRegexLineParser,
  logParserRules,
  DEFAULT_JSON_RULES_DEFAULT,
  loadJsonRules,
};
