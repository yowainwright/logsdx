import fs from "fs";
import JSON5 from "json5";
import {
  type LineParser,
  type LineParseResult,
  type LogLevel,
  type JSONRule,
  type ParsedJSON,
} from "@/src/types";
import { logger } from "@/src/utils/logger";
import { LOG_TYPES, DEFAULT_JSON_RULES } from "@/src/parsers/json/constants";

export async function loadJsonRules(
  filePath?: string,
  debug = false,
): Promise<LineParser> {
  const rules = getRulesFromPath(filePath, debug);

  return (line: string): LineParseResult | undefined => {
    try {
      const matchingRule = testRule(rules, line);
      if (!matchingRule) return undefined;

      const json = JSON5.parse(line);
      return parseJsonLine(json, matchingRule);
    } catch (error) {
      return undefined;
    }
  };
}

export const getRulesFromPath = (filePath?: string, debug = false) => {
  let rules = DEFAULT_JSON_RULES;
  if (!filePath) return rules;
  let data: undefined | unknown;
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const customRules = JSON5.parse(data);
    if (Array.isArray(customRules) && customRules?.length > 0) {
      rules = customRules;
    }
  } catch (err) {
    if (debug) {
      if (filePath && !data) {
        logger.warn(`Tried and failed to load custom JSON rules: ${JSON5.stringify(err)}`);
      }
      logger.info("Using default JSON rules");
    }
  }
  return rules;
}

export const parseJsonLine = (json: ParsedJSON, matchingRule: JSONRule): LineParseResult => {
  // Check for level in JSON first
  const jsonLevel = json?.level || json?.status || json?.severity;
  
  // Create base result with the found level or fallback to matchingRule's level
  const result = createBaseResult({
    ...matchingRule,
    level: jsonLevel as LogLevel || matchingRule?.level
  });
  
  const resultWithMetadata = matchingRule.meta 
  ? applyMetadata(result, json, matchingRule.meta)
  : result;
  
  const timestamp = setTimestamp(resultWithMetadata, json);
  const message = setMessage(resultWithMetadata, json);
  
  const additionalMetadata = Object.entries(json).reduce((acc, [key, value]) => {
    if (!LOG_TYPES.includes(key) && !resultWithMetadata[key]) {
      return { ...acc, [key]: value };
    }
    return acc;
  }, {});
  
  return {
    ...resultWithMetadata,
    ...additionalMetadata,
    timestamp,
    message,
  };
};

export const applyMetadata = (
  result: LineParseResult, 
  json: ParsedJSON, 
  meta: Record<string, string>
): LineParseResult => {
  const metadata = Object.entries(meta).reduce((acc, [key, field]) => {
    const value = json?.[field];
    if (!value) return acc;
    return { ...acc, [key]: value };
  }, {});

  return {
    ...result,
    ...metadata
  };
};

export const testRule = (
  rules: JSONRule[], 
  line: string
): JSONRule | undefined => rules.find(rule => {
  const regex = new RegExp(rule.match);
  return regex.test(line.trim());
});

export const createBaseResult = (matchingRule: JSONRule): LineParseResult => ({
  language: matchingRule?.lang ?? "json",
  level: matchingRule?.level ?? "info"
});

export const setTimestamp = (result: LineParseResult, json: ParsedJSON): string | undefined => {
  if (result?.timestamp) return result.timestamp;
  return json?.timestamp || json?.time || json?.date || json?.["@timestamp"];
}

export const setMessage = (result: LineParseResult, json: ParsedJSON): string | undefined => {
  if (result?.message) return result.message;
  return json?.message || json?.msg || json?.log || json?.text;
}

export const setLevel = (result: LineParseResult, json: ParsedJSON): LogLevel => {
  if (result?.level) return result.level;
  
  const jsonLevel = json?.level || json?.status || json?.severity;
  if (jsonLevel) return jsonLevel as LogLevel;
  
  return "info";
}

