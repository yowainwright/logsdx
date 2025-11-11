import { SIZE_UNITS, SIZE_UNIT_MULTIPLIER } from "./constants";






export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const unitIndex = Math.floor(
    Math.log(bytes) / Math.log(SIZE_UNIT_MULTIPLIER),
  );
  const clampedIndex = Math.min(unitIndex, SIZE_UNITS.length - 1);
  const size = bytes / Math.pow(SIZE_UNIT_MULTIPLIER, clampedIndex);
  const unit = SIZE_UNITS[clampedIndex];

  return `${size.toFixed(1)} ${unit}`;
}






export function formatNumber(num: number): string {
  return num.toLocaleString();
}






export function fileExists(path: string): boolean {
  try {
    return require("fs").existsSync(path);
  } catch {
    return false;
  }
}





export function ensureDir(dirPath: string): void {
  const fs = require("fs");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
