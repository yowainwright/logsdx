import { CopyButton } from "./CopyButton";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  children,
  language,
  className,
  showLineNumbers = false,
}: CodeBlockProps) {
  return (
    <div className="relative group">
      <pre
        className={cn(
          "overflow-x-auto p-4 rounded-lg bg-zinc-900 dark:bg-zinc-950 text-sm",
          className
        )}
      >
        <code
          className={cn(
            language && `language-${language}`,
            "text-zinc-100"
          )}
        >
          {children}
        </code>
      </pre>
      <CopyButton
        text={children}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
}