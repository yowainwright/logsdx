"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import type { DemoLog } from "./types";

// Sample log for the live demo
const DEMO_LOGS: DemoLog[] = [
  { text: "[INFO] Server starting...", highlight: false },
  { text: "[ERROR] Database connection failed", highlight: true },
  { text: "[WARN] Memory usage high: 85%", highlight: false },
  { text: "[SUCCESS] API initialized", highlight: false },
  { text: "[DEBUG] Request payload: {user: 'john'}", highlight: false },
];

// Simulated theme styles for demonstration
const WITHOUT_LOGSDX = `// Without logsDx - Inconsistent styling
console.log('\\x1b[32m[INFO]\\x1b[0m Server starting...');     // Terminal only
console.log('%c[ERROR]', 'color: red', 'Database failed');     // Browser only
console.log('[WARN] Memory usage high: 85%');                  // No styling`;

const WITH_LOGSDX = `// With logsDx - Consistent everywhere
import { getLogsDX } from 'logsdx';
const logger = getLogsDX('github-dark');

logger.log('[INFO] Server starting...');      // Styled in both
logger.log('[ERROR] Database connection failed'); // Styled in both
logger.log('[WARN] Memory usage high: 85%');     // Styled in both`;

export function ProblemSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showWithLogsDx, setShowWithLogsDx] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Cycle through logs for spotlight effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DEMO_LOGS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Toggle between with/without logsDx every 3 seconds (pause on hover)
  useEffect(() => {
    if (isHovered) return; // Don't run interval when hovered

    const interval = setInterval(() => {
      setShowWithLogsDx((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section id="problem" className="bg-slate-50 dark:bg-slate-900 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left side - Problem description */}
            <div>
              <h2 className="mb-8 text-5xl lg:text-6xl font-bold">
                The Problem
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  logsDx
                </span>{" "}
                Solves
              </h2>
              <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400">
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Have you ever built a beautiful logging system for your
                  terminal, only to have it look completely different in the
                  browser console?
                </p>
                <p>
                  Traditional logging libraries force you to choose between
                  terminal-specific ANSI codes or browser-specific CSS styling:
                </p>
                <ul className="space-y-3">
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
                      Lost context when switching between terminal and browser
                    </span>
                  </li>
                </ul>
                <div className="pt-6 border-t">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    logsDx provides a unified theming engine that automatically
                    translates your styling between ANSI and HTML/CSS formats.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Live code example with spotlight */}
            <div className="relative lg:sticky lg:top-24">
              {/* Floating badge - top right corner */}
              <div className="absolute -top-2 right-4 z-10 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full shadow-lg pointer-events-none">
                {showWithLogsDx ? "✨ With logsDx" : "❌ Without logsDx"}
              </div>

              <Card
                className="overflow-hidden bg-slate-900 border-slate-700 cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={() => setShowWithLogsDx((prev) => !prev)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Header */}
                <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>

                {/* Code editor section */}
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                    .problem-scrollbar::-webkit-scrollbar {
                      width: 6px;
                      height: 6px;
                    }
                    .problem-scrollbar::-webkit-scrollbar-track {
                      background: transparent;
                    }
                    .problem-scrollbar::-webkit-scrollbar-thumb {
                      background: #475569;
                      border-radius: 3px;
                    }
                    .problem-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: #64748b;
                    }
                  `,
                  }}
                />
                <div
                  className="p-4 font-mono text-sm overflow-auto problem-scrollbar"
                  style={{ height: "180px" }}
                >
                  <pre className="text-slate-300">
                    <code>{showWithLogsDx ? WITH_LOGSDX : WITHOUT_LOGSDX}</code>
                  </pre>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700"></div>

                {/* Output section with Terminal and Browser panes */}
                <div className="grid grid-cols-2 divide-x divide-slate-700">
                  {/* Terminal Pane */}
                  <div className="p-4 flex flex-col">
                    <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-slate-700"></div>
                      Terminal
                    </div>
                    <div
                      className="space-y-1 font-mono text-sm overflow-auto problem-scrollbar"
                      style={{ height: "200px" }}
                    >
                      {DEMO_LOGS.map((log, index) => (
                        <div
                          key={`terminal-${index}`}
                          className={`
                            px-2 py-1 rounded transition-all duration-500
                            ${
                              index === activeIndex
                                ? "bg-slate-800/50 ring-1 ring-blue-500/30"
                                : ""
                            }
                          `}
                        >
                          {showWithLogsDx ? (
                            <span
                              style={{
                                color: log.text.includes("[ERROR]")
                                  ? "#f85149"
                                  : log.text.includes("[WARN]")
                                    ? "#f0883e"
                                    : log.text.includes("[SUCCESS]")
                                      ? "#3fb950"
                                      : log.text.includes("[INFO]")
                                        ? "#58a6ff"
                                        : log.text.includes("[DEBUG]")
                                          ? "#a5a5ff"
                                          : "#e6edf3",
                                fontWeight: log.text.includes("[ERROR]")
                                  ? "bold"
                                  : "normal",
                              }}
                            >
                              {log.text}
                            </span>
                          ) : (
                            <span className="text-slate-400">{log.text}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Browser Pane */}
                  <div className="p-4 flex flex-col">
                    <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                      Browser Console
                    </div>
                    <div
                      className="space-y-1 font-mono text-sm overflow-auto problem-scrollbar"
                      style={{ height: "200px" }}
                    >
                      {DEMO_LOGS.map((log, index) => (
                        <div
                          key={`browser-${index}`}
                          className={`
                            px-2 py-1 rounded transition-all duration-500
                            ${
                              index === activeIndex
                                ? "bg-slate-800/50 ring-1 ring-blue-500/30"
                                : ""
                            }
                          `}
                        >
                          {showWithLogsDx ? (
                            <span
                              style={{
                                color: log.text.includes("[ERROR]")
                                  ? "#f85149"
                                  : log.text.includes("[WARN]")
                                    ? "#f0883e"
                                    : log.text.includes("[SUCCESS]")
                                      ? "#3fb950"
                                      : log.text.includes("[INFO]")
                                        ? "#58a6ff"
                                        : log.text.includes("[DEBUG]")
                                          ? "#a5a5ff"
                                          : "#e6edf3",
                                fontWeight: log.text.includes("[ERROR]")
                                  ? "bold"
                                  : "normal",
                              }}
                            >
                              {log.text}
                            </span>
                          ) : (
                            <span className="text-slate-400">{log.text}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className="px-4 pb-3 pt-2 border-t border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-2 h-2 rounded-full transition-colors ${
                          showWithLogsDx ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="text-slate-500">
                        Terminal: {showWithLogsDx ? "Styled" : "Plain"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-2 h-2 rounded-full transition-colors ${
                          showWithLogsDx ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="text-slate-500">
                        Browser: {showWithLogsDx ? "Styled" : "Plain"}
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-600">
                    {showWithLogsDx ? "logsDx enabled" : "Standard console"}
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
