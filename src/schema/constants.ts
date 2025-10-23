export const COLOR_PATTERN =
  /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|\w+)/;

export const COLOR_VALIDATION_MESSAGE =
  "Invalid color format. Use hex (#ff0000), rgb(), hsl(), or named colors";

export const EMPTY_COLOR_MESSAGE = "Color cannot be empty";

export const STYLE_CODES = [
  "bold",
  "italic",
  "underline",
  "dim",
  "blink",
  "reverse",
  "strikethrough",
] as const;

export const WHITESPACE_OPTIONS = ["preserve", "trim"] as const;
export const NEWLINE_OPTIONS = ["preserve", "trim"] as const;
export const THEME_MODES = ["light", "dark", "auto"] as const;
export const HTML_STYLE_FORMATS = ["css", "className"] as const;

export const DEFAULT_WHITESPACE = "preserve";
export const DEFAULT_NEWLINE = "preserve";

export const THEME_MODE_DESCRIPTION =
  "Theme mode: light for light backgrounds, dark for dark backgrounds, auto for system preference";

export const TOKEN_CONTENT_DESCRIPTION = "The actual text content of the token";
export const TOKEN_METADATA_DESCRIPTION =
  "Additional token metadata including style information";
export const TOKEN_STYLE_DESCRIPTION = "Styling information for this token";
export const HTML_STYLE_FORMAT_DESCRIPTION = "HTML style format";

export const TOKEN_SCHEMA_NAME = "Token";
export const TOKEN_SCHEMA_DESCRIPTION =
  "Schema for tokens in the LogsDX styling system";

export const THEME_SCHEMA_NAME = "Theme";
export const THEME_SCHEMA_DESCRIPTION =
  "Schema for themes in the LogsDX styling system";
