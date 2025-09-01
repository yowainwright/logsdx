import { getLogsDX as getLogsDXBase } from "logsdx";

export function createLogger(theme: string = "dracula") {
  const logger = getLogsDXBase({
    theme,
    outputFormat: "html",
    htmlStyleFormat: "css"
  }) as any; // Type assertion to bypass TypeScript issue
  
  const hasLogger = logger && typeof logger?.processLine === 'function';
  
  // Ensure we have a valid logger instance
  if (!hasLogger) {
    // Fallback implementation
    return {
      processLine: (line: string) => line
    };
  }
  
  return logger;
}