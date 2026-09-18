"use client";

import React from "react";
import type { PreviewPaneProps } from "./types";
import { WINDOW_BUTTON_COLORS, DEFAULT_HEIGHT } from "./constants";

function WindowButtons() {
  return (
    <div className="flex gap-1.5">
      <div className={`w-3 h-3 rounded-full ${WINDOW_BUTTON_COLORS.close}`} />
      <div
        className={`w-3 h-3 rounded-full ${WINDOW_BUTTON_COLORS.minimize}`}
      />
      <div
        className={`w-3 h-3 rounded-full ${WINDOW_BUTTON_COLORS.maximize}`}
      />
    </div>
  );
}

function PreviewLogs({
  borderColor,
  isLoading,
  logs,
  showBorder,
}: Pick<PreviewPaneProps, "borderColor" | "isLoading" | "logs" | "showBorder">) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {logs.map((log, index) => (
        <div
          key={index}
          className="leading-relaxed"
          style={
            showBorder
              ? { borderBottom: `1px solid ${borderColor}` }
              : undefined
          }
          dangerouslySetInnerHTML={{ __html: log }}
        />
      ))}
    </>
  );
}

export function PreviewPane({
  title,
  themeName,
  logs,
  backgroundColor,
  headerBg,
  borderColor,
  isLoading = false,
  showBorder = false,
}: PreviewPaneProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-700 flex flex-col">
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ backgroundColor: headerBg }}
      >
        <WindowButtons />
        <span className="text-xs text-white/70">{title}</span>
      </div>
      <div
        className={`p-4 font-mono text-sm overflow-auto ${DEFAULT_HEIGHT} flex-1`}
        style={{ backgroundColor }}
      >
        <PreviewLogs
          borderColor={borderColor}
          isLoading={isLoading}
          logs={logs}
          showBorder={showBorder}
        />
      </div>
      <div
        className="px-4 py-2 border-t"
        style={{ backgroundColor: headerBg, borderColor }}
      >
        <span className="text-xs text-white/60">Theme: {themeName}</span>
      </div>
    </div>
  );
}

export type { PreviewPaneProps } from "./types";
