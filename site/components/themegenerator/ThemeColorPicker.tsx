import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { ThemeColors } from "./types";

interface ThemeColorPickerProps {
  colors: ThemeColors;
  onColorChange: (key: keyof ThemeColors, value: string) => void;
  onReset: () => void;
}

export function ThemeColorPicker({
  colors,
  onColorChange,
  onReset,
}: ThemeColorPickerProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Colors</h3>
        <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(colors).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1 capitalize">
              {key}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={value}
                onChange={(e) =>
                  onColorChange(key as keyof ThemeColors, e.target.value)
                }
                className="h-10 w-16 rounded border dark:border-slate-600 cursor-pointer"
              />
              <input
                type="text"
                value={value}
                onChange={(e) =>
                  onColorChange(key as keyof ThemeColors, e.target.value)
                }
                className="flex-1 px-2 py-1 text-sm border rounded dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
