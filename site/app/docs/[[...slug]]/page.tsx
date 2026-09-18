import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  getDocBySlug,
  getAllDocsMeta,
  markdownToHtml,
  type DocMeta,
} from "@/lib/mdx";
import { extractHeadings } from "@/lib/toc";
import { TableOfContents } from "@/components/docs/TableOfContents";

interface DocPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export async function generateStaticParams() {
  const docs = getAllDocsMeta();
  const paths = docs.map((doc) => {
    const slug = doc.slug === "index" ? [] : doc.slug.split("/");
    return { slug };
  });

  paths.push({ slug: [] });

  return paths;
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug: slugParam } = await params;
  const slug = slugParam?.length ? slugParam : ["index"];
  const doc = getDocBySlug(slug);

  if (!doc) {
    return {};
  }

  return {
    title: `${doc.title} - LogsDX`,
    description: doc.description,
  };
}

async function getDocContent(slug: string[]) {
  const contentDirectory = path.join(process.cwd(), "content", "docs");
  let fullPath = path.join(contentDirectory, ...slug) + ".mdx";

  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(contentDirectory, ...slug) + ".md";
  }

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const htmlContent = await markdownToHtml(content);

  return {
    frontmatter: data,
    content,
    html: htmlContent,
  };
}

type DocContent = NonNullable<Awaited<ReturnType<typeof getDocContent>>>;

function DocHeader({ meta }: { meta: DocMeta }) {
  return (
    <header className="mb-8 not-prose">
      <h1 className="text-4xl font-bold tracking-tight">{meta.title}</h1>
      {meta.description && (
        <p className="mt-4 text-lg text-muted-foreground">
          {meta.description}
        </p>
      )}
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        {meta.readingTime && <span>{meta.readingTime}</span>}
        {meta.date && (
          <>
            <span>•</span>
            <time dateTime={meta.date}>
              {new Date(meta.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </>
        )}
        {meta.author && (
          <>
            <span>•</span>
            <span>{meta.author}</span>
          </>
        )}
      </div>
    </header>
  );
}

function DocArticle({
  doc,
  meta,
}: {
  doc: DocContent;
  meta: DocMeta;
}) {
  return (
    <article className="min-w-0 flex-1">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <DocHeader meta={meta} />
        <div dangerouslySetInnerHTML={{ __html: doc.html }} />
      </div>
    </article>
  );
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug: slugParam } = await params;
  const slug = slugParam?.length ? slugParam : ["index"];
  const meta = getDocBySlug(slug);

  if (!meta) {
    notFound();
  }

  const doc = await getDocContent(slug);

  if (!doc) {
    notFound();
  }

  const headings = extractHeadings(doc.content);

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <DocArticle doc={doc} meta={meta} />
      {headings.length > 0 && <TableOfContents items={headings} />}
    </div>
  );
}
