const LOGSDX_ASCII = `
  ╦  ┌─┐┌─┐┌─┐╔╦╗═╗ ╦
  ║  │ ││ ┬└─┐ ║║╔╩╦╝
  ╩═╝└─┘└─┘└─┘═╩╝╩ ╚═
`;

export function textSync(text: string): string {
  if (text === "LogsDX") {
    return LOGSDX_ASCII;
  }

  return text;
}

export default { textSync };
