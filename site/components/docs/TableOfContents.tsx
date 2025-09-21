'use client'

import { cn } from '@/lib/utils'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import type { TOCItem } from '@/lib/toc'

interface TableOfContentsProps {
  readonly items: readonly TOCItem[]
  readonly className?: string
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  // Extract all heading IDs for scroll spy
  const headingIds = extractAllIds(items)
  const activeId = useScrollSpy(headingIds)
  
  if (items.length === 0) {
    return null
  }
  
  return (
    <nav
      aria-label="Table of contents"
      className={cn(
        'hidden xl:block xl:sticky xl:top-28 xl:h-[calc(100vh-7rem)] xl:overflow-y-auto',
        className
      )}
    >
      <h2 className="mb-4 text-sm font-semibold">On this page</h2>
      <ul className="space-y-2 text-sm">
        {items.map(item => (
          <TOCListItem
            key={item.id}
            item={item}
            activeId={activeId}
          />
        ))}
      </ul>
    </nav>
  )
}

interface TOCListItemProps {
  readonly item: TOCItem
  readonly activeId: string | null
  readonly depth?: number
}

function TOCListItem({ item, activeId, depth = 0 }: TOCListItemProps) {
  const isActive = activeId === item.id
  const hasChildren = item.children && item.children.length > 0
  
  return (
    <li>
      <a
        href={`#${item.id}`}
        className={cn(
          'block py-1 transition-colors hover:text-foreground',
          depth > 0 && 'pl-4',
          isActive
            ? 'font-medium text-foreground'
            : 'text-muted-foreground'
        )}
        aria-current={isActive ? 'location' : undefined}
      >
        {item.text}
      </a>
      {hasChildren && (
        <ul className="mt-1 space-y-1">
          {item.children.map(child => (
            <TOCListItem
              key={child.id}
              item={child}
              activeId={activeId}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function extractAllIds(items: readonly TOCItem[]): readonly string[] {
  const ids: string[] = []
  
  function traverse(items: readonly TOCItem[]) {
    for (const item of items) {
      ids.push(item.id)
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    }
  }
  
  traverse(items)
  return Object.freeze(ids)
}