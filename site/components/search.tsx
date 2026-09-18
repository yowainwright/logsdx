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

function matchesSearchQuery(item: SearchResult, normalizedQuery: string) {
  const titleMatches = item.title.toLowerCase().includes(normalizedQuery);
  const descriptionMatches = item.description
    .toLowerCase()
    .includes(normalizedQuery);
  const sectionMatches = item.section.toLowerCase().includes(normalizedQuery);
  const hasMatch = titleMatches || descriptionMatches || sectionMatches;

  return hasMatch;
}

function getSearchResults(query: string) {
  const normalizedQuery = query.toLowerCase();
  const hasQuery = query.length > 0;

  if (!hasQuery) return [];

  return searchData
    .filter((item) => matchesSearchQuery(item, normalizedQuery))
    .slice(0, 5);
}

function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium min-w-[140px] sm:min-w-[200px]"
    >
      <SearchIcon className="h-4 w-4" />
      <span className="flex-1 text-left hidden sm:inline">Search...</span>
      <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium bg-muted rounded">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}

function NoResults() {
  return (
    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
      <div className="text-lg font-medium mb-2">No results found</div>
      <div className="text-sm">Try searching for something else</div>
    </div>
  );
}

function SearchDocumentIcon() {
  return (
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
  );
}

interface SearchResultItemProps {
  index: number;
  result: SearchResult;
  selectedIndex: number;
  onClick: () => void;
}

function SearchResultItem({
  index,
  result,
  selectedIndex,
  onClick,
}: SearchResultItemProps) {
  const resultClassName = `block px-4 py-3 rounded-lg transition-all ${
    selectedIndex === index
      ? "bg-slate-100 dark:bg-slate-800"
      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
  }`;

  return (
    <a
      href={result.href}
      className={resultClassName}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
          <SearchDocumentIcon />
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
  );
}

function SearchResults({
  results,
  selectedIndex,
  onResultClick,
}: {
  results: SearchResult[];
  selectedIndex: number;
  onResultClick: () => void;
}) {
  return (
    <div className="p-2">
      {results.map((result, index) => (
        <SearchResultItem
          key={`${result.href}-${index}`}
          index={index}
          result={result}
          selectedIndex={selectedIndex}
          onClick={onResultClick}
        />
      ))}
    </div>
  );
}

