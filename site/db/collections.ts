import { getDB, type SavedTheme } from "./schema";
import type { ThemeColors } from "@/components/themegenerator/types";

export async function createTheme(
  name: string,
  colors: ThemeColors,
  presets: string[],
): Promise<SavedTheme> {
  const db = await getDB();
  const theme: SavedTheme = {
    id: `theme-${Date.now()}`,
    name,
    colors,
    presets,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await db.put("themes", theme);
  return theme;
}

export async function updateTheme(
  id: string,
  updates: Partial<Omit<SavedTheme, "id" | "createdAt">>,
): Promise<SavedTheme | undefined> {
  const db = await getDB();
  const existing = await db.get("themes", id);
  if (!existing) return undefined;

  const updated: SavedTheme = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  await db.put("themes", updated);
  return updated;
}

export async function deleteTheme(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("themes", id);
}

export async function getTheme(id: string): Promise<SavedTheme | undefined> {
  const db = await getDB();
  return db.get("themes", id);
}

export async function getAllThemes(): Promise<SavedTheme[]> {
  const db = await getDB();
  const themes = await db.getAll("themes");
  return themes.sort((a, b) => b.updatedAt - a.updatedAt);
}
