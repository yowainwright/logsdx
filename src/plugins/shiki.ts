import { getHighlighter } from 'shiki';
import type { LogEnhancerPlugin } from '../types';

export async function createShikiPlugin(lang: Lang, theme: string): Promise<LogEnhancerPlugin> {
    const highlighter = await getHighlighter({ theme });
    return {
        enhanceLine: (line, index, context) => {
        const html = highlighter.codeToHtml(line, { lang: context?.lang || lang });
        return (
            <div key={index} dangerouslySetInnerHTML={{ __html: html }} className="shiki" />
        );
        },
    };
}