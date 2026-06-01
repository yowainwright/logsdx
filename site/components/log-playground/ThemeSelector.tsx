"use client";

import React from "react";
import { AVAILABLE_THEMES, THEME_LABELS } from "./constants";

interface ThemeSelectorProps {
  value: string;
  onChange: (theme: string) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-select" className="text-sm font-medium">
        Theme:
      </label>
      <select
        id="theme-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 text-sm border rounded-md bg-white dark:bg-slate-800 dark:border-slate-600"
      >
        {AVAILABLE_THEMES.map((theme) => (
          <option key={theme} value={theme}>
            {THEME_LABELS[theme]}
          </option>
        ))}
      </select>
    </div>
  );
}
