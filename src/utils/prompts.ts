import * as readline from "readline";
import { logger } from "./logger";
import type {
  InputPrompt,
  SelectPrompt,
  CheckboxPrompt,
  ConfirmPrompt,
} from "./types";

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

async function validateInput(
  value: string,
  validate?: InputPrompt["validate"],
): Promise<boolean> {
  if (!validate) return true;
  const result = await Promise.resolve(validate(value));
  if (result === true) return true;
  const errorMsg = typeof result === "string" ? result : "Invalid input";
  logger.error(errorMsg);
  return false;
}

export async function input(options: InputPrompt): Promise<string> {
  const defaultText = options.default ? ` (${options.default})` : "";
  const prompt = `${options.message}${defaultText}: `;

  while (true) {
    const answer = await question(prompt);
    const value = answer.trim() || options.default || "";
    const isValid = await validateInput(value, options.validate);
    if (isValid) return value;
  }
}

function normalizeChoice(choice: SelectPrompt["choices"][0]) {
  return typeof choice === "string" ? { name: choice, value: choice } : choice;
}

function printChoices(choices: ReturnType<typeof normalizeChoice>[]) {
  choices.forEach((choice, index) => {
    const display = choice.name || choice.value;
    const desc = choice.description ? ` - ${choice.description}` : "";
    console.log(`  ${index + 1}. ${display}${desc}`);
  });
}

export async function select(options: SelectPrompt): Promise<string> {
  const choices = options.choices.map(normalizeChoice);
  const defaultIdx = options.default
    ? choices.findIndex((c) => c.value === options.default) + 1
    : 1;

  console.log(options.message);
  printChoices(choices);

  while (true) {
    const answer = await question(`Select (${defaultIdx}): `);
    const trimmed = answer.trim();
    const index = trimmed ? parseInt(trimmed, 10) - 1 : defaultIdx - 1;
    if (index >= 0 && index < choices.length) return choices[index].value;
    logger.error("Invalid selection");
  }
}

export async function checkbox(options: CheckboxPrompt): Promise<string[]> {
  console.log(options.message);
  options.choices.forEach((choice, index) => {
    const marker = choice.checked ? "◉" : "◯";
    console.log(`  ${marker} ${index + 1}. ${choice.name}`);
  });

  const answer = await question("Select (comma-separated numbers): ");
  const indices = answer
    .split(",")
    .map((s) => parseInt(s.trim(), 10) - 1)
    .filter((i) => i >= 0 && i < options.choices.length);

  return indices.map((i) => options.choices[i].value);
}

function getConfirmDefault(defaultVal?: boolean): string {
  if (defaultVal === undefined) return " (y/n)";
  return defaultVal ? " (Y/n)" : " (y/N)";
}

export async function confirm(options: ConfirmPrompt): Promise<boolean> {
  const defaultText = getConfirmDefault(options.default);
  const prompt = `${options.message}${defaultText}: `;
  const answer = await question(prompt);
  const value = answer.trim().toLowerCase();

  if (!value && options.default !== undefined) return options.default;
  return value === "y" || value === "yes";
}

export function closePrompts() {
  rl.close();
}
