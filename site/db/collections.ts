import { createQueryDBCollection } from "@tanstack/query-db-collection";
import { db, type SavedTheme } from "./schema";
import type { ThemeColors } from "@/components/themegenerator/types";

export const themesCollection = createQueryDBCollection({
  db,
  storeName: "themes",
  queryKey: ["themes"],
});

export async function createTheme(
  name: string,
  colors: ThemeColors,
  presets: string[],
): Promise<SavedTheme> {
  const theme: SavedTheme = {
    id: `theme-${Date.now()}`,
    name,
    colors,
    presets,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await themesCollection.put(theme);
  return theme;
}

export async function updateTheme(
  id: string,
  updates: Partial<Omit<SavedTheme, "id" | "createdAt">>,
): Promise<SavedTheme | undefined> {
  const existing = await themesCollection.get(id);
  if (!existing) return undefined;

  const updated: SavedTheme = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  await themesCollection.put(updated);
  return updated;
}

export async function deleteTheme(id: string): Promise<void> {
  await themesCollection.delete(id);
}

export async function getTheme(id: string): Promise<SavedTheme | undefined> {
  return themesCollection.get(id);
}

export async function getAllThemes(): Promise<SavedTheme[]> {
  const themes = await themesCollection.getAll();
  return themes.sort((a, b) => b.updatedAt - a.updatedAt);
}
