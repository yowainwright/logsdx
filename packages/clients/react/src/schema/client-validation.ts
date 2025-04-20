// Lightweight validation for client-side
export type ClientSchema = {
  matchWords?: Record<string, StyleOptions>;
  matchPatterns?: Array<{ pattern: RegExp; options: StyleOptions }>;
  defaultStyle?: StyleOptions;
  lineNumbers?: boolean;
};

type StyleOptions = {
  className?: string;
  asciColor?: string;
  bold?: boolean;
  italic?: boolean;
  dim?: boolean;
  underline?: boolean;
};

// Simple type checking for better performance
export function validateClientSchema(schema: unknown): boolean {
  if (!schema || typeof schema !== "object") return false;

  const s = schema as ClientSchema;

  // Basic structural validation
  if (s.matchWords && typeof s.matchWords !== "object") return false;
  if (s.matchPatterns && !Array.isArray(s.matchPatterns)) return false;
  if (s.defaultStyle && typeof s.defaultStyle !== "object") return false;
  if (s.lineNumbers !== undefined && typeof s.lineNumbers !== "boolean")
    return false;

  return true;
}
