export interface OptionDefinition {
  flags: string;
  description: string;
  defaultValue?: string | boolean | number;
}

export interface ParsedOptions {
  [key: string]: string | boolean | number | undefined;
}

export interface ArgumentDefinition {
  name: string;
  description: string;
  required: boolean;
}

export const HELP_FLAGS = ["--help", "-h"];
export const VERSION_FLAGS = ["--version", "-v"];
export const BOOLEAN_FLAG_PREFIX = "no-";

export function camelCase(str: string): string {
  const result = str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return result;
}

export function findOption(
  options: OptionDefinition[],
  flag: string,
): OptionDefinition | undefined {
  return options.find((o) => o.flags.includes(flag));
}

export function extractLongFlag(flags: string): string | null {
  const match = flags.match(/--([a-z-]+)/);
  if (!match) return null;
  return match[1];
}

export function expectsValue(flags: string): boolean {
  return flags.includes("<");
}

export function hasOptionalValue(flags: string): boolean {
  const hasBrackets = flags.includes("[");
  if (!hasBrackets) return false;
  return !flags.startsWith("[");
}

export function isBooleanFlag(flags: string): boolean {
  const acceptsValue = expectsValue(flags);
  const acceptsOptionalValue = hasOptionalValue(flags);
  if (acceptsValue) return false;
  return !acceptsOptionalValue;
}

function getDefaultOptions(
  optionDefinitions: OptionDefinition[],
): ParsedOptions {
  const options: ParsedOptions = {};

  optionDefinitions.forEach((option) => {
    const longFlag = extractLongFlag(option.flags);
    if (!longFlag) return;

    const hasDefaultValue = option.defaultValue !== undefined;
    if (hasDefaultValue) {
      options[camelCase(longFlag)] = option.defaultValue;
    }
  });

  return options;
}

function applyLongOption(
  args: string[],
  index: number,
  optionDefinitions: OptionDefinition[],
  options: ParsedOptions,
): number {
  const arg = args[index];
  const flag = arg.slice(2);
  const option = findOption(optionDefinitions, `--${flag}`);
  if (!option) return index;

  const longFlag = extractLongFlag(option.flags);
  if (!longFlag) return index;

  const key = camelCase(longFlag);
  if (expectsValue(option.flags)) {
    options[key] = args[index + 1];
    return index + 1;
  }

  if (hasOptionalValue(option.flags)) {
    const next = args[index + 1];
    const nextIsFlag = next?.startsWith("-") ?? false;
    const hasValue = Boolean(next) && !nextIsFlag;
    if (hasValue) {
      options[key] = next;
      return index + 1;
    }
    options[key] = true;
    return index;
  }

  const isNegativeFlag = flag.startsWith(BOOLEAN_FLAG_PREFIX);
  if (isNegativeFlag) {
    const positiveKey = camelCase(flag.slice(BOOLEAN_FLAG_PREFIX.length));
    options[positiveKey] = false;
    return index;
  }

  options[key] = true;
  return index;
}

function applyShortOption(
  args: string[],
  index: number,
  optionDefinitions: OptionDefinition[],
  options: ParsedOptions,
): number {
  const shortFlag = args[index][1];
  const option = findOption(optionDefinitions, `-${shortFlag},`);
  if (!option) return index;

  const longFlag = extractLongFlag(option.flags);
  if (!longFlag) return index;

  const key = camelCase(longFlag);
  if (expectsValue(option.flags)) {
    options[key] = args[index + 1];
    return index + 1;
  }

  options[key] = true;
  return index;
}

function applyFlag(
  args: string[],
  index: number,
  context: ArgumentParserContext,
): number | undefined {
  const arg = args[index];
  const isLongFlag = arg.startsWith("--");
  if (isLongFlag) {
    return applyLongOption(
      args,
      index,
      context.optionDefinitions,
      context.options,
    );
  }

  const isShortFlag = arg.startsWith("-") && arg.length === 2;
  if (isShortFlag) {
    return applyShortOption(
      args,
      index,
      context.optionDefinitions,
      context.options,
    );
  }

  return undefined;
}

interface ArgumentParserContext {
  optionDefinitions: OptionDefinition[];
  options: ParsedOptions;
  showHelp: () => void;
  version: string;
}

function parseArguments(
  args: string[],
  context: ArgumentParserContext,
): string | undefined {
  let positionalArg: string | undefined;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    const isHelpFlag = HELP_FLAGS.includes(arg);
    if (isHelpFlag) {
      context.showHelp();
      process.exit(0);
    }

    const isVersionFlag = VERSION_FLAGS.includes(arg);
    if (isVersionFlag) {
      process.stdout.write(context.version + "\n");
      process.exit(0);
    }

    const nextIndex = applyFlag(args, index, context);
    const isFlag = nextIndex !== undefined;
    if (isFlag) {
      index = nextIndex;
      continue;
    }

    positionalArg = arg;
  }

  return positionalArg;
}

function runAction(
  actionFn: (
    arg: string | undefined,
    options: ParsedOptions,
  ) => Promise<void> | void,
  positionalArg: string | undefined,
  options: ParsedOptions,
): void {
  const result = actionFn(positionalArg, options);
  if (!(result instanceof Promise)) return;

  result.catch((err) => {
    process.stderr.write(String(err) + "\n");
    process.exit(1);
  });
}

export class CLI {
  private programName = "";
  private programDescription = "";
  private programVersion = "";
  private options: OptionDefinition[] = [];
  private argumentDef?: ArgumentDefinition;
  private actionFn?: (
    arg: string | undefined,
    options: ParsedOptions,
  ) => Promise<void> | void;

  name(value: string): this {
    this.programName = value;
    return this;
  }

  description(value: string): this {
    this.programDescription = value;
    return this;
  }

  version(value: string): this {
    this.programVersion = value;
    return this;
  }

  option(
    flags: string,
    description: string,
    defaultValue?: string | boolean | number,
  ): this {
    this.options.push({ flags, description, defaultValue });
    return this;
  }

  argument(name: string, description: string): this {
    const required = !name.startsWith("[");
    const cleanName = name.replace(/[[\]]/g, "");
    this.argumentDef = { name: cleanName, description, required };
    return this;
  }

  action(
    fn: (
      arg: string | undefined,
      options: ParsedOptions,
    ) => Promise<void> | void,
  ): this {
    this.actionFn = fn;
    return this;
  }

  parse(argv: string[] = process.argv): void {
    if (!this.actionFn) return;

    const args = argv.slice(2);
    const options = getDefaultOptions(this.options);
    const positionalArg = parseArguments(args, {
      optionDefinitions: this.options,
      options,
      showHelp: () => this.showHelp(),
      version: this.programVersion,
    });
    runAction(this.actionFn, positionalArg, options);
  }

  private showHelp(): void {
    const lines = [
      `${this.programName} - ${this.programDescription}`,
      "",
      `Version: ${this.programVersion}`,
      "",
      "Usage:",
      `  ${this.programName} [options]${this.argumentDef ? ` [${this.argumentDef.name}]` : ""}`,
      "",
    ];

    if (this.argumentDef) {
      lines.push("Arguments:");
      lines.push(`  ${this.argumentDef.name}  ${this.argumentDef.description}`);
      lines.push("");
    }

    lines.push("Options:");
    this.options.forEach((opt) => {
      lines.push(`  ${opt.flags.padEnd(30)} ${opt.description}`);
    });
    lines.push(`  -h, --help                     Show help`);
    lines.push(`  -v, --version                  Show version`);

    process.stdout.write(lines.join("\n") + "\n");
  }
}

export function createCLI(): CLI {
  return new CLI();
}

export default CLI;
