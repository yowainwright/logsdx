import { Token, TokenList } from '@/src/schema/types';
import { Theme } from '@/src/types';
import { DEFAULT_RULES } from '@/src/tokenizer/constants';
import { MatcherType } from '@/src/tokenizer/types';

/**
 * Simple token context for rule matching
 */
class TokenContext {
  constructor(public text: string, public type: string) {}
  
  accept(type: string, value?: any): void {
    this.type = type;
    this.value = value;
  }
  
  ignore(): void {
    this.ignored = true;
  }
  
  value?: any;
  ignored?: boolean;
}

/**
 * Simple lexer implementation to replace Tokenizr
 */
class SimpleLexer {
  private rules: Array<{pattern: RegExp, action: (ctx: TokenContext) => void}> = [];
  private inputContent: string = '';
  private position: number = 0;
  
  rule(pattern: RegExp, action: (ctx: TokenContext) => void): void {
    this.rules.push({ pattern, action });
  }
  
  input(text: string): void {
    this.inputContent = text;
    this.position = 0;
  }
  
  token(): { type: string; text: string; value?: any } | null {
    if (this.position >= this.inputContent.length) {
      return null;
    }
    
    const slice = this.inputContent.slice(this.position);
    
    for (const { pattern, action } of this.rules) {
      pattern.lastIndex = 0;
      const match = pattern.exec(slice);
      
      if (match && match.index === 0) {
        const text = match[0];
        const ctx = new TokenContext(text, '');
        
        action(ctx);
        
        this.position += text.length;
        
        if (ctx.ignored) {
          return this.token();
        }
        
        return {
          type: ctx.type,
          text: ctx.text,
          value: ctx.value
        };
      }
    }
    
    // No rule matched, consume one character
    const text = this.inputContent[this.position] || '';
    this.position++;
    
    return {
      type: 'char',
      text
    };
  }
}

/**
 * Create a lexer with theme-specific rules
 */
export function createLexer(theme?: Theme): SimpleLexer {
  const lexer = new SimpleLexer();
  
  // Add default rules
  addDefaultRules(lexer);
  
  // Add theme-specific rules if provided
  if (theme) {
    addThemeRules(lexer, theme);
  }
  
  return lexer;
}

/**
 * Add default tokenization rules
 */
function addDefaultRules(lexer: SimpleLexer): void {
  DEFAULT_RULES.forEach(rule => {
    lexer.rule(rule.pattern, (ctx) => {
      if ('ignore' in rule && rule.ignore) {
        ctx.ignore();
      } else {
        ctx.accept(rule.type || 'default');
      }
    });
  });
}

/**
 * Add theme-specific tokenization rules
 */
function addThemeRules(lexer: SimpleLexer, theme: Theme): void {
  // Add word matchers from the schema structure
  if (theme.schema?.matchWords) {
    Object.keys(theme.schema.matchWords).forEach(word => {
      // Escape special regex characters in the word
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Always use case-insensitive matching for words
      lexer.rule(new RegExp(`\\b${escapedWord}\\b`, 'i'), (ctx) => {
        ctx.accept('word', { 
          pattern: word,
          style: theme.schema?.matchWords?.[word]
        });
      });
    });
  }
  
  // Add pattern matchers from the schema structure
  if (theme.schema?.matchPatterns) {
    theme.schema.matchPatterns.forEach((patternObj: any, index: number) => {
      try {
        const regex = new RegExp(patternObj.pattern);
        lexer.rule(regex, (ctx) => {
          ctx.accept('regex', { 
            pattern: patternObj.pattern, 
            name: patternObj.name,
            index,
            style: patternObj.options
          });
        });
      } catch (error) {
        console.warn(`Invalid regex pattern in theme: ${patternObj.pattern}`);
      }
    });
  }
}

/**
 * Tokenize a log line using theme-specific patterns
 * 
 * @param line - The log line to tokenize
 * @param theme - Optional theme to use for tokenization
 * @returns A list of tokens
 */
