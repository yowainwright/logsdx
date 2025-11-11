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
  },
): string {
  
  if (text === "LogsDX") {
    return LOGSDX_ASCII;
  }

  
  return text;
}

export default { textSync };
