"use client";

import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OutputPaneProps {
  title: string;
  content: string[];
  backgroundColor: string;
  isLoading?: boolean;
  onCopy?: () => void;
  isCopied?: boolean;
}

export function OutputPane({
  title,
  content,
  backgroundColor,
  isLoading = false,
  onCopy,
  isCopied = false,
}: OutputPaneProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-700 border-b dark:border-slate-600">
        <span className="text-sm font-medium">{title}</span>
        {onCopy && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            className="h-7 px-2"
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
      <div
        className="flex-1 p-4 font-mono text-xs overflow-auto min-h-[200px]"
        style={{ backgroundColor }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-slate-400">Processing...</div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {content.map((line, i) => (
              <div
                key={i}
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: line }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
