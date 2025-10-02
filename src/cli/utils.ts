import { SIZE_UNITS, SIZE_UNIT_MULTIPLIER } from "./constants";

/**
 * Format file size in human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const unitIndex = Math.floor(Math.log(bytes) / Math.log(SIZE_UNIT_MULTIPLIER));
  const clampedIndex = Math.min(unitIndex, SIZE_UNITS.length - 1);
  const size = bytes / Math.pow(SIZE_UNIT_MULTIPLIER, clampedIndex);
  const unit = SIZE_UNITS[clampedIndex];

  return `${size.toFixed(1)} ${unit}`;
}

/**
 * Format number with thousands separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Check if file exists
 * @param path - File path
 * @returns True if file exists
 */
export function fileExists(path: string): boolean {
  try {
    return require("fs").existsSync(path);
  } catch {
    return false;
  }
}

/**
 * Ensure directory exists
 * @param dirPath - Directory path
 */
export function ensureDir(dirPath: string): void {
  const fs = require("fs");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
