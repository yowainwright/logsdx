import type { Preset } from "@/types/theme";

interface PresetSelectorProps {
  presets: Preset[];
  selectedPresets: string[];
  onToggle: (presetId: string) => void;
}

export function PresetSelector({ presets, selectedPresets, onToggle }: PresetSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pattern Presets</h3>
      <div className="space-y-3">
        {presets.map((preset) => (
          <label
            key={preset.id}
            className="flex items-start gap-3 cursor-pointer p-3 rounded border hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <input
              type="checkbox"
              checked={selectedPresets.includes(preset.id)}
              onChange={() => onToggle(preset.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium">{preset.label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {preset.description}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
