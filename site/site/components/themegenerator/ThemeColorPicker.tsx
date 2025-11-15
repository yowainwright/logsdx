import type { ThemeColors } from "@/types/theme";

interface ThemeColorPickerProps {
  colors: ThemeColors;
  onColorChange: (key: keyof ThemeColors, value: string) => void;
  onReset: () => void;
}

export function ThemeColorPicker({ colors, onColorChange, onReset }: ThemeColorPickerProps) {
  const colorEntries = Object.entries(colors) as [keyof ThemeColors, string][];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Colors</h3>
        <button
          onClick={onReset}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Reset to Defaults
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {colorEntries.map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => onColorChange(key, e.target.value)}
              className="w-12 h-10 rounded border cursor-pointer"
            />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">{key}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => onColorChange(key, e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded font-mono"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
