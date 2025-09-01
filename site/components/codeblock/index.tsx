"use client";

import React, { useMemo } from "react";
import { createLogger } from "./utils";
import type { CodeBlockProps, InlineCodeProps } from "./types";

export function CodeBlock({ 
  children, 
  theme = "dracula",
  className = "",
  language,
  showLineNumbers = false
}: CodeBlockProps) {
  const processedCode = useMemo(() => {
    const logger = createLogger(theme);
    
    const lines = children.split('\n');
    const processedLines = lines.map((line, index) => {
      const processed = logger.processLine(line);
      
      if (showLineNumbers) {
        const lineNumber = String(index + 1).padStart(3, ' ');
        return `<span class="line-number">${lineNumber}</span> ${processed}`;
      }
      
      return processed;
    });
    
    return processedLines.join('\n');
  }, [children, theme, showLineNumbers]);

  return (
    <div className={`rounded-lg bg-slate-900 p-4 text-white overflow-x-auto ${className}`}>
      <pre 
        className="text-sm font-mono"
        data-language={language}
        dangerouslySetInnerHTML={{ __html: processedCode }}
      />
    </div>
  );
}

export function InlineCode({ 
  children,
  theme = "dracula",
  className = ""
}: InlineCodeProps) {
  const processedCode = useMemo(() => {
    const logger = createLogger(theme);
    
    return logger.processLine(children);
  }, [children, theme]);
  
  return (
    <code 
      className={`rounded-md bg-slate-200 px-1.5 py-0.5 text-sm font-medium dark:bg-slate-800 ${className}`}
      dangerouslySetInnerHTML={{ __html: processedCode }}
    />
  );
}