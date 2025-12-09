import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllThemes,
  getTheme,
  createTheme,
  updateTheme,
  deleteTheme,
} from "@/db/collections";
import type { ThemeColors } from "@/components/themegenerator/types";

export function useThemes() {
  return useQuery({
    queryKey: ["themes"],
    queryFn: getAllThemes,
  });
}

export function useTheme(id: string | undefined) {
  return useQuery({
    queryKey: ["themes", id],
    queryFn: () => (id ? getTheme(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });
}

export function useCreateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      colors,
      presets,
    }: {
      name: string;
      colors: ThemeColors;
      presets: string[];
    }) => createTheme(name, colors, presets),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
  });
}

export function useUpdateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        name: string;
        colors: ThemeColors;
        presets: string[];
      }>;
    }) => updateTheme(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      queryClient.invalidateQueries({ queryKey: ["themes", variables.id] });
    },
  });
}

export function useDeleteTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
  });
}