export function tokenize(line: string, theme?: Theme): TokenList {
  try {
    const lexer = createLexer(theme);
    lexer.input(line);
    
    const tokens: TokenList = [];
    let token;
    
    // Get whitespace and newline handling preferences from theme
    const whitespaceHandling = theme?.schema?.whiteSpace || 'preserve';
    const newlineHandling = theme?.schema?.newLine || 'preserve';
    
    while ((token = lexer.token()) !== null) {
      const matchType = token.type as MatcherType;
      
      // Handle whitespace based on theme preferences
      if (matchType === 'whitespace') {
        if (whitespaceHandling === 'trim') {
          // Skip whitespace tokens if set to trim
          continue;
        }
        
        // Special handling for newlines - create separate tokens
        if (token.text.includes('\n')) {
          // Split the whitespace token if it contains newlines
          const parts = token.text.split(/(\n)/);
          for (const part of parts) {
            if (part === '') continue;
            
            // Skip newlines if set to trim
            if (part === '\n' && newlineHandling === 'trim') {
              continue;
            }
            
            const newToken: Token = {
              content: part,
              metadata: {
                matchType: part === '\n' ? 'newline' : 'whitespace',
                matchPattern: part === '\n' ? 'newline' : 'whitespace'
              }
            };
            tokens.push(newToken);
          }
          continue;
        }
      }
      
      // Create the token with basic information
      const newToken: Token = {
        content: token.text,
        metadata: {
          matchType: matchType,
          matchPattern: token.value?.pattern || token.type
        }
      };
      
      // Add any additional metadata from the token
      if (token.value) {
        newToken.metadata = {
          ...newToken.metadata,
          ...token.value,
          // Ensure style is properly structured if it exists
          style: token.value.style || undefined
        };
      }
      
      tokens.push(newToken);
    }
    
    return tokens;
  } catch (error) {
    console.warn('Tokenization failed:', error);
    
    // If tokenization fails, return the whole line as a single token
    return [{
      content: line,
      metadata: {
        matchType: 'default' as MatcherType,
        matchPattern: 'default'
      }
    }];
  }
}

/**
 * Apply theme styling to tokenized content
 * 
 * @param tokens - The tokens to style
 * @param theme - The theme to apply
 * @returns Styled tokens with applied theme
 */
export function applyTheme(tokens: TokenList, theme: Theme): TokenList {
  return tokens.map(token => {
    const styledToken = { ...token };
    const matchType = token.metadata?.matchType as MatcherType;
    const matchPattern = token.metadata?.matchPattern as string;
    
    // Apply styling based on schema structure
    if (theme.schema) {
      // Apply word styling from schema.matchWords
      if (matchType === 'word' && matchPattern) {
        const wordStyle = theme.schema.matchWords?.[matchPattern];
        if (wordStyle) {
          styledToken.metadata = {
            ...styledToken.metadata,
            style: wordStyle
          };
        }
      }
      
      // Apply pattern styling from schema.matchPatterns
      if (matchType === 'regex' && theme.schema.matchPatterns) {
        // Try to match by name first
        const patternName = token.metadata?.name;
        if (patternName) {
          const pattern = theme.schema.matchPatterns.find((p: any) => p.name === patternName);
          if (pattern) {
            styledToken.metadata = {
              ...styledToken.metadata,
              style: pattern.options
            };
          }
        } 
        // Fall back to index if name not found
        else {
          const patternIndex = token.metadata?.index as number;
          if (patternIndex !== undefined && 
              patternIndex >= 0 && 
              patternIndex < theme.schema.matchPatterns.length) {
            styledToken.metadata = {
              ...styledToken.metadata,
              style: theme.schema.matchPatterns[patternIndex]?.options
            };
          }
        }
      }
      
      // Apply default styling if no specific style was applied
      if (!styledToken.metadata?.style && theme.schema.defaultStyle) {
        styledToken.metadata = {
          ...styledToken.metadata,
          style: theme.schema.defaultStyle
        };
      }
    }
    
    return styledToken;
  });
}

export default {
  tokenize,
  applyTheme,
  createLexer
};
