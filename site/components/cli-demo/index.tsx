"use client";

import React, { useState } from "react";
import {
  CLI_FEATURES,
  INSTALL_COMMANDS,
  TERMINAL_COLORS,
  TEXT,
  CLASSES,
  STYLES,
} from "./constants";

type PackageManager = keyof typeof INSTALL_COMMANDS;

export function CliDemo() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [packageManager, setPackageManager] = useState<PackageManager>("npm");

  const feature = CLI_FEATURES[activeFeature];

  return (
    <section id="cli" className={CLASSES.section}>
      <div className={CLASSES.container}>
        <div className={CLASSES.wrapper}>
          <h2
            className={CLASSES.header.title}
            style={{ filter: STYLES.headerDropShadow }}
          >
            <span className={CLASSES.header.gradient}>
              {TEXT.title.highlight}
            </span>{" "}
            {TEXT.title.rest}
          </h2>
          <p className={CLASSES.header.description}>{TEXT.description}</p>

          <div className="mb-12">
            <div className={CLASSES.packageManager.wrapper}>
              {(Object.keys(INSTALL_COMMANDS) as PackageManager[]).map((pm) => (
                <button
                  key={pm}
                  onClick={() => setPackageManager(pm)}
                  className={`${CLASSES.packageManager.button.base} ${
                    packageManager === pm
                      ? CLASSES.packageManager.button.active
                      : CLASSES.packageManager.button.inactive
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
            <div
              className={CLASSES.packageManager.command}
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

          <div className={CLASSES.grid}>
            <div className={CLASSES.featureList}>
              {CLI_FEATURES.map((f, i) => (
                <button
                  key={f.title}
                  onClick={() => setActiveFeature(i)}
                  className={`${CLASSES.featureButton.base} ${
                    activeFeature === i
                      ? CLASSES.featureButton.active
                      : CLASSES.featureButton.inactive
                  }`}
                >
                  <h3
                    className={`${CLASSES.featureButton.titleWrapper} ${
                      activeFeature === i
                        ? CLASSES.featureButton.title.active
                        : CLASSES.featureButton.title.inactive
                    }`}
                  >
                    {f.title}
                  </h3>
                  <p className={CLASSES.featureButton.description}>
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
                className={CLASSES.terminal.header}
                style={{ backgroundColor: TERMINAL_COLORS.headerBg }}
              >
                <div className={CLASSES.terminal.dots}>
                  <div className={CLASSES.terminal.dot.red} />
                  <div className={CLASSES.terminal.dot.yellow} />
                  <div className={CLASSES.terminal.dot.green} />
                </div>
                <span className={CLASSES.terminal.title}>
                  {TEXT.labels.terminal}
                </span>
              </div>
              <div
                className={CLASSES.terminal.content}
                style={{ backgroundColor: TERMINAL_COLORS.bg }}
              >
                <div className={CLASSES.terminal.prompt}>
                  <span style={{ color: TERMINAL_COLORS.prompt }}>~ $ </span>
                  <span style={{ color: TERMINAL_COLORS.command }}>
                    {feature.command}
                  </span>
                </div>
                <div
                  className={CLASSES.terminal.output}
                  style={{ color: TERMINAL_COLORS.output }}
                >
                  {activeFeature === 0 && (
                    <TerminalOutput
                      lines={[
                        {
                          text: "INFO: Server started on port 3000",
                          color: "#7aa2f7",
                        },
                        {
                          text: "WARN: Memory usage high: 85%",
                          color: "#e0af68",
                        },
                        { text: "ERROR: Connection timeout", color: "#f7768e" },
                        {
                          text: "DEBUG: Cache hit ratio: 92%",
                          color: "#787c99",
                        },
                        {
                          text: "SUCCESS: Request completed ✓",
                          color: "#9ece6a",
                        },
                      ]}
                    />
                  )}
                  {activeFeature === 1 && (
                    <TerminalOutput
                      lines={[
                        {
                          text: "Processing app.log...",
                          color: TERMINAL_COLORS.text,
                        },
                        { text: "✓ 1,234 lines processed", color: "#9ece6a" },
                        { text: "✓ Theme: github-dark", color: "#9ece6a" },
                        {
                          text: "✓ Output saved to app.styled.log",
                          color: "#9ece6a",
                        },
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
                        {
                          text: "? Theme name: my-custom-theme",
                          color: TERMINAL_COLORS.text,
                        },
                        {
                          text: "? Theme mode: 🌙 Dark",
                          color: TERMINAL_COLORS.text,
                        },
                        {
                          text: "? Color preset: 🎨 Vibrant",
                          color: TERMINAL_COLORS.text,
                        },
                      ]}
                    />
                  )}
                  {activeFeature === 3 && (
                    <TerminalOutput
                      lines={[
                        {
                          text: "┌─────────────────────────────┐",
                          color: "#7aa2f7",
                        },
                        {
                          text: "│  Theme Preview: nord        │",
                          color: "#7aa2f7",
                        },
                        {
                          text: "├─────────────────────────────┤",
                          color: "#7aa2f7",
                        },
                        {
                          text: "│ INFO: Server started        │",
                          color: "#88c0d0",
                        },
                        {
                          text: "│ WARN: High memory usage     │",
                          color: "#ebcb8b",
                        },
                        {
                          text: "│ ERROR: Connection failed    │",
                          color: "#bf616a",
                        },
                        {
                          text: "└─────────────────────────────┘",
                          color: "#7aa2f7",
                        },
                      ]}
                    />
                  )}
                  {activeFeature === 4 && (
                    <TerminalOutput
                      lines={[
                        {
                          text: "[10:23:45] Request received from 192.168.1.1",
                          color: "#7aa2f7",
                        },
                        {
                          text: "[10:23:46] Processing request id=abc123",
                          color: "#787c99",
                        },
                        {
                          text: "[10:23:47] Response sent: 200 OK (45ms)",
                          color: "#9ece6a",
                        },
                        {
                          text: "[10:23:48] New connection established",
                          color: "#7aa2f7",
                        },
                        { text: "█", color: TERMINAL_COLORS.text, blink: true },
                      ]}
                    />
                  )}
                  {activeFeature === 5 && (
                    <TerminalOutput
                      lines={[
                        {
                          text: "Available Themes:",
                          color: TERMINAL_COLORS.text,
                        },
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
        <div
          key={i}
          style={{ color: line.color }}
          className={line.blink ? "animate-pulse" : ""}
        >
          {line.text}
        </div>
      ))}
    </>
  );
}

export type { CliFeature } from "./types";
