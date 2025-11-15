import type { Theme } from "../types";
import { SimpleLexer, createLexer } from "./index";
import type { CachedLexer, CacheOptions } from "./cache-types";
import { MAX_CACHE_SIZE, CACHE_TTL } from "./cache-constants";

class TokenizerCache {
  private cache = new Map<string, CachedLexer>();

  private hashTheme(theme: Theme | undefined): string {
    if (!theme) return "default";

    const schemaStr = JSON.stringify({
      words: Object.keys(theme.schema.matchWords || {}),
      patterns: (theme.schema.matchPatterns || []).map((p) => p.pattern),
      startsWith: Object.keys(theme.schema.matchStartsWith || {}),
      endsWith: Object.keys(theme.schema.matchEndsWith || {}),
      contains: Object.keys(theme.schema.matchContains || {}),
    });

    return `${theme.name}:${this.simpleHash(schemaStr)}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  getLexer(theme: Theme | undefined, options?: CacheOptions): SimpleLexer {
    const themeHash = this.hashTheme(theme);
    const cacheKey = `${themeHash}:${options?.trim || "none"}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.lastUsed = Date.now();
      return cached.lexer;
    }

    const lexer = this.createLexer(theme, options);
    this.cache.set(cacheKey, {
      lexer,
      themeHash,
      lastUsed: Date.now(),
    });

    this.cleanup();

    return lexer;
  }

  private createLexer(
    theme: Theme | undefined,
    options?: CacheOptions,
  ): SimpleLexer {
    return createLexer(theme);
  }

  private cleanup(): void {
    if (this.cache.size <= MAX_CACHE_SIZE) return;

    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    for (const [key, value] of entries) {
      if (now - value.lastUsed > CACHE_TTL) {
        this.cache.delete(key);
      }
    }

    if (this.cache.size > MAX_CACHE_SIZE) {
      const sorted = entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);
      const toRemove = sorted.slice(0, this.cache.size - MAX_CACHE_SIZE);
      for (const [key] of toRemove) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const tokenizerCache = new TokenizerCache();
