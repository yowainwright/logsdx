import { highlight, languages } from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import type { LogEnhancerPlugin, LineParseResult } from "../types";
import type { ReactElement } from "react";

export interface PrismProps {
  dangerouslySetInnerHTML: { __html: string };
  className: string;
}

/**
 * Creates a plugin that enhances code with syntax highlighting using Prism.js
 */
export function createPrismPlugin(
  options: {
    lang?: string;
    theme?: string;
  } = {},
): LogEnhancerPlugin<ReactElement<PrismProps>> {
  const defaultLang = options.lang ?? "typescript";
  const theme = options.theme ?? "default";

  return {
    enhanceLine: (
      line: string,
      lineIndex: number,
      context?: LineParseResult,
    ) => {
      const lang = context?.language ?? defaultLang;
      const grammar = languages[lang] || languages.typescript;

      if (!grammar) {
        throw new Error(`Language "${lang}" not found in Prism.js`);
      }

      const html = highlight(line, grammar, lang);

      return {
        type: "div",
        props: {
          dangerouslySetInnerHTML: { __html: html },
          className: `prism-highlight language-${lang} theme-${theme}`,
        },
      } as ReactElement<PrismProps>;
    },
  };
}
