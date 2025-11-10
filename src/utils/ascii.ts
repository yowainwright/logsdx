const LOGSDX_ASCII = `
  ╦  ┌─┐┌─┐┌─┐╔╦╗═╗ ╦
  ║  │ ││ ┬└─┐ ║║╔╩╦╝
  ╩═╝└─┘└─┘└─┘═╩╝╩ ╚═
`;

export function textSync(
  text: string,
  options?: {
    font?: string;
    horizontalLayout?: string;
    verticalLayout?: string;
  }
): string {
  // For LogsDX, return the predefined ASCII art
  if (text === "LogsDX") {
    return LOGSDX_ASCII;
  }
  
  // For other text, return as-is
  return text;
}

export default { textSync };
