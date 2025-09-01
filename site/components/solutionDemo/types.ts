export interface DemoLog {
  text: string;
  highlight: boolean;
}

export interface LogStyle {
  color: string;
  fontWeight?: string;
}

export type LogLevel = "INFO" | "ERROR" | "WARN" | "SUCCESS" | "DEBUG";