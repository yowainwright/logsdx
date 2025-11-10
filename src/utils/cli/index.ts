import type {
  OptionDefinition,
  ParsedOptions,
  ArgumentDefinition,
} from "./types";
import { HELP_FLAGS, VERSION_FLAGS, BOOLEAN_FLAG_PREFIX } from "./constants";
import {
  camelCase,
  findOption,
  extractLongFlag,
  expectsValue,
  hasOptionalValue,
} from "./utils";

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

  option(flags: string, description: string, defaultValue?: any): this {
    this.options.push({ flags, description, defaultValue });
    return this;
  }

  argument(name: string, description: string): this {
    const required = !name.startsWith("[");
    const cleanName = name.replace(/[\[\]]/g, "");
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
    const args = argv.slice(2);
    const options: ParsedOptions = {};
    let positionalArg: string | undefined;

    this.options.forEach((opt) => {
      const longFlag = extractLongFlag(opt.flags);
      if (longFlag && opt.defaultValue !== undefined) {
        options[camelCase(longFlag)] = opt.defaultValue;
      }
    });

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (HELP_FLAGS.includes(arg)) {
        this.showHelp();
        process.exit(0);
      }

      if (VERSION_FLAGS.includes(arg)) {
        process.stdout.write(this.programVersion + "\n");
        process.exit(0);
      }

      if (arg.startsWith("--")) {
        const flag = arg.slice(2);
        const opt = findOption(this.options, `--${flag}`);

        if (opt) {
          const longFlag = extractLongFlag(opt.flags);
          if (!longFlag) continue;

          const key = camelCase(longFlag);

          if (expectsValue(opt.flags)) {
            options[key] = args[++i];
          } else if (hasOptionalValue(opt.flags)) {
            const next = args[i + 1];
            if (next && !next.startsWith("-")) {
              options[key] = args[++i];
            } else {
              options[key] = true;
            }
          } else if (flag.startsWith(BOOLEAN_FLAG_PREFIX)) {
            const positiveKey = camelCase(
              flag.slice(BOOLEAN_FLAG_PREFIX.length),
            );
            options[positiveKey] = false;
          } else {
            options[key] = true;
          }
        }
      } else if (arg.startsWith("-") && arg.length === 2) {
        const shortFlag = arg[1];
        const opt = findOption(this.options, `-${shortFlag},`);

        if (opt) {
          const longFlag = extractLongFlag(opt.flags);
          if (longFlag) {
            const key = camelCase(longFlag);

            if (expectsValue(opt.flags)) {
              options[key] = args[++i];
            } else {
              options[key] = true;
            }
          }
        }
      } else {
        positionalArg = arg;
      }
    }

    if (this.actionFn) {
      const result = this.actionFn(positionalArg, options);
      if (result instanceof Promise) {
        result.catch((err) => {
          process.stderr.write(String(err) + "\n");
          process.exit(1);
        });
      }
    }
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

export {
  type OptionDefinition,
  type ParsedOptions,
  type ArgumentDefinition,
} from "./types";
export default CLI;
