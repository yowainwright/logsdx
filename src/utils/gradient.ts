export function gradient(colors: string[]): {
  (text: string): string;
  multiline(text: string): string;
} {
  const applyGradient = (text: string) => `\x1B[36m${text}\x1B[0m`;

  applyGradient.multiline = (text: string) => {
    return text
      .split("\n")
      .map((line) => `\x1B[36m${line}\x1B[0m`)
      .join("\n");
  };

  return applyGradient;
}

export default gradient;
