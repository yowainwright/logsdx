"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getTheme } from "logsdx";
import { SAMPLE_LOGS, THEME_OPTIONS, TEXT, CLASSES, STYLES, DEFAULT_GHOSTTY_THEME } from "./constants";
import { themeToGhostty, processLogsWithTheme } from "./utils";
import type { ViewMode, ProcessedOutput, GhosttyTheme } from "./types";

const TerminalLoader = () => (
  <div className="flex items-center justify-center h-64 text-slate-500">
    {TEXT.labels.loadingTerminal}
  </div>
);

const GhosttyTerminal = dynamic(
  () => import("./GhosttyTerminal").then((mod) => mod.GhosttyTerminal),
  { ssr: false, loading: TerminalLoader },
);

function escapeHtmlForDisplay(html: string): string {
  return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const WINDOW_DOTS = ["red", "yellow", "green"] as const;
const MODE_BUTTONS = [{ id: "rendered", label: "Rendered" }, { id: "source", label: "Source" }] as const;

interface TerminalWindowProps {
  title: string;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  bgColor: string;
  children: React.ReactNode;
}

function TerminalWindowDots() {
  const dots = WINDOW_DOTS.map((color) => {
    const dotClass = CLASSES.terminal.dot[color];
    return <div key={color} className={dotClass} />;
  });
  return <div className={CLASSES.terminal.dots}>{dots}</div>;
}

interface ModeButtonsProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

function getModeButtonClass(isActive: boolean): string {
  const base = "px-2 py-1 text-xs rounded transition-colors";
  if (isActive) return `${base} bg-white/20 text-white`;
  return `${base} text-white/60 hover:text-white hover:bg-white/10`;
}

function ModeButtons({ mode, onModeChange }: ModeButtonsProps) {
  const buttons = MODE_BUTTONS.map(({ id, label }) => {
    const isActive = mode === id;
    const className = getModeButtonClass(isActive);
    const handleClick = () => onModeChange(id as ViewMode);
    return <button key={id} onClick={handleClick} className={className}>{label}</button>;
  });
  return <div className="ml-auto flex gap-1">{buttons}</div>;
}

function TerminalWindow({ title, mode, onModeChange, bgColor, children }: TerminalWindowProps) {
  const wrapperClass = `${CLASSES.terminal.wrapper} h-full flex flex-col`;
  const contentClass = `${CLASSES.terminal.content} flex-1`;
  const contentStyle = { backgroundColor: bgColor };

  return (
    <div className={wrapperClass}>
      <div className={CLASSES.terminal.header}>
        <TerminalWindowDots />
        <span className={CLASSES.terminal.title}>{title}</span>
        <ModeButtons mode={mode} onModeChange={onModeChange} />
      </div>
      <div className={contentClass} style={contentStyle}>{children}</div>
    </div>
  );
}

interface ThemeButtonProps {
  theme: string;
  isSelected: boolean;
  onClick: () => void;
}

function getThemeButtonClass(isSelected: boolean): string {
  const base = "w-full px-3 py-2 text-left text-sm rounded-lg transition-colors";
  const selected = "bg-blue-600 text-white font-medium";
  const unselected = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";
  if (isSelected) return `${base} ${selected}`;
  return `${base} ${unselected}`;
}

function ThemeButton({ theme, isSelected, onClick }: ThemeButtonProps) {
  const buttonClass = getThemeButtonClass(isSelected);
  return <button onClick={onClick} className={buttonClass}>{theme}</button>;
}

interface ThemeSidebarProps {
  themeName: string;
  onThemeChange: (theme: string) => void;
}

function ThemeSidebar({ themeName, onThemeChange }: ThemeSidebarProps) {
  const themeButtons = THEME_OPTIONS.map((t) => {
    const isSelected = themeName === t;
    const handleClick = () => onThemeChange(t);
    return <ThemeButton key={t} theme={t} isSelected={isSelected} onClick={handleClick} />;
  });

  return (
    <div className={CLASSES.sidebar}>
      <div>
        <label className={CLASSES.label}>{TEXT.labels.theme}</label>
        <div className="flex flex-col gap-1.5">{themeButtons}</div>
      </div>
      <p className={CLASSES.significanceText}>{TEXT.labels.significance}</p>
    </div>
  );
}

interface TerminalContentProps {
  isLoading: boolean;
  mode: ViewMode;
  outputs: ProcessedOutput[];
  ghosttyTheme: GhosttyTheme;
}

function TerminalContentSource({ outputs }: { outputs: ProcessedOutput[] }) {
  const items = outputs.map((output, i) => (
    <div key={i} className="font-mono text-sm text-amber-400 break-all">{output.ansiVisible}</div>
  ));
  return <div className="space-y-1 p-4">{items}</div>;
}

function TerminalContent({ isLoading, mode, outputs, ghosttyTheme }: TerminalContentProps) {
  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">{TEXT.labels.processing}</div>;
  }
  if (mode === "rendered") {
    const ansiOutputs = outputs.map((o) => o.ansi);
    return <GhosttyTerminal ansiOutputs={ansiOutputs} isLoading={isLoading} theme={ghosttyTheme} />;
  }
  return <TerminalContentSource outputs={outputs} />;
}

