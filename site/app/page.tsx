"use client";

import { useState, useEffect } from "react";
import { ThemeShowcase } from "@/components/theme-showcase";
import { ProblemSection } from "@/components/problem-section";
import { SetupSection } from "@/components/setup-section";
import { ExamplesSection } from "@/components/examples-section";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Get all available themes dynamically from logsDx
  const themes = [
    "oh-my-zsh",
    "dracula",
    "github-light",
    "github-dark",
    "solarized-light",
    "solarized-dark",
    "nord",
    "monokai",
  ];

  return (
    <main className="min-h-screen">
      {/* New Theme Showcase with Headline Overlay */}
      <ThemeShowcase
        themes={themes}
        dimOpacity={0.35}
        speed="medium"
        autoPlay={true}
      >
        {/* Headline content positioned over the dimmed animation */}
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              logsDx
            </span>
          </h1>
          <p className="mb-8 text-xl text-slate-600 dark:text-slate-400">
            Schema-based styling layer that makes logs look identical between
            terminal and browser environments
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#setup"
              className="rounded-lg bg-slate-900 px-6 py-3 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Get Started
            </a>
            <a
              href="https://github.com/yowainwright/logsdx"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </ThemeShowcase>

      <ProblemSection />
      <SetupSection />
      <ExamplesSection />
    </main>
  );
}
