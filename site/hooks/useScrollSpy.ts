"use client";

import { useEffect, useRef, useState } from "react";

interface UseScrollSpyOptions {
  readonly offset?: number;
  readonly rootMargin?: string;
}

type SetActiveId = (value: string | null) => void;

function updateActiveId(
  ids: readonly string[],
  visibleHeadings: Map<string, boolean>,
  setActiveId: SetActiveId,
): void {
  const visibleIds = Array.from(visibleHeadings.entries())
    .filter(([, isVisible]) => isVisible)
    .map(([id]) => id);

  if (visibleIds.length === 0) {
    setActiveId(null);
    return;
  }

  const firstVisibleId = ids.find((id) => visibleIds.includes(id));
  if (firstVisibleId) setActiveId(firstVisibleId);
}

function getHeadingElements(ids: readonly string[]): HTMLElement[] {
  return ids
    .map((id) => document.getElementById(id))
    .filter((element): element is HTMLElement => element !== null);
}

function createScrollHandler(
  ids: readonly string[],
  offset: number,
  setActiveId: SetActiveId,
): () => void {
  return () => {
    if (window.scrollY < offset) {
      const firstId = ids[0];
      if (firstId) setActiveId(firstId);
      return;
    }

    const currentScrollY = window.scrollY + offset;
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const { top } = element.getBoundingClientRect();
      const absoluteTop = top + window.scrollY;
      if (absoluteTop <= currentScrollY) setActiveId(id);
    });
  };
}

interface ScrollSpySetupOptions {
  ids: readonly string[];
  offset: number;
  rootMargin: string;
  observerRef: { current: IntersectionObserver | null };
  setActiveId: SetActiveId;
}

function setupScrollSpy({
  ids,
  offset,
  rootMargin,
  observerRef,
  setActiveId,
}: ScrollSpySetupOptions): (() => void) | undefined {
  if (ids.length === 0) return undefined;
  if (typeof IntersectionObserver === "undefined") return undefined;

  observerRef.current?.disconnect();
  const visibleHeadings = new Map<string, boolean>();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visibleHeadings.set(entry.target.id, entry.isIntersecting);
      });
      updateActiveId(ids, visibleHeadings, setActiveId);
    },
    { rootMargin },
  );
  observerRef.current = observer;

  const elements = getHeadingElements(ids);
  if (elements.length === 0) return undefined;
  elements.forEach((element) => observer.observe(element));

  const handleScroll = createScrollHandler(ids, offset, setActiveId);
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    observer.disconnect();
    observerRef.current = null;
    window.removeEventListener("scroll", handleScroll);
  };
}

export function useScrollSpy(
  ids: readonly string[],
  options: UseScrollSpyOptions = {},
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { offset = 100, rootMargin = "0px 0px -80% 0px" } = options;

  useEffect(
    () =>
      setupScrollSpy({
        ids,
        offset,
        rootMargin,
        observerRef,
        setActiveId,
      }),
    [ids, offset, rootMargin],
  );

  return activeId;
}
