"use client";

import React, { useState } from "react";
import { SCHEMA_SECTIONS, MATCHING_PRIORITY, EXAMPLE_THEME } from "./constants";

export function SchemaVisualization() {
  const [activeSection, setActiveSection] = useState(0);
  const section = SCHEMA_SECTIONS[activeSection];

  return (
    <section id="schema" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-5xl lg:text-6xl font-bold">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Theme
            </span>{" "}
            Schema
          </h2>
          <p className="mb-12 text-center text-xl text-slate-600 dark:text-slate-400">
            Understand how themes work under the hood
          </p>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <div className="flex gap-2 mb-6 flex-wrap">
                {SCHEMA_SECTIONS.map((s, i) => (
                  <button
                    key={s.title}
                    onClick={() => setActiveSection(i)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === i
                        ? "bg-purple-500 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-2 text-purple-600 dark:text-purple-400">
                  {section.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {section.description}
                </p>

                <div className="space-y-4">
                  {section.properties.map((prop) => (
                    <div
                      key={prop.name}
                      className="border-l-2 border-purple-500/30 pl-4"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-purple-600 dark:text-purple-400 font-semibold">
                          {prop.name}
                        </code>
                        {prop.required && (
                          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">
                            required
                          </span>
                        )}
                        <code className="text-xs text-slate-500 dark:text-slate-400">
                          {prop.type}
                        </code>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {prop.description}
                      </p>
                      {prop.example && (
                        <code className="text-xs text-slate-500 dark:text-slate-500 mt-1 block">
                          {prop.example}
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold mb-4 text-slate-900 dark:text-white">
                  Matching Priority
                </h4>
                <div className="space-y-2">
                  {MATCHING_PRIORITY.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <code className="text-sm text-purple-600 dark:text-purple-400">
                        {item.name}
                      </code>
                      <span className="text-xs text-slate-500">
                        {item.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-slate-900 dark:text-white">
                Example Theme
              </h4>
              <div className="rounded-lg overflow-hidden border border-slate-700">
                <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-white/60 ml-2">
                    my-theme.json
                  </span>
                </div>
                <pre className="p-4 bg-slate-900 text-sm overflow-auto max-h-[600px]">
                  <code className="text-slate-300">{EXAMPLE_THEME}</code>
                </pre>
              </div>

              <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/20">
                <h4 className="font-semibold mb-3 text-purple-600 dark:text-purple-400">
                  How Matching Works
                </h4>
                <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex gap-2">
                    <span className="text-purple-500">1.</span>
                    Log line is tokenized into individual words and symbols
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-500">2.</span>
                    Each token is checked against matching rules in priority order
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-500">3.</span>
                    First matching rule determines the token&apos;s style
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-500">4.</span>
                    Unmatched tokens use defaultStyle
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-500">5.</span>
                    Styled tokens are rendered as ANSI or HTML
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export type { SchemaSection, SchemaProperty } from "./types";
