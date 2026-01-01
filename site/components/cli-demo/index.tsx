"use client";

import React, { useState } from "react";
import { CLI_FEATURES, INSTALL_COMMANDS, TERMINAL_COLORS } from "./constants";

type PackageManager = keyof typeof INSTALL_COMMANDS;

export function CliDemo() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [packageManager, setPackageManager] = useState<PackageManager>("npm");

  const feature = CLI_FEATURES[activeFeature];

  return (
    <section id="cli" className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-5xl lg:text-6xl font-bold">
            <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
              Powerful
            </span>{" "}
            CLI
          </h2>
          <p className="mb-12 text-center text-xl text-slate-600 dark:text-slate-400">
            Style your logs from anywhere with a single command
          </p>

          <div className="mb-12">
            <div className="flex justify-center gap-2 mb-4">
              {(Object.keys(INSTALL_COMMANDS) as PackageManager[]).map((pm) => (
                <button
                  key={pm}
                  onClick={() => setPackageManager(pm)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    packageManager === pm
                      ? "bg-green-500 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
            <div
              className="rounded-lg p-4 font-mono text-center"
              style={{
                backgroundColor: TERMINAL_COLORS.bg,
                color: TERMINAL_COLORS.text,
              }}
            >
              <span style={{ color: TERMINAL_COLORS.prompt }}>$ </span>
              <span style={{ color: TERMINAL_COLORS.command }}>
                {INSTALL_COMMANDS[packageManager]}
              </span>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              {CLI_FEATURES.map((f, i) => (
                <button
                  key={f.title}
                  onClick={() => setActiveFeature(i)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    activeFeature === i
                      ? "bg-green-500/10 border-2 border-green-500"
                      : "bg-white dark:bg-slate-800 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <h3
                    className={`font-semibold mb-1 ${
                      activeFeature === i
                        ? "text-green-600 dark:text-green-400"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {f.description}
                  </p>
                </button>
              ))}
            </div>

            <div
              className="rounded-lg overflow-hidden"
              style={{ border: `1px solid ${TERMINAL_COLORS.border}` }}
            >
              <div
                className="px-4 py-2 flex items-center gap-2"
                style={{ backgroundColor: TERMINAL_COLORS.headerBg }}
              >
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-white/60 ml-2">Terminal</span>
              </div>
              <div
                className="p-6 font-mono min-h-[300px]"
                style={{ backgroundColor: TERMINAL_COLORS.bg }}
              >
                <div className="mb-4">
                  <span style={{ color: TERMINAL_COLORS.prompt }}>~ $ </span>
                  <span style={{ color: TERMINAL_COLORS.command }}>
                    {feature.command}
                  </span>
                </div>
                <div
                  className="text-sm leading-relaxed"
                  style={{ color: TERMINAL_COLORS.output }}
                >
                  {activeFeature === 0 && (
                    <TerminalOutput
                      lines={[
                        { text: "INFO: Server started on port 3000", color: "#7aa2f7" },
                        { text: "WARN: Memory usage high: 85%", color: "#e0af68" },
                        { text: "ERROR: Connection timeout", color: "#f7768e" },
                        { text: "DEBUG: Cache hit ratio: 92%", color: "#787c99" },
                        { text: "SUCCESS: Request completed ✓", color: "#9ece6a" },
                      ]}
                    />
                  )}
                  {activeFeature === 1 && (
                    <TerminalOutput
                      lines={[
                        { text: "Processing app.log...", color: TERMINAL_COLORS.text },
                        { text: "✓ 1,234 lines processed", color: "#9ece6a" },
                        { text: "✓ Theme: github-dark", color: "#9ece6a" },
                        { text: "✓ Output saved to app.styled.log", color: "#9ece6a" },
                      ]}
                    />
                  )}
                  {activeFeature === 2 && (
                    <TerminalOutput
                      lines={[
                        { text: "╦  ┌─┐┌─┐┌─┐╔╦╗═╗ ╦", color: "#7aa2f7" },
                        { text: "║  │ ││ ┬└─┐ ║║╔╩╦╝", color: "#bb9af7" },
                        { text: "╩═╝└─┘└─┘└─┘═╩╝╩ ╚═", color: "#9ece6a" },
                        { text: "", color: "" },
                        { text: "? Theme name: my-custom-theme", color: TERMINAL_COLORS.text },
                        { text: "? Theme mode: 🌙 Dark", color: TERMINAL_COLORS.text },
                        { text: "? Color preset: 🎨 Vibrant", color: TERMINAL_COLORS.text },
                      ]}
                    />
                  )}
                  {activeFeature === 3 && (
                    <TerminalOutput
                      lines={[
                        { text: "┌─────────────────────────────┐", color: "#7aa2f7" },
                        { text: "│  Theme Preview: nord        │", color: "#7aa2f7" },
                        { text: "├─────────────────────────────┤", color: "#7aa2f7" },
                        { text: "│ INFO: Server started        │", color: "#88c0d0" },
                        { text: "│ WARN: High memory usage     │", color: "#ebcb8b" },
                        { text: "│ ERROR: Connection failed    │", color: "#bf616a" },
                        { text: "└─────────────────────────────┘", color: "#7aa2f7" },
                      ]}
                    />
                  )}
                  {activeFeature === 4 && (
                    <TerminalOutput
                      lines={[
                        { text: "[10:23:45] Request received from 192.168.1.1", color: "#7aa2f7" },
                        { text: "[10:23:46] Processing request id=abc123", color: "#787c99" },
                        { text: "[10:23:47] Response sent: 200 OK (45ms)", color: "#9ece6a" },
                        { text: "[10:23:48] New connection established", color: "#7aa2f7" },
                        { text: "█", color: TERMINAL_COLORS.text, blink: true },
                      ]}
                    />
                  )}
                  {activeFeature === 5 && (
                    <TerminalOutput
                      lines={[
                        { text: "Available Themes:", color: TERMINAL_COLORS.text },
                        { text: "", color: "" },
                        { text: "  • dracula", color: "#bd93f9" },
                        { text: "  • github-dark", color: "#7aa2f7" },
                        { text: "  • github-light", color: "#24292e" },
                        { text: "  • nord", color: "#88c0d0" },
                        { text: "  • monokai", color: "#f92672" },
                        { text: "  • solarized-dark", color: "#268bd2" },
                        { text: "  • oh-my-zsh", color: "#9ece6a" },
                      ]}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface TerminalLine {
  text: string;
  color: string;
  blink?: boolean;
}

function TerminalOutput({ lines }: { lines: TerminalLine[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <div key={i} style={{ color: line.color }} className={line.blink ? "animate-pulse" : ""}>
          {line.text}
        </div>
      ))}
    </>
  );
}

export type { CliFeature } from "./types";
