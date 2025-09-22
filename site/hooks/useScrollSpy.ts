"use client";

import { useEffect, useRef, useState } from "react";

interface UseScrollSpyOptions {
  readonly offset?: number;
  readonly rootMargin?: string;
}

export function useScrollSpy(
  ids: readonly string[],
  options: UseScrollSpyOptions = {},
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { offset = 100, rootMargin = "0px 0px -80% 0px" } = options;

  useEffect(() => {
    // Early return if no IDs
    if (ids.length === 0) {
      return;
    }

    // Early return if IntersectionObserver not supported
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const visibleHeadings = new Map<string, boolean>();

    const updateActiveId = () => {
      const visibleIds = Array.from(visibleHeadings.entries())
        .filter(([_, isVisible]) => isVisible)
        .map(([id]) => id);

      if (visibleIds.length === 0) {
        setActiveId(null);
        return;
      }

      // Find the first visible heading
      const firstVisibleId = ids.find((id) => visibleIds.includes(id));
      if (firstVisibleId) {
        setActiveId(firstVisibleId);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleHeadings.set(entry.target.id, entry.isIntersecting);
        });
        updateActiveId();
      },
      { rootMargin },
    );

    observerRef.current = observer;

    // Observe all heading elements
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      return;
    }

    elements.forEach((element) => observer.observe(element));

    // Handle scroll to set initial active heading
    const handleScroll = () => {
      if (window.scrollY < offset) {
        const firstId = ids[0];
        if (firstId) {
          setActiveId(firstId);
        }
        return;
      }

      const currentScrollY = window.scrollY + offset;

      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;

        const { top } = element.getBoundingClientRect();
        const absoluteTop = top + window.scrollY;

        if (absoluteTop <= currentScrollY) {
          setActiveId(id);
        }
      }
    };

    // Set initial active heading
    handleScroll();

    // Add scroll listener for fallback
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [ids, offset, rootMargin]);

  return activeId;
}
