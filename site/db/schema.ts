import { openDB, type IDBPDatabase, type DBSchema } from "idb";
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

interface LogsDXDBSchema extends DBSchema {
  themes: {
    key: string;
    value: SavedTheme;
    indexes: {
      byDate: number;
      byName: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<LogsDXDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<LogsDXDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<LogsDXDBSchema>("logsdx", 1, {
      upgrade(db) {
        const store = db.createObjectStore("themes", { keyPath: "id" });
        store.createIndex("byDate", "updatedAt");
        store.createIndex("byName", "name");
      },
    });
  }
  return dbPromise;
}
