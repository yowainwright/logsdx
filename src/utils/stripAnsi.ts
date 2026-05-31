import { ANSI_STRIP_REGEX } from "./constants";

export function stripAnsi(str: string): string {
  return str.replace(ANSI_STRIP_REGEX, "");
}

export default stripAnsi;
