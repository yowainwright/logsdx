"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import { THEME_NAMES } from "./constants";
import type { ThemeControlsProps } from "./types";

function ThemeButtons({
  selectedTheme,
  onThemeChange,
}: Pick<ThemeControlsProps, "onThemeChange" | "selectedTheme">) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {THEME_NAMES.map((theme) => (
        <Button
          key={theme}
          variant={selectedTheme === theme ? "default" : "outline"}
          size="sm"
          onClick={() => onThemeChange(theme)}
        >
          {theme}
        </Button>
      ))}
    </div>
  );
}

function ColorModeButtons({
  colorMode,
  onColorModeChange,
}: Pick<ThemeControlsProps, "colorMode" | "onColorModeChange">) {
  return (
    <div className="flex gap-1 border rounded-lg p-1">
      <Button
        variant={colorMode === "light" ? "default" : "ghost"}
        size="icon"
        onClick={() => onColorModeChange("light")}
        className="h-8 w-8"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={colorMode === "system" ? "default" : "ghost"}
        size="icon"
        onClick={() => onColorModeChange("system")}
        className="h-8 w-8"
      >
        <Monitor className="h-4 w-4" />
      </Button>
      <Button
        variant={colorMode === "dark" ? "default" : "ghost"}
        size="icon"
        onClick={() => onColorModeChange("dark")}
        className="h-8 w-8"
      >
        <Moon className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ThemeControls({
  selectedTheme,
  colorMode,
  isDarkOnly,
  onThemeChange,
  onColorModeChange,
}: ThemeControlsProps) {
  return (
    <div className="sticky top-16 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-y border-slate-200 dark:border-slate-700 py-4 mb-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <ThemeButtons
            selectedTheme={selectedTheme}
            onThemeChange={onThemeChange}
          />

          {!isDarkOnly && (
            <ColorModeButtons
              colorMode={colorMode}
              onColorModeChange={onColorModeChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export type { ThemeControlsProps, ColorMode } from "./types";
