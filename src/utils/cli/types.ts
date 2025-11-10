export interface OptionDefinition {
  flags: string;
  description: string;
  defaultValue?: any;
}

export interface ParsedOptions {
  [key: string]: any;
}

export interface ArgumentDefinition {
  name: string;
  description: string;
  required: boolean;
}
