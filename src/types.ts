export type LogEnhancerPlugin<T = string> {
    enhanceLine?: (line: string, lineIndex: number, context?: LineParseResult) => T;
    enhanceWord?: (word: string, lineIndex: number, wordIndex: number, context?: LineParseResult) => T;
}

export type LogLevel = 'info' | 'warn' | 'error';

export interface LineParseResult {
    lang?: string;
    level?: 'info' | 'warn' | 'error';
    meta?: Record<string, string>;
}
  
export type LineParser = (line: string) => LineParseResult | undefined;

export type RegexParserRule = {
    match: RegExp;
    extract?: (line: string, match: RegExpMatchArray) => LineParseResult;
}

export type LogEnhancerPluginInitial ={
    enhanceLine?: (line: string, lineIndex: number, context?: LineParseResult) => React.ReactNode;
    enhanceWord?: (word: string, lineIndex: number, wordIndex: number, context?: LineParseResult) => React.ReactNode;
}

export type JSONRule = {
    match: string;
    lang?: string;
    level?: 'info' | 'warn' | 'error';
    meta?: Record<string, string>;
}