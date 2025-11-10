import type { OptionDefinition } from "./types";

export function camelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function findOption(
  options: OptionDefinition[],
  flag: string
): OptionDefinition | undefined {
  return options.find((o) => o.flags.includes(flag));
}

export function extractLongFlag(flags: string): string | null {
  const match = flags.match(/--([a-z-]+)/);
  return match ? match[1] : null;
}

export function expectsValue(flags: string): boolean {
  return flags.includes("<");
}

export function hasOptionalValue(flags: string): boolean {
  return flags.includes("[") && !flags.startsWith("[");
}

export function isBooleanFlag(flags: string): boolean {
  return !expectsValue(flags) && !hasOptionalValue(flags);
}
