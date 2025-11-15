import type { ThemePreset } from "./types";

interface PresetSelectorProps {
  presets: ThemePreset[];
  selectedPresets: string[];
  onToggle: (presetId: string) => void;
}

export function PresetSelector({
  presets,
  selectedPresets,
  onToggle,
}: PresetSelectorProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold">Pattern Presets</h3>
      <div className="space-y-2">
        {presets.map((preset) => (
          <label
            key={preset.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedPresets.includes(preset.id)}
              onChange={() => onToggle(preset.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium">{preset.label}</div>
              <div className="text-sm text-muted-foreground">
                {preset.description}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
