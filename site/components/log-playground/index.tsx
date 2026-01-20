"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useThemeProcessor } from "@/hooks/useThemeProcessor";
import { ThemeSelector } from "./ThemeSelector";
import { GhosttyTerminal } from "../output-comparison/GhosttyTerminal";
import { themeToGhostty } from "../output-comparison/utils";
import type { GhosttyTheme } from "../output-comparison/types";
import type {
  LogPlaygroundProps,
  OutputPaneProps,
  CardControlsProps,
  TerminalPaneProps,
  PlaygroundPanelsProps,
  InputPaneProps,
} from "./types";
import {
  DEFAULT_LOGS,
  TEXT_TITLE_HIGHLIGHT,
  TEXT_TITLE_REST,
  TEXT_DESCRIPTION,
  TEXT_CARD_TITLE,
  TEXT_LABEL_INPUT_LOGS,
  TEXT_LABEL_INPUT_PLACEHOLDER,
  TEXT_LABEL_BROWSER_CONSOLE,
  TEXT_LABEL_TERMINAL,
  TEXT_LABEL_RESET,
  CLASS_SECTION,
  CLASS_CONTAINER,
  CLASS_WRAPPER,
  CLASS_HEADER_TITLE,
  CLASS_HEADER_GRADIENT,
  CLASS_HEADER_DESCRIPTION,
  CLASS_CARD_HEADER,
  CLASS_CARD_TITLE,
  CLASS_CARD_CONTROLS,
  CLASS_CARD_CONTENT,
  CLASS_MAIN_GRID,
  CLASS_PANE_WRAPPER,
  CLASS_PANE_HEADER,
  CLASS_TEXTAREA,
  CLASS_OUTPUT_CONTENT,
  HEADER_DROP_SHADOW,
  LIGHT_BG,
  DARK_BG,
} from "./constants";

const HEADER_STYLE = { filter: HEADER_DROP_SHADOW };

function OutputPaneHeader({ title }: { title: string }) {
  return <div className={CLASS_PANE_HEADER}>{title}</div>;
}

function OutputPaneLoading({ backgroundColor }: { backgroundColor: string }) {
  return (
    <div className={CLASS_OUTPUT_CONTENT} style={{ backgroundColor }}>
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-400">Processing...</div>
      </div>
    </div>
  );
}

function OutputPaneItems({
  content,
  backgroundColor,
}: {
  content: string[];
  backgroundColor: string;
}) {
  const items = content.map((line, i) => {
    const htmlContent = { __html: line };
    return (
      <div
        key={i}
        className="leading-relaxed"
        dangerouslySetInnerHTML={htmlContent}
      />
    );
  });
  return (
    <div className={CLASS_OUTPUT_CONTENT} style={{ backgroundColor }}>
      <div className="space-y-0.5">{items}</div>
    </div>
  );
}

function OutputPaneContent({
  content,
  backgroundColor,
  isLoading,
}: Omit<OutputPaneProps, "title">) {
  if (isLoading) return <OutputPaneLoading backgroundColor={backgroundColor} />;
  return (
    <OutputPaneItems content={content} backgroundColor={backgroundColor} />
  );
}

function OutputPane({
  title,
  content,
  backgroundColor,
  isLoading,
}: OutputPaneProps) {
  const wrapperClass = `${CLASS_PANE_WRAPPER} flex flex-col h-full`;
  return (
    <div className={wrapperClass}>
      <OutputPaneHeader title={title} />
      <OutputPaneContent
        content={content}
        backgroundColor={backgroundColor}
        isLoading={isLoading}
      />
    </div>
  );
}

function InputPane({ value, onChange, placeholder }: InputPaneProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    onChange(e.target.value);
  const wrapperClass = `${CLASS_PANE_WRAPPER} flex flex-col h-full`;
  return (
    <div className={wrapperClass}>
      <div className={CLASS_PANE_HEADER}>{TEXT_LABEL_INPUT_LOGS}</div>
      <textarea
        value={value}
        onChange={handleChange}
        className={CLASS_TEXTAREA}
        placeholder={placeholder}
      />
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="text-center mb-12">
      <h2 className={CLASS_HEADER_TITLE} style={HEADER_STYLE}>
        <span className={CLASS_HEADER_GRADIENT}>{TEXT_TITLE_HIGHLIGHT}</span>{" "}
        {TEXT_TITLE_REST}
      </h2>
      <p className={CLASS_HEADER_DESCRIPTION}>{TEXT_DESCRIPTION}</p>
    </div>
  );
}

function getBackgroundColor(mode: string | undefined): string {
  if (mode === "light") return LIGHT_BG;
  return DARK_BG;
}

