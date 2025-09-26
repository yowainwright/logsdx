"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search as SearchIcon } from "lucide-react";

interface SearchResult {
  title: string;
  description: string;
  href: string;
  section: string;
}

const searchData: SearchResult[] = [
  {
    title: "Getting Started",
    description: "Quick setup guide for logsDx",
    href: "#setup",
    section: "Documentation",
  },
  {
    title: "Installation",
    description: "Install logsDx via npm, yarn, or pnpm",
    href: "#setup",
    section: "Setup",
  },
  {
    title: "Themes",
    description: "Available themes and customization",
    href: "#themes",
    section: "Features",
  },
  {
    title: "Custom Theme Creator",
    description: "Create your own custom theme",
    href: "#theme-creator",
    section: "Tools",
  },
  {
    title: "Winston Integration",
    description: "Using logsDx with Winston logger",
    href: "#examples",
    section: "Examples",
  },
  {
    title: "Pino Integration",
    description: "Using logsDx with Pino logger",
    href: "#examples",
    section: "Examples",
  },
  {
    title: "Console.log Override",
    description: "Override console.log with styled output",
    href: "#examples",
    section: "Examples",
  },
  {
    title: "Browser Support",
    description: "HTML output for browser environments",
    href: "#examples",
    section: "Features",
  },
];

export function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simple search implementation
  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchData.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.section.toLowerCase().includes(query.toLowerCase()),
      );
      setResults(filtered.slice(0, 5));
    } else {
      setResults([]);
    }
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
      if (isOpen && e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
      if (isOpen && e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + results.length) % results.length,
        );
      }
      if (isOpen && e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        window.location.href = results[selectedIndex].href;
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium min-w-[140px] sm:min-w-[200px]"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="flex-1 text-left hidden sm:inline">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium bg-muted rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <div className="fixed inset-0 z-[101] overflow-y-auto">
              <div className="flex min-h-full items-start justify-center pt-[10vh] p-4">
                <div
                  ref={searchRef}
                  className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <SearchIcon className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search documentation..."
                      className="flex-1 bg-transparent outline-none text-lg placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100"
                    />
                    <kbd className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                      ESC
                    </kbd>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto">
                    {query.length > 0 && results.length === 0 && (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <div className="text-lg font-medium mb-2">
                          No results found
                        </div>
                        <div className="text-sm">
                          Try searching for something else
                        </div>
                      </div>
                    )}

                    {results.length > 0 && (
                      <div className="p-2">
                        {results.map((result, index) => (
                          <a
                            key={`${result.href}-${index}`}
                            href={result.href}
                            className={`block px-4 py-3 rounded-lg transition-all ${
                              selectedIndex === index
                                ? "bg-slate-100 dark:bg-slate-800"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            }`}
                            onClick={() => {
                              setIsOpen(false);
                              setQuery("");
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                  {result.title}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                  {result.section} • {result.description}
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {query.length === 0 && (
                      <div className="p-8">
                        <div className="text-center mb-6">
                          <div className="text-slate-500 dark:text-slate-400 text-sm">
                            Start typing to search
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4">
                            Quick Links
                          </div>
                          <a
                            href="#setup"
                            className="block px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-slate-700 dark:text-slate-300">
                                Getting Started
                              </span>
                            </div>
                          </a>
                          <a
                            href="#theme-creator"
                            className="block px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-slate-700 dark:text-slate-300">
                                Theme Creator
                              </span>
                            </div>
                          </a>
                          <a
                            href="https://github.com/yowainwright/logsdx"
                            className="block px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-slate-700 dark:text-slate-300">
                                GitHub Repository
                              </span>
                            </div>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
