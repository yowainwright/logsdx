import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import rehypeShiki from '@shikijs/rehype'
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerNotationFocus,
  transformerNotationErrorLevel,
} from '@shikijs/transformers'

const contentDirectory = path.join(process.cwd(), 'content', 'docs')

export interface DocMeta {
  title: string
  description?: string
  category?: string
  order?: number
  slug: string
  readingTime?: string
  date?: string
  author?: string
}

export function getDocsPaths(): string[] {
  const paths: string[] = []
  
  function traverseDirectory(currentPath: string, slugParts: string[] = []) {
    if (!fs.existsSync(currentPath)) return
    
    const items = fs.readdirSync(currentPath)
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        traverseDirectory(itemPath, [...slugParts, item])
      } else if (item.endsWith('.mdx') || item.endsWith('.md')) {
        const slug = [...slugParts, item.replace(/\.(mdx|md)$/, '')].join('/')
        paths.push(slug)
      }
    }
  }
  
  traverseDirectory(contentDirectory)
  return paths
}

export function getDocBySlug(slug: string[]): DocMeta | null {
  try {
    let fullPath = path.join(contentDirectory, ...slug) + '.mdx'
    
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(contentDirectory, ...slug) + '.md'
    }
    
    if (!fs.existsSync(fullPath)) {
      return null
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    const stats = readingTime(content)
    
    return {
      slug: slug.join('/'),
      title: data.title || slug[slug.length - 1].replace(/-/g, ' '),
      description: data.description,
      category: data.category,
      order: data.order || 0,
      readingTime: stats.text,
      date: data.date,
      author: data.author,
    }
  } catch (error) {
    console.error('Error reading doc:', error)
    return null
  }
}

export function getAllDocsMeta(): DocMeta[] {
  const paths = getDocsPaths()
  const docs: DocMeta[] = []
  
  for (const path of paths) {
    const doc = getDocBySlug(path.split('/'))
    if (doc) {
      docs.push(doc)
    }
  }
  
  return docs.sort((a, b) => (a.order || 0) - (b.order || 0))
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      properties: {
        className: ['anchor'],
        ariaLabel: 'Link to section',
      },
    })
    .use(rehypeShiki, {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationFocus(),
        transformerNotationErrorLevel(),
      ],
    })
    .use(rehypeStringify)
    .process(markdown)
  
  return String(result)
}