function convertToGhosttyTheme(
  theme: ReturnType<typeof useThemeProcessor>["theme"],
): GhosttyTheme | null {
  if (!theme) return null;
  return themeToGhostty(theme);
}

function usePlaygroundState(defaultLogs: string, defaultTheme: string) {
  const [inputText, setInputText] = useState(defaultLogs);
  const [selectedTheme, setSelectedTheme] = useState(defaultTheme);
  const logs = useMemo(
    () => inputText.split("\n").filter((line) => line.trim()),
    [inputText],
  );
  const { processedLogs, isLoading, theme } = useThemeProcessor(
    selectedTheme,
    logs,
  );
  const handleReset = useCallback(
    () => setInputText(defaultLogs),
    [defaultLogs],
  );
  const htmlContent = useMemo(
    () => processedLogs.map((p) => p.html),
    [processedLogs],
  );
  const ansiContent = useMemo(
    () => processedLogs.map((p) => p.ansi),
    [processedLogs],
  );
  const bgColor = getBackgroundColor(theme?.mode);
  const ghosttyTheme = useMemo(() => convertToGhosttyTheme(theme), [theme]);
  return {
    inputText,
    setInputText,
    selectedTheme,
    setSelectedTheme,
    htmlContent,
    ansiContent,
    isLoading,
    handleReset,
    bgColor,
    ghosttyTheme,
  };
}

function CardControls({
  selectedTheme,
  onThemeChange,
  onReset,
}: CardControlsProps) {
  return (
    <div className={CLASS_CARD_CONTROLS}>
      <ThemeSelector value={selectedTheme} onChange={onThemeChange} />
      <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5">
        <RotateCcw className="h-3.5 w-3.5" />
        {TEXT_LABEL_RESET}
      </Button>
    </div>
  );
}

function TerminalPaneLoading({ bgColor }: { bgColor: string }) {
  return (
    <div className={CLASS_OUTPUT_CONTENT} style={{ backgroundColor: bgColor }}>
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-400">Loading terminal...</div>
      </div>
    </div>
  );
}

function TerminalPane({
  ansiContent,
  ghosttyTheme,
  isLoading,
  bgColor,
}: TerminalPaneProps) {
  const wrapperClass = `${CLASS_PANE_WRAPPER} flex flex-col h-full`;
  const showLoading = !ghosttyTheme || isLoading;

  return (
    <div className={wrapperClass}>
      <OutputPaneHeader title={TEXT_LABEL_TERMINAL} />
      {showLoading && <TerminalPaneLoading bgColor={bgColor} />}
      {ghosttyTheme && !isLoading && (
        <div className="flex-1 min-h-[400px]">
          <GhosttyTerminal
            ansiOutputs={ansiContent}
            isLoading={isLoading}
            theme={ghosttyTheme}
          />
        </div>
      )}
    </div>
  );
}

function PlaygroundPanels({
  inputText,
  onInputChange,
  htmlContent,
  ansiContent,
  ghosttyTheme,
  bgColor,
  isLoading,
}: PlaygroundPanelsProps) {
  return (
    <div className={CLASS_MAIN_GRID}>
      <InputPane
        value={inputText}
        onChange={onInputChange}
        placeholder={TEXT_LABEL_INPUT_PLACEHOLDER}
      />
      <OutputPane
        title={TEXT_LABEL_BROWSER_CONSOLE}
        content={htmlContent}
        backgroundColor={bgColor}
        isLoading={isLoading}
      />
      <TerminalPane
        ansiContent={ansiContent}
        ghosttyTheme={ghosttyTheme}
        isLoading={isLoading}
        bgColor={bgColor}
      />
    </div>
  );
}

export function LogPlayground({
  defaultTheme = "dracula",
  defaultLogs = DEFAULT_LOGS,
}: LogPlaygroundProps) {
  const state = usePlaygroundState(defaultLogs, defaultTheme);

  return (
    <section id="playground" className={CLASS_SECTION}>
      <div className={CLASS_CONTAINER}>
        <div className={CLASS_WRAPPER}>
          <SectionHeader />
          <Card>
            <CardHeader className={CLASS_CARD_HEADER}>
              <CardTitle className={CLASS_CARD_TITLE}>
                {TEXT_CARD_TITLE}
              </CardTitle>
              <CardControls
                selectedTheme={state.selectedTheme}
                onThemeChange={state.setSelectedTheme}
                onReset={state.handleReset}
              />
            </CardHeader>
            <CardContent className={CLASS_CARD_CONTENT}>
              <PlaygroundPanels
                inputText={state.inputText}
                onInputChange={state.setInputText}
                htmlContent={state.htmlContent}
                ansiContent={state.ansiContent}
                ghosttyTheme={state.ghosttyTheme}
                bgColor={state.bgColor}
                isLoading={state.isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export type { LogPlaygroundProps } from "./types";
