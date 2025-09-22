import GithubSlugger from "github-slugger";

export interface TOCItem {
  readonly id: string;
  readonly text: string;
  readonly level: number;
  readonly children: readonly TOCItem[];
}

export function extractHeadings(content: string): readonly TOCItem[] {
  const slugger = new GithubSlugger();
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const matches = Array.from(content.matchAll(headingRegex));

  if (matches.length === 0) {
    return [];
  }

  const headings = matches.map((match) => ({
    id: slugger.slug(match[2].trim()),
    text: match[2].trim(),
    level: match[1].length,
    children: [] as readonly TOCItem[],
  }));

  return buildTOCTree(headings);
}

function buildTOCTree(flatHeadings: readonly TOCItem[]): readonly TOCItem[] {
  if (flatHeadings.length === 0) {
    return [];
  }

  const root: TOCItem[] = [];
  const stack: { item: TOCItem; depth: number }[] = [];

  for (const heading of flatHeadings) {
    const newItem: TOCItem = Object.freeze({
      ...heading,
      children: Object.freeze([]),
    });

    // Remove items from stack that are at the same level or deeper
    while (stack.length > 0 && stack[stack.length - 1].depth >= heading.level) {
      stack.pop();
    }

    // If stack is empty, add to root
    if (stack.length === 0) {
      root.push(newItem);
      stack.push({ item: newItem, depth: heading.level });
      continue;
    }

    // Add as child to the last item in stack
    const parent = stack[stack.length - 1];
    const updatedParent: TOCItem = Object.freeze({
      ...parent.item,
      children: Object.freeze([...parent.item.children, newItem]),
    });

    // Update the parent in the appropriate place
    stack[stack.length - 1] = { item: updatedParent, depth: parent.depth };

    // Update in root if it's a direct child
    const rootIndex = root.findIndex((item) => item.id === parent.item.id);
    if (rootIndex !== -1) {
      root[rootIndex] = updatedParent;
    } else {
      // Update nested parent
      updateNestedParent(root, parent.item.id, updatedParent);
    }

    // Add new item to stack
    stack.push({ item: newItem, depth: heading.level });
  }

  return Object.freeze(root);
}

function updateNestedParent(
  items: TOCItem[],
  targetId: string,
  replacement: TOCItem,
): boolean {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Skip if no children
    if (!item.children || item.children.length === 0) {
      continue;
    }

    // Check if target is a direct child
    const childIndex = item.children.findIndex(
      (child) => child.id === targetId,
    );
    if (childIndex !== -1) {
      items[i] = Object.freeze({
        ...item,
        children: Object.freeze([
          ...item.children.slice(0, childIndex),
          replacement,
          ...item.children.slice(childIndex + 1),
        ]),
      });
      return true;
    }

    // Recursively check children
    const mutableChildren = [...item.children] as TOCItem[];
    if (updateNestedParent(mutableChildren, targetId, replacement)) {
      items[i] = Object.freeze({
        ...item,
        children: Object.freeze(mutableChildren),
      });
      return true;
    }
  }

  return false;
}
