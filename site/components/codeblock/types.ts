export interface CodeBlockProps {
  children: string;
  theme?: string;
  className?: string;
  language?: string;
  showLineNumbers?: boolean;
}

export interface InlineCodeProps {
  children: string;
  theme?: string;
  className?: string;
}
