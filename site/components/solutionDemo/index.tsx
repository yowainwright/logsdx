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

  // Cycle through logs for spotlight effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DEMO_LOGS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Toggle between with/without logsDx every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowWithLogsDx((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="problem" className="bg-slate-50 dark:bg-slate-900 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left side - Problem description */}
            <div>
              <h2 className="mb-8 text-4xl font-bold">
                The Problem logsDx Solves
              </h2>
              <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400">
                <p>
                  Have you ever built a beautiful logging system for your terminal,
                  only to have it look completely different in the browser console?
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
            <div className="relative">
              <Card className="overflow-hidden bg-slate-900 border-slate-700">
                {/* Header */}
                <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {showWithLogsDx ? "✨ With logsDx" : "❌ Without logsDx"}
                  </div>
                </div>

                {/* Code editor section */}
                <div className="p-4 font-mono text-sm">
                  <pre className="text-slate-300 overflow-x-auto">
                    <code>{showWithLogsDx ? WITH_LOGSDX : WITHOUT_LOGSDX}</code>
                  </pre>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700"></div>

                {/* Output section with spotlight effect */}
                <div className="p-4">
                  <div className="text-xs text-slate-500 mb-2">Output:</div>
                  <div className="space-y-1 font-mono text-sm">
                    {DEMO_LOGS.map((log, index) => (
                      <div
                        key={index}
                        className={`
                          px-2 py-1 rounded transition-all duration-500
                          ${
                            index === activeIndex
                              ? "bg-slate-800/50 ring-2 ring-blue-500/50"
                              : ""
                          }
                        `}
                      >
                        {showWithLogsDx ? (
                          <span
                            style={{
                              color:
                                log.text.includes("[ERROR]")
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

                {/* Environment indicators */}
                <div className="px-4 pb-4 flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        showWithLogsDx ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-slate-500">Terminal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        showWithLogsDx ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-slate-500">Browser</span>
                  </div>
                </div>
              </Card>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                Live Demo
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}