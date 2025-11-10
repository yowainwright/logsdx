import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { ThemeColors } from "./types";
import { DEFAULT_DARK_COLORS } from "./constants";

interface ThemeDB extends DBSchema {
  themes: {
    key: string;
    value: SavedTheme;
    indexes: { "by-date": Date };
  };
}

export interface SavedTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  presets: string[];
  createdAt: Date;
  updatedAt: Date;
  shareCode?: string;
}

interface ThemeState {
  // Current theme being edited
  currentTheme: {
    name: string;
    colors: ThemeColors;
    presets: string[];
  };

  // Saved themes
  savedThemes: SavedTheme[];

  // Actions
  setThemeName: (name: string) => void;
  setColor: (key: keyof ThemeColors, value: string) => void;
  togglePreset: (presetId: string) => void;
  resetTheme: () => void;
  saveTheme: () => Promise<string>;
  loadTheme: (id: string) => Promise<void>;
  deleteTheme: (id: string) => Promise<void>;
  exportTheme: () => string;
  importTheme: (shareCode: string) => void;
  generateShareUrl: () => string;
  loadFromShareCode: (shareCode: string) => void;
}

// IndexedDB helper
let db: IDBPDatabase<ThemeDB> | null = null;

async function getDB() {
  if (!db) {
    db = await openDB<ThemeDB>("logsdx-themes", 1, {
      upgrade(db) {
        const store = db.createObjectStore("themes", { keyPath: "id" });
        store.createIndex("by-date", "updatedAt");
      },
    });
  }
  return db;
}

// Create the store with persistence
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: {
        name: "my-custom-theme",
        colors: DEFAULT_DARK_COLORS,
        presets: ["logLevels", "numbers", "strings", "brackets"],
      },

      savedThemes: [],

      setThemeName: (name) =>
        set((state) => ({
          currentTheme: {
            ...state.currentTheme,
            name: name.toLowerCase().replace(/\s+/g, "-"),
          },
        })),

      setColor: (key, value) =>
        set((state) => ({
          currentTheme: {
            ...state.currentTheme,
            colors: {
              ...state.currentTheme.colors,
              [key]: value,
            },
          },
        })),

      togglePreset: (presetId) =>
        set((state) => ({
          currentTheme: {
            ...state.currentTheme,
            presets: state.currentTheme.presets.includes(presetId)
              ? state.currentTheme.presets.filter((p) => p !== presetId)
              : [...state.currentTheme.presets, presetId],
          },
        })),

      resetTheme: () =>
        set({
          currentTheme: {
            name: "my-custom-theme",
            colors: DEFAULT_DARK_COLORS,
            presets: ["logLevels", "numbers", "strings", "brackets"],
          },
        }),

      saveTheme: async () => {
        const { currentTheme } = get();
        const id = `theme-${Date.now()}`;
        const theme: SavedTheme = {
          id,
          name: currentTheme.name,
          colors: currentTheme.colors,
          presets: currentTheme.presets,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Save to IndexedDB
        const database = await getDB();
        await database.add("themes", theme);

        // Update saved themes list
        const allThemes = await database.getAllFromIndex("themes", "by-date");
        set({ savedThemes: allThemes.reverse() });

        return id;
      },

      loadTheme: async (id) => {
        const database = await getDB();
        const theme = await database.get("themes", id);

        if (theme) {
          set({
            currentTheme: {
              name: theme.name,
              colors: theme.colors,
              presets: theme.presets,
            },
          });
        }
      },

      deleteTheme: async (id) => {
        const database = await getDB();
        await database.delete("themes", id);

        const allThemes = await database.getAllFromIndex("themes", "by-date");
        set({ savedThemes: allThemes.reverse() });
      },

      exportTheme: () => {
        const { currentTheme } = get();
        const data = {
          name: currentTheme.name,
          colors: currentTheme.colors,
          presets: currentTheme.presets,
          version: "1.0.0",
        };
        return btoa(JSON.stringify(data));
      },

      importTheme: (shareCode) => {
        try {
          const data = JSON.parse(atob(shareCode));
          set({
            currentTheme: {
              name: data.name || "imported-theme",
              colors: data.colors || DEFAULT_DARK_COLORS,
              presets: data.presets || [],
            },
          });
        } catch (e) {
          console.error("Failed to import theme:", e);
        }
      },

      generateShareUrl: () => {
        const shareCode = get().exportTheme();
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        return `${baseUrl}/theme/${shareCode}`;
      },

      loadFromShareCode: (shareCode) => {
        get().importTheme(shareCode);
      },
    }),
    {
      name: "logsdx-theme-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentTheme: state.currentTheme }),
    },
  ),
);

// Load saved themes from IndexedDB on initialization
if (typeof window !== "undefined") {
  getDB().then(async (database) => {
    const themes = await database.getAllFromIndex("themes", "by-date");
    useThemeStore.setState({ savedThemes: themes.reverse() });
  });
}
