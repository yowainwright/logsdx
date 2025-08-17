import React from "react";

export function ProblemSection() {
  return (
    <section id="problem" className="bg-slate-50 dark:bg-slate-900 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-8 text-4xl font-bold">The Problem logsDx Solves</h2>
          <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400">
            <p>
              Have you ever built a beautiful logging system for your terminal,
              only to have it look completely different in the browser console?
            </p>
            <p>
              Traditional logging libraries force you to choose between
              terminal-specific ANSI codes or browser-specific CSS styling. This
              leads to:
            </p>
            <ul className="mx-auto max-w-xl space-y-3 text-left">
              <li className="flex items-start">
                <span className="mr-2 text-red-500">×</span>
                <span>Inconsistent log appearance across environments</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-500">×</span>
                <span>Duplicate styling code for different outputs</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-500">×</span>
                <span>
                  Lost context when switching between terminal and browser logs
                </span>
              </li>
            </ul>
            <p className="mt-8 font-semibold">
              logsDx provides a unified theming engine that automatically
              translates your styling between ANSI and HTML/CSS formats.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
