export {
  parseToken,
  parseTokenSafe,
  parseTokenList,
  parseTokenListSafe,
  parseTheme,
  parseThemeSafe,
  createThemeValidationError,
  validateTheme,
  validateThemeSafe,
  isValidationError,
  formatValidationIssues,
  ValidationError,
} from "./index";

export type { Token, TokenList } from "./index";
export type { JsonSchemaOptions } from "./types";

import {
  TOKEN_SCHEMA_NAME,
  TOKEN_SCHEMA_DESCRIPTION,
  THEME_SCHEMA_NAME,
  THEME_SCHEMA_DESCRIPTION,
} from "./constants";

export function createTokenJsonSchemaOptions() {
  return { name: TOKEN_SCHEMA_NAME, description: TOKEN_SCHEMA_DESCRIPTION };
}

export function createThemeJsonSchemaOptions() {
  return { name: THEME_SCHEMA_NAME, description: THEME_SCHEMA_DESCRIPTION };
}
