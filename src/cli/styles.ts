
export const ANSI = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    italic: '\x1b[3m',
  
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
  };
  
  export function styleLine(line: string, level?: string): string {
    switch (level) {
      case 'error':
        return `${ANSI.red}${ANSI.bold}${line}${ANSI.reset}`;
      case 'warn':
        return `${ANSI.yellow}${line}${ANSI.reset}`;
      case 'info':
        return `${ANSI.blue}${line}${ANSI.reset}`;
      default:
        return line;
    }
  }