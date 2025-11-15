import { createDB } from "@tanstack/react-db";
import type { ThemeColors } from "@/components/themegenerator/types";

export interface SavedTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  presets: string[];
  createdAt: number;
  updatedAt: number;
  shareCode?: string;
}

export const db = createDB({
  name: "logsdx",
  version: 1,
  stores: {
    themes: {
      keyPath: "id",
      indexes: {
        byDate: {
          keyPath: "updatedAt",
        },
        byName: {
          keyPath: "name",
        },
      },
    },
  },
});

export type LogsDXDB = typeof db;
