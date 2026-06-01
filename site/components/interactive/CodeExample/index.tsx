"use client";

import React from "react";
import { THEME_BACKGROUNDS, DEFAULT_BACKGROUND } from "./constants";
import type { CodeExampleProps } from "./types";

export function CodeExample({ title, code, themeName }: CodeExampleProps) {
  const bg = THEME_BACKGROUNDS[themeName] || DEFAULT_BACKGROUND;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700 flex flex-col">
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ backgroundColor: bg.headerBg }}
      >
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-white/70">{title}</span>
      </div>
      <div
        className="p-4 font-mono text-sm overflow-auto flex-1"
        style={{ backgroundColor: bg.bg, minHeight: "280px" }}
      >
        <pre className="text-slate-300 whitespace-pre-wrap">{code}</pre>
      </div>
      <div
        className="px-4 py-2 border-t"
        style={{ backgroundColor: bg.headerBg, borderColor: bg.border }}
      >
        <span className="text-xs text-white/60">Theme: {themeName}</span>
      </div>
    </div>
  );
}

export type { CodeExampleProps } from "./types";
