export const CLI_NAME = "logsdx";
export const CLI_VERSION = "0.1.1";
export const CLI_DESCRIPTION = "Enhanced log styling and visualization tool";

export const SUCCESS_ICON = "✅";
export const ERROR_ICON = "❌";
export const INFO_ICON = "ℹ️";
export const WARNING_ICON = "⚠️";
export const FILE_ICON = "📄";
export const STATS_ICON = "📊";
export const SIZE_ICON = "📐";
export const LIGHTBULB_ICON = "💡";

export const DEFAULT_THEME = "default";
export const DEFAULT_OUTPUT = "styled";

export const EXIT_SUCCESS = 0;
export const EXIT_ERROR = 1;

export const SIZE_UNITS: ReadonlyArray<string> = [
  "B",
  "KB",
  "MB",
  "GB",
  "TB",
] as const;
export const SIZE_UNIT_MULTIPLIER = 1024;
