"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useThemeProcessor } from "@/hooks/useThemeProcessor";
import { LogPane } from "./LogPane";
import { formatThemeName } from "./utils";
import {
  SAMPLE_LOGS,
  THEME_BACKGROUNDS,
  DEFAULT_BACKGROUND,
} from "./constants";
import type { ThemeCardProps } from "./types";

export function ThemeCard({ themeName, isVisible = true }: ThemeCardProps) {
  const logs = useMemo(() => SAMPLE_LOGS, []);
  const { processedLogs, isLoading, theme } = useThemeProcessor(
    themeName,
    logs,
  );
  const colors = THEME_BACKGROUNDS[themeName] || DEFAULT_BACKGROUND;

  if (!isVisible) return null;

  const htmlLogs = processedLogs.map((log) => log.html);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {formatThemeName(themeName)}
          {theme?.mode && (
            <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {theme.mode}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[200px]">
          <div className="relative border-r border-border">
            <LogPane
              title="Browser"
              logs={htmlLogs.slice(0, 6)}
              backgroundColor={colors.bg}
              mode={colors.mode}
              isLoading={isLoading}
            />
          </div>
          <div className="relative">
            <LogPane
              title="Terminal"
              logs={htmlLogs.slice(0, 6)}
              backgroundColor={colors.bg}
              mode={colors.mode}
              isLoading={isLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { ThemeCardProps } from "./types";
