"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { docsNavigation, type NavItem } from "@/content/navigation";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  readonly className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-full md:w-64 lg:w-72 shrink-0",
        "sticky top-16 h-[calc(100vh-4rem)]",
        "overflow-y-auto overflow-x-hidden",
        "border-r border-border/40",
        className,
      )}
      aria-label="Documentation sidebar"
    >
      <nav className="p-4 pb-8">
        {docsNavigation.map((section, index) => (
          <SidebarSection
            key={section.title}
            section={section}
            pathname={pathname}
            defaultOpen={index === 0}
          />
        ))}
      </nav>
    </aside>
  );
}

interface SidebarSectionProps {
  readonly section: NavItem;
  readonly pathname: string;
  readonly defaultOpen?: boolean;
}

function SidebarSection({
  section,
  pathname,
  defaultOpen = true,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasItems = section.items && section.items.length > 0;

  if (!hasItems) {
    return null;
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-foreground/80"
        aria-expanded={isOpen}
      >
        {section.title}
        <ChevronRight
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")}
        />
      </button>
      {isOpen && section.items && (
        <ul className="mt-2 space-y-1">
          {section.items.map((item) => (
            <SidebarItem
              key={item.href || item.title}
              item={item}
              pathname={pathname}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface SidebarItemProps {
  readonly item: NavItem;
  readonly pathname: string;
  readonly depth?: number;
}

function SidebarItemContent({
  item,
  pathname,
  depth,
}: SidebarItemProps) {
  const isActive = item.href === pathname;

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          "block rounded-md px-3 py-2 text-sm transition-colors",
          "hover:bg-muted hover:text-foreground",
          depth && "ml-4",
          isActive
            ? "bg-muted font-medium text-foreground"
            : "text-muted-foreground",
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <SidebarItemLabel item={item} />
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "px-3 py-2 text-sm font-medium text-foreground",
        depth && "ml-4",
      )}
    >
      {item.title}
    </div>
  );
}

function SidebarItemLabel({ item }: { item: NavItem }) {
  return (
    <span className="flex items-center justify-between">
      {item.title}
      {item.badge && (
        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {item.badge}
        </span>
      )}
    </span>
  );
}

function SidebarChildren({ item, pathname, depth }: SidebarItemProps) {
  const children = item.items ?? [];
  if (children.length === 0) return null;

  return (
    <ul className="mt-1 space-y-1">
      {children.map((child) => (
        <SidebarItem
          key={child.href || child.title}
          item={child}
          pathname={pathname}
          depth={depth + 1}
        />
      ))}
    </ul>
  );
}

function SidebarItem({ item, pathname, depth = 0 }: SidebarItemProps) {
  const hasChildren = Boolean(item.items?.length);
  const isEmptyItem = !item.href && !hasChildren;

  if (isEmptyItem) return null;

  return (
    <li>
      <SidebarItemContent item={item} pathname={pathname} depth={depth} />
      <SidebarChildren item={item} pathname={pathname} depth={depth} />
    </li>
  );
}
