import React, { isValidElement } from "react";
import { render, Text, Box } from "ink";
import type {
  InkLogViewerProps,
  LogLevel,
  LogEnhancer,
  LineParseResult,
} from "@/src/types";
import { style } from "@/src/cli/styles";
import { INK_DEFAULT_THEME } from "@/src/constants";
import {
  applyHighlightPatterns,
  formatLineNumber,
} from "@/src/utils/ink-utils";

/**
 * A React component for viewing and styling log output
 */
export const InkLogViewer: React.FC<InkLogViewerProps> = ({
  log,
  enhancer,
  showLineNumbers = false,
  highlightPatterns = [],
  theme = INK_DEFAULT_THEME,
  maxLines,
  wrap: shouldWrap = false,
  padding = 0,
}) => {
  // Split log into lines and apply maxLines limit if specified
  let lines = log.split("\n");
  if (maxLines && lines.length > maxLines) {
    lines = lines.slice(-maxLines);
  }

  // Convert padding to array format
  const paddingArray = Array.isArray(padding)
    ? padding.length === 2
      ? [padding[0], padding[1], padding[0], padding[1]]
      : padding
    : [padding, padding, padding, padding];

  return (
    <Box
      flexDirection="column"
      paddingTop={paddingArray[0]}
      paddingRight={paddingArray[1]}
      paddingBottom={paddingArray[2]}
      paddingLeft={paddingArray[3]}
    >
      {lines.map((line: string, i: number) => {
        // Get enhanced line and context
        const context = enhancer.parseLevel?.(line)
          ? {
              level: enhancer.parseLevel?.(line),
              timestamp: enhancer.parseTimestamp?.(line),
              message: enhancer.parseMessage?.(line),
            }
          : undefined;
        const enhanced = enhancer.enhanceLine?.(line, i, context);
        const level = context?.level;

        // Apply theme styling if level is detected and enhanced is a string
        let styledLine = enhanced ?? line;
        if (typeof styledLine === "string" && level && theme[level]) {
          styledLine = style(styledLine, theme[level]);
        }

        // Apply highlight patterns if it's a string
        if (typeof styledLine === "string") {
          styledLine = applyHighlightPatterns(styledLine, highlightPatterns);
        }

        // Add line numbers if enabled
        const lineNumber = showLineNumbers
          ? formatLineNumber(i, lines.length)
          : "";

        return (
          <Text key={i} wrap={shouldWrap ? "wrap" : undefined}>
            {lineNumber}
            {isValidElement(styledLine) ? (
              styledLine
            ) : (
              <Text>{styledLine}</Text>
            )}
          </Text>
        );
      })}
    </Box>
  );
};

/**
 * Helper function to render the InkLogViewer from a CLI context
 */
export function runInkLogViewer(props: InkLogViewerProps): void {
  render(<InkLogViewer {...props} />);
}
