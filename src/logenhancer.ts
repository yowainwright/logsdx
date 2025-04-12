import { type LogEnhancerPluginInitial } from './types';

export class LogEnhancer {
    
    private enhancers: LogEnhancerPluginInitial[] = [];
    private highlighter: 'shiki' | 'prism';
    private lang: string;
    private theme: string;
    private debug: boolean;
    private inferLangFromLine?: (line: string) => string | undefined;

    constructor(options: LogEnhancerOptions = {}) {
        this.highlighter = options.highlighter ?? 'shiki';
        this.lang = options.lang ?? DEFAULT_LANG;
        this.theme = options.theme ?? DEFAULT_THEME;
        this.debug = options.debug ?? false;
        this.inferLangFromLine = options.inferLangFromLine;

        if (options.plugins?.length) {
        this.enhancers.push(...options.plugins);
        }
    }

    async init() {
        await this.loadHighlighter();
    }

    async loadHighlighter() {
        if (this.debug) {
        console.debug('[LogEnhancer] Loading highlighter:', this.highlighter);
        }

        if (this.highlighter === 'shiki') {
        const highlighter = await getHighlighter({ theme: this.theme });

        this.use({
            enhanceLine: (line, lineIndex) => {
                const detectedLang = this.inferLangFromLine?.(line) ?? this.lang;
                const html = highlighter.codeToHtml(line, { lang: detectedLang as Lang });
                return (
                    <div
                        key={lineIndex}
                        className="shiki"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                );
            },
        });
        }

        if (this.highlighter === 'prism') {
        this.use({
            enhanceLine: (line, lineIndex) => {
            const detectedLang = this.inferLangFromLine?.(line) ?? this.lang;
            const highlighted = Prism.highlight(line, Prism.languages[detectedLang], detectedLang);
            return (
                <div
                key={lineIndex}
                className={`language-${detectedLang}`}
                dangerouslySetInnerHTML={{ __html: highlighted }}
                />
            );
            },
        });
        }
    }

    use(plugin: LogEnhancerPlugin) {
        this.enhancers.push(plugin);
    }

    reset() {
        this.enhancers = [];
    }

    async setLang(newLang: string) {
        if (this.debug) console.debug('[LogEnhancer] Language changed to', newLang);
        this.lang = newLang;
        this.reset();
        await this.loadHighlighter();
    }

    async setTheme(newTheme: string) {
        if (this.debug) console.debug('[LogEnhancer] Theme changed to', newTheme);
        this.theme = newTheme;
        this.reset();
        await this.loadHighlighter();
    }

    async setHighlighter(type: 'shiki' | 'prism') {
        if (this.debug) console.debug('[LogEnhancer] Highlighter changed to', type);
        this.highlighter = type;
        this.reset();
        await this.loadHighlighter();
    }

    setLangInference(fn: (line: string) => string | undefined) {
        this.inferLangFromLine = fn;
    }

    getPlugins(): LogEnhancerPlugin[] {
        return this.enhancers;
    }
    
    enhanceLine(line: string, index: number): string {
        const context = this.parseLine(line);
        for (const plugin of this.enhancers) {
            if (plugin.enhanceLine) {
            const result = plugin.enhanceLine(line, index, context);
            if (result) return result;
            }
        }
        return line;
    }
  
    enhanceWords(line: string, index: number): string[] {
      const context = this.parseLine(line);
      return line.split(' ').map((word, i) => {
        for (const plugin of this.enhancers) {
          if (plugin.enhanceWord) {
            const result = plugin.enhanceWord(word, index, i, context);
            if (result) return result;
          }
        }
        return word;
      });
    }
  }