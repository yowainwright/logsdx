import * as readline from "readline";
import { logger } from "./logger";

interface InputPrompt {
  message: string;
  default?: string;
  validate?: (value: string) => boolean | string;
  transformer?: (value: string) => string;
}

interface SelectPrompt {
  message: string;
  choices: Array<
    { name?: string; value: string; description?: string } | string
  >;
  default?: string;
}

interface CheckboxPrompt {
  message: string;
  choices: Array<{ name: string; value: string; checked?: boolean }>;
}

interface ConfirmPrompt {
  message: string;
  default?: boolean;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

export async function input(options: InputPrompt): Promise<string> {
  const defaultText = options.default ? ` (${options.default})` : "";
  const prompt = `${options.message}${defaultText}: `;

  while (true) {
    const answer = await question(prompt);
    const value = answer.trim() || options.default || "";

    if (options.validate) {
      const validation = options.validate(value);
      if (validation === true) {
        return value;
      }
      logger.error(
        typeof validation === "string" ? validation : "Invalid input",
      );
      continue;
    }

    return value;
  }
}

export async function select(options: SelectPrompt): Promise<string> {
  const choices = options.choices.map((choice) =>
    typeof choice === "string" ? { name: choice, value: choice } : choice,
  );

  console.log(options.message);
  choices.forEach((choice, index) => {
    const display = choice.name || choice.value;
    const desc = choice.description ? ` - ${choice.description}` : "";
    console.log(`  ${index + 1}. ${display}${desc}`);
  });

  const defaultIndex = options.default
    ? choices.findIndex((c) => c.value === options.default) + 1
    : 1;
  const defaultText = ` (${defaultIndex})`;

  while (true) {
    const answer = await question(`Select${defaultText}: `);
    const index = answer.trim()
      ? parseInt(answer.trim(), 10) - 1
      : defaultIndex - 1;

    if (index >= 0 && index < choices.length) {
      return choices[index].value;
    }
    logger.error("Invalid selection");
  }
}

export async function checkbox(options: CheckboxPrompt): Promise<string[]> {
  console.log(options.message);
  options.choices.forEach((choice, index) => {
    const checked = choice.checked ? "◉" : "◯";
    console.log(`  ${checked} ${index + 1}. ${choice.name}`);
  });

  const answer = await question("Select (comma-separated numbers): ");
  const indices = answer
    .split(",")
    .map((s) => parseInt(s.trim(), 10) - 1)
    .filter((i) => i >= 0 && i < options.choices.length);

  return indices.map((i) => options.choices[i].value);
}

export async function confirm(options: ConfirmPrompt): Promise<boolean> {
  const defaultText =
    options.default !== undefined
      ? ` (${options.default ? "Y/n" : "y/N"})`
      : " (y/n)";
  const prompt = `${options.message}${defaultText}: `;

  const answer = await question(prompt);
  const value = answer.trim().toLowerCase();

  if (!value && options.default !== undefined) {
    return options.default;
  }

  return value === "y" || value === "yes";
}

export function closePrompts() {
  rl.close();
}