function QuickLinks({ onClose }: { onClose: () => void }) {
  const links = [
    ["#setup", "Getting Started"],
    ["#theme-creator", "Theme Creator"],
    ["https://github.com/yowainwright/logsdx", "GitHub Repository"],
  ];

  return (
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
        {links.map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="block px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-sm"
            onClick={onClose}
          >
            <div className="flex items-center gap-2">
              <span className="text-slate-700 dark:text-slate-300">
                {label}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function SearchDialogHeader({
  inputRef,
  query,
  onQueryChange,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  return (
    <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-700">
      <SearchIcon className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search documentation..."
        className="flex-1 bg-transparent outline-none text-lg placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100"
      />
      <kbd className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
        ESC
      </kbd>
    </div>
  );
}

function SearchDialogBody({
  onClose,
  onResultClick,
  query,
  results,
  selectedIndex,
}: Pick<
  SearchDialogProps,
  "onClose" | "onResultClick" | "query" | "results" | "selectedIndex"
>) {
  const hasQuery = query.length > 0;
  const hasResults = results.length > 0;

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      {hasQuery && !hasResults && <NoResults />}
      {hasResults && (
        <SearchResults
          results={results}
          selectedIndex={selectedIndex}
          onResultClick={onResultClick}
        />
      )}
      {!hasQuery && <QuickLinks onClose={onClose} />}
    </div>
  );
}

interface SearchDialogProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onQueryChange: (query: string) => void;
  onResultClick: () => void;
  query: string;
  results: SearchResult[];
  searchRef: React.RefObject<HTMLDivElement | null>;
  selectedIndex: number;
}

function SearchDialog({
  inputRef,
  onClose,
  onQueryChange,
  onResultClick,
  query,
  results,
  searchRef,
  selectedIndex,
}: SearchDialogProps) {
  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[101] overflow-y-auto">
        <div className="flex min-h-full items-start justify-center pt-[10vh] p-4">
          <div
            ref={searchRef}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <SearchDialogHeader
              inputRef={inputRef}
              query={query}
              onQueryChange={onQueryChange}
            />
            <SearchDialogBody
              onClose={onClose}
              onResultClick={onResultClick}
              query={query}
              results={results} selectedIndex={selectedIndex}
            />
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

function useSearchFiltering(
  query: string,
  setResults: React.Dispatch<React.SetStateAction<SearchResult[]>>,
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>,
) {
  useEffect(() => {
    setResults(getSearchResults(query));
    setSelectedIndex(0);
  }, [query, setResults, setSelectedIndex]);
}

interface SearchKeyboardOptions {
  inputRef: React.RefObject<HTMLInputElement | null>;
  isOpen: boolean;
  results: SearchResult[];
  selectedIndex: number;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}

function handleSearchNavigation(
  event: KeyboardEvent,
  options: SearchKeyboardOptions,
) {
  const {
    isOpen,
    results,
    selectedIndex,
    setIsOpen,
    setQuery,
    setSelectedIndex,
  } = options;
  const isClosed = !isOpen;
  const hasResults = results.length > 0;
  const shouldIgnoreNavigation = isClosed || !hasResults;
  if (shouldIgnoreNavigation) return;

  const isArrowDown = event.key === "ArrowDown";
  if (isArrowDown) {
    event.preventDefault();
    setSelectedIndex((previous) => (previous + 1) % results.length);
    return;
  }
  const isArrowUp = event.key === "ArrowUp";
  if (isArrowUp) {
    event.preventDefault();
    setSelectedIndex(
      (previous) => (previous - 1 + results.length) % results.length,
    );
    return;
  }
  if (event.key !== "Enter") return;
  const selectedResult = results[selectedIndex];
  if (!selectedResult) return;
  event.preventDefault();
  window.location.href = selectedResult.href;
  setIsOpen(false);
  setQuery("");
}

function handleSearchKeyDown(
  event: KeyboardEvent,
  options: SearchKeyboardOptions,
) {
  const { inputRef, setIsOpen, setQuery } = options;
  const isSearchShortcut =
    (event.metaKey || event.ctrlKey) && event.key === "k";

  if (isSearchShortcut) {
    event.preventDefault();
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
    return;
  }
  if (event.key === "Escape") {
    setIsOpen(false);
    setQuery("");
    return;
  }
  handleSearchNavigation(event, options);
}

function useSearchKeyboard({
  inputRef,
  isOpen,
  results,
  selectedIndex,
  setIsOpen,
  setQuery,
  setSelectedIndex,
}: SearchKeyboardOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) =>
      handleSearchKeyDown(event, {
        inputRef,
        isOpen,
        results,
        selectedIndex,
        setIsOpen,
        setQuery,
        setSelectedIndex,
      });

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    inputRef,
    isOpen,
    results,
    selectedIndex,
    setIsOpen,
    setQuery,
    setSelectedIndex,
  ]);
}

function useSearchOutside(
  isOpen: boolean,
  searchRef: React.RefObject<HTMLDivElement | null>,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutside = !searchRef.current?.contains(target);
      if (isOutside) setIsOpen(false);
    };

    if (!isOpen) return;

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, searchRef, setIsOpen]);
}

function useSearchController() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useSearchFiltering(query, setResults, setSelectedIndex);
  useSearchKeyboard({
    inputRef,
    isOpen,
    results,
    selectedIndex,
    setIsOpen,
    setQuery,
    setSelectedIndex,
  });
  useSearchOutside(isOpen, searchRef, setIsOpen);

  return {
    inputRef,
    isOpen,
    query,
    results,
    searchRef,
    selectedIndex,
    setIsOpen,
    setQuery,
  };
}

export function Search() {
  const controller = useSearchController();
  const {
    inputRef,
    isOpen,
    query,
    results,
    searchRef,
    selectedIndex,
    setIsOpen,
    setQuery,
  } = controller;
  const openSearch = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  const closeSearch = () => {
    setIsOpen(false);
    setQuery("");
  };
  const canRenderPortal = isOpen && typeof document !== "undefined";

  return (
    <>
      <SearchTrigger onOpen={openSearch} />

      {canRenderPortal && (
        <SearchDialog
          inputRef={inputRef}
          onClose={closeSearch}
          onQueryChange={setQuery}
          onResultClick={closeSearch}
          query={query}
          results={results}
          searchRef={searchRef}
          selectedIndex={selectedIndex}
        />
      )}
    </>
  );
}
