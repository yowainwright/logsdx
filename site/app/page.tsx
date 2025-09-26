"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { ThemeShowcase } from "@/components/theme-showcase";
import { ProblemSection } from "@/components/solutionDemo";
import { SetupSection } from "@/components/setup-section";
import { InteractiveExamplesSection } from "@/components/interactive";
import { Navbar } from "@/components/navbar";
import { CustomThemeCreator } from "@/components/themegenerator";

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
      <Navbar />
      {/* New Theme Showcase with Headline Overlay */}
      <ThemeShowcase
        themes={themes}
        dimOpacity={0.35}
        speed="medium"
        autoPlay={true}
      >
        {/* Headline content positioned over the dimmed animation */}
        <div className="mx-auto max-w-3xl">
          <h1
            className="mb-6 text-8xl md:text-9xl font-bold tracking-tight leading-tight flex items-center justify-center"
            style={{
              filter:
                "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
              lineHeight: "1.2",
            }}
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pr-2">
              logsDx
            </span>
            <span
              className="inline-block animate-pulse"
              style={{
                width: "0.08em",
                height: "0.8em",
                backgroundColor: "#ef4444",
                marginLeft: "0.1em",
              }}
            ></span>
          </h1>
          <p className="mb-8 text-2xl md:text-3xl text-slate-600 dark:text-slate-400">
            Schema-based styling layer that makes logs look identical between
            terminal and browser environments
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#setup"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Get Started
              <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/yowainwright/logsdx"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <FaGithub className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </ThemeShowcase>

      <ProblemSection />
      <SetupSection />
      <InteractiveExamplesSection />

      <section
        id="theme-creator"
        className="bg-slate-50 dark:bg-slate-900 py-24"
      >
        <CustomThemeCreator />
      </section>
    </main>
  );
}