interface BrowserContentProps {
  isLoading: boolean;
  mode: ViewMode;
  outputs: ProcessedOutput[];
}

function BrowserContentRendered({ outputs }: { outputs: ProcessedOutput[] }) {
  const items = outputs.map((output, i) => {
    const htmlContent = { __html: output.html };
    return <div key={i} className="font-mono text-sm" dangerouslySetInnerHTML={htmlContent} />;
  });
  return <div className="space-y-1 p-4 h-full min-h-[300px]">{items}</div>;
}

function BrowserContentSource({ outputs }: { outputs: ProcessedOutput[] }) {
  const items = outputs.map((output, i) => {
    const escaped = escapeHtmlForDisplay(output.html);
    return <div key={i} className="font-mono text-xs text-emerald-400 break-all">{escaped}</div>;
  });
  return <div className="space-y-2 p-4 h-full min-h-[300px]">{items}</div>;
}

function BrowserContent({ isLoading, mode, outputs }: BrowserContentProps) {
  if (isLoading) {
    return <div className="flex items-center justify-center h-full min-h-[300px] text-slate-500">{TEXT.labels.processing}</div>;
  }
  if (mode === "rendered") {
    return <BrowserContentRendered outputs={outputs} />;
  }
  return <BrowserContentSource outputs={outputs} />;
}

function useThemeLoader(themeName: string) {
  const [outputs, setOutputs] = useState<ProcessedOutput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ghosttyTheme, setGhosttyTheme] = useState(DEFAULT_GHOSTTY_THEME);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getTheme(themeName)
      .then((loadedTheme) => {
        if (cancelled) return;
        setGhosttyTheme(themeToGhostty(loadedTheme));
        setOutputs(processLogsWithTheme(SAMPLE_LOGS, loadedTheme));
      })
      .catch((err) => !cancelled && console.error("Failed to process logs:", err))
      .finally(() => !cancelled && setIsLoading(false));

    return () => { cancelled = true; };
  }, [themeName]);

  return { outputs, isLoading, ghosttyTheme };
}

function SectionHeader() {
  const headerStyle = { filter: STYLES.headerDropShadow };
  return (
    <>
      <h2 className={CLASSES.header.title} style={headerStyle}>
        <span className={CLASSES.header.gradient}>{TEXT.title.highlight}</span> {TEXT.title.rest}
      </h2>
      <p className={CLASSES.header.description}>{TEXT.description}</p>
    </>
  );
}

interface OutputPanelsProps {
  terminalMode: ViewMode;
  browserMode: ViewMode;
  onTerminalModeChange: (mode: ViewMode) => void;
  onBrowserModeChange: (mode: ViewMode) => void;
  outputs: ProcessedOutput[];
  isLoading: boolean;
  ghosttyTheme: GhosttyTheme;
}

function OutputPanels({ terminalMode, browserMode, onTerminalModeChange, onBrowserModeChange, outputs, isLoading, ghosttyTheme }: OutputPanelsProps) {
  const bgColor = ghosttyTheme.background;
  return (
    <div className={CLASSES.content}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <TerminalWindow title="Terminal (ANSI)" mode={terminalMode} onModeChange={onTerminalModeChange} bgColor={bgColor}>
          <TerminalContent isLoading={isLoading} mode={terminalMode} outputs={outputs} ghosttyTheme={ghosttyTheme} />
        </TerminalWindow>
        <TerminalWindow title="Browser (HTML)" mode={browserMode} onModeChange={onBrowserModeChange} bgColor={bgColor}>
          <BrowserContent isLoading={isLoading} mode={browserMode} outputs={outputs} />
        </TerminalWindow>
      </div>
    </div>
  );
}

function useOutputComparisonState() {
  const [themeName, setThemeName] = useState("dracula");
  const [terminalMode, setTerminalMode] = useState<ViewMode>("rendered");
  const [browserMode, setBrowserMode] = useState<ViewMode>("rendered");
  const themeData = useThemeLoader(themeName);
  return { themeName, setThemeName, terminalMode, setTerminalMode, browserMode, setBrowserMode, ...themeData };
}

function buildPanelProps(state: ReturnType<typeof useOutputComparisonState>): OutputPanelsProps {
  return {
    terminalMode: state.terminalMode, browserMode: state.browserMode,
    onTerminalModeChange: state.setTerminalMode, onBrowserModeChange: state.setBrowserMode,
    outputs: state.outputs, isLoading: state.isLoading, ghosttyTheme: state.ghosttyTheme,
  };
}

function OutputComparisonContent() {
  const state = useOutputComparisonState();
  const panelProps = buildPanelProps(state);

  return (
    <>
      <SectionHeader />
      <div className={CLASSES.grid}>
        <ThemeSidebar themeName={state.themeName} onThemeChange={state.setThemeName} />
        <OutputPanels {...panelProps} />
      </div>
    </>
  );
}

export function OutputComparison() {
  return (
    <section id="output-comparison" className={CLASSES.section}>
      <div className={CLASSES.container}>
        <div className={CLASSES.wrapper}>
          <OutputComparisonContent />
        </div>
      </div>
    </section>
  );
}

export { GhosttyTerminal } from "./GhosttyTerminal";
export type {
  OutputComparisonProps,
  OutputView,
  ViewMode,
  GhosttyTerminalProps,
} from "./types";
