import { getHighlighter } from "shiki";
import type { LogEnhancerPlugin, LineParseResult } from "logsdx";
import type { ReactElement } from "react";

export type ShikiProps = {
  dangerouslySetInnerHTML: { __html: string };
  className: string;
};

/**
 * Creates a plugin that enhances code with syntax highlighting using Shiki
 */
export function createShikiPlugin(
  options: {
    theme?: string;
    lang?: string;
  } = {},
): LogEnhancerPlugin<ReactElement<ShikiProps>> {
  const theme = options.theme ?? "github-dark";
  const defaultLang = options.lang ?? "typescript";
  let highlighter: Awaited<ReturnType<typeof getHighlighter>>;

  return {
    enhanceLine: (
      line: string,
      lineIndex: number,
      context?: LineParseResult,
    ) => {
      if (!highlighter) {
        throw new Error(
          "Shiki highlighter not initialized. Please initialize it first.",
        );
      }

      const lang = context?.language ?? defaultLang;
      const html = highlighter.codeToHtml(line, {
        lang,
        themes: { light: theme },
      });

      return {
        type: "div",
        props: {
          dangerouslySetInnerHTML: { __html: html },
          className: "shiki",
        },
      } as ReactElement<ShikiProps>;
    },
    init: async () => {
      highlighter = await getHighlighter({
        themes: [theme],
        langs: [defaultLang],
      });
    },
  };
}
