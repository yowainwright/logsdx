import Link from "next/link";
import { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "./CopyButton";
import { CodeBlock } from "./CodeBlock";

interface HeadingProps extends ComponentProps<"h1"> {
  id?: string;
  children: ReactNode;
}

interface CodeProps extends ComponentProps<"code"> {
  className?: string;
}

interface PreProps extends ComponentProps<"pre"> {
  children: ReactNode;
}

interface LinkProps extends ComponentProps<"a"> {
  href?: string;
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Component = ({ children, id, className, ...props }: HeadingProps) => {
    const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

    return (
      <Tag id={id} {...props} className={cn("scroll-mt-20 group", className)}>
        {children}
        {id && (
          <a
            href={`#${id}`}
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Link to section"
          >
            #
          </a>
        )}
      </Tag>
    );
  };

  Component.displayName = `Heading${level}`;
  return Component;
}

interface CalloutProps {
  readonly type?: "note" | "warning" | "info" | "tip";
  readonly title?: string;
  readonly children: ReactNode;
}

function Callout({ type = "note", title, children }: CalloutProps) {
  const variants = {
    note: "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
    warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
    info: "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20",
    tip: "border-green-500 bg-green-50 dark:bg-green-950/20",
  };

  return (
    <Alert className={cn("my-4", variants[type])}>
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

function CustomLink({ href, children, ...props }: LinkProps) {
  if (href?.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  if (href?.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

function Pre({ children, className, ...props }: PreProps) {
  const codeContent = extractCodeContent(children);

  return (
    <div className="relative group">
      <pre
        {...props}
        className={cn("overflow-x-auto p-4 rounded-lg", className)}
      >
        {children}
      </pre>
      {codeContent && (
        <CopyButton
          text={codeContent}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      )}
    </div>
  );
}

function extractCodeContent(children: ReactNode): string | null {
  if (typeof children === "string") {
    return children;
  }

  if (!children || typeof children !== "object") {
    return null;
  }

  if ("props" in children) {
    const element = children as React.ReactElement<{ children?: ReactNode }>;
    if (element.props?.children) {
      return extractCodeContent(element.props.children);
    }
  }

  if (Array.isArray(children)) {
    return children.map((child) => extractCodeContent(child) || "").join("");
  }

  return null;
}

function Code({ className, children, ...props }: CodeProps) {
  const isInline = !className;
  return (
    <code
      className={cn(
        isInline && "px-1.5 py-0.5 rounded bg-muted font-mono text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}

export const mdxComponents = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),

  a: CustomLink,

  pre: Pre,
  code: Code,

  Callout,
  CodeBlock,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,

  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-4 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="my-4 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),

  table: (props: ComponentProps<"table">) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full" {...props} />
    </div>
  ),
  th: (props: ComponentProps<"th">) => (
    <th
      className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  td: (props: ComponentProps<"td">) => (
    <td
      className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),

  hr: (props: ComponentProps<"hr">) => (
    <hr className="my-8 border-t" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="my-4 border-l-4 border-muted-foreground/20 pl-4 italic"
      {...props}
    />
  ),
};
