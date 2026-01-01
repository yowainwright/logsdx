"use client";

import React from "react";
import type { LogPaneProps } from "./types";
import { HEADER_GRADIENTS, HEADER_TEXT_COLORS } from "./constants";

export function LogPane({
  title,
  logs,
  backgroundColor,
  mode,
  isLoading = false,
}: LogPaneProps) {
  const headerGradient = HEADER_GRADIENTS[mode];
  const headerText = HEADER_TEXT_COLORS[mode];

  return (
    <div
      className="h-full p-4 font-mono text-xs relative overflow-hidden"
      style={{ backgroundColor }}
    >
      <div
        className="absolute inset-x-0 top-0 h-8 z-10 flex items-center justify-center"
        style={{ background: headerGradient }}
      >
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: headerText }}
        >
          {title}
        </span>
      </div>

      <div className="pt-8 space-y-1 h-40 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-slate-400">Loading...</div>
          </div>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className="px-2 py-0.5 text-xs leading-relaxed"
              dangerouslySetInnerHTML={{ __html: log }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export type { LogPaneProps } from "./types";
