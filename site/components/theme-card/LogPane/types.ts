export interface LogPaneProps {
  title: string;
  logs: string[];
  backgroundColor: string;
  mode: "light" | "dark";
  isLoading?: boolean;
}
