"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";

type SetupStep = "install" | "import" | "custom";

interface CodeLine {
  text: string;
  highlight?: boolean;
}

const SETUP_CONTENT = {
  install: {
    title: "Install with your package manager",
    lines: [
      { text: "npm install logsdx", highlight: true },
      { text: "# or" },
      { text: "yarn add logsdx" },
      { text: "# or" },
      { text: "pnpm add logsdx" },
      { text: "# or" },
      { text: "bun add logsdx" },
    ],
    language: "bash",
  },
  import: {
    title: "Import and start logging",
    lines: [
      { text: "import { getLogsDX } from 'logsdx'" },
      { text: "" },
      { text: "// Use a built-in theme", highlight: true },
      { text: "const logger = getLogsDX('dracula')", highlight: true },
      { text: "" },
      { text: "// Terminal output (ANSI)" },
      {
        text: "console.log(logger.processLine('ERROR: Database connection failed'))",
      },
      {
        text: "console.log(logger.processLine('INFO: Server started on port 3000'))",
      },
      { text: "" },
      { text: "// Browser output (HTML)" },
      { text: "const htmlLogger = getLogsDX('dracula', {" },
      { text: "  outputFormat: 'html'" },
      { text: "})" },
      {
        text: "const safeHTML = htmlLogger.processLine('ERROR: Critical error occurred')",
      },
    ],
    language: "javascript",
  },
  custom: {
    title: "Create custom themes",
    lines: [
      {
        text: "import { createTheme, registerTheme, getLogsDX } from 'logsdx'",
      },
      { text: "" },
      { text: "const myTheme = createTheme({", highlight: true },
      { text: "  name: 'my-theme',", highlight: true },
      { text: "  colors: {", highlight: true },
      { text: "    primary: '#3b82f6',", highlight: true },
      { text: "    success: '#10b981',", highlight: true },
      { text: "    warning: '#f59e0b',", highlight: true },
      { text: "    error: '#ef4444',", highlight: true },
      { text: "    info: '#06b6d4',", highlight: true },
      { text: "    debug: '#8b5cf6',", highlight: true },
      { text: "  },", highlight: true },
      {
        text: "  presets: ['logLevels', 'timestamps', 'json'],",
        highlight: true,
      },
      { text: "})", highlight: true },
      { text: "" },
      { text: "// Register and use the theme" },
      { text: "registerTheme(myTheme)" },
      { text: "const logger = getLogsDX('my-theme')" },
      { text: "" },
      { text: "// Your logs now have consistent styling everywhere" },
      { text: "logger.log('[SUCCESS] Deployment completed')" },
    ],
    language: "javascript",
  },
};

function getStepNumber(step: SetupStep) {
  if (step === "install") return "1";
  if (step === "import") return "2";
  return "3";
}

function getHighlightedLines(step: SetupStep) {
  return SETUP_CONTENT[step].lines
    .map((line, index) => (line.highlight ? index : null))
    .filter((index): index is number => index !== null);
}

function getLanguageColor(language: string) {
  if (language === "bash") return "#89e051";
  if (language === "javascript") return "#f1e05a";
  return "#6b7280";
}

function getLineStyle({
  lineIndex,
  line,
  highlightedLines,
  highlightIndex,
  isHovered,
}: {
  lineIndex: number;
  line: CodeLine;
  highlightedLines: number[];
  highlightIndex: number;
  isHovered: boolean;
}) {
  if (isHovered) {
    return { opacity: 1, background: "transparent", transform: "scale(1)" };
  }

  const isCurrentlyHighlighted =
    line.highlight && highlightedLines[highlightIndex] === lineIndex;
  if (!line.highlight) {
    return { opacity: 0.4, background: "transparent", transform: "scale(1)" };
  }

  return {
    opacity: isCurrentlyHighlighted ? 1 : 0.5,
    background: isCurrentlyHighlighted
      ? "rgba(59, 130, 246, 0.1)"
      : "transparent",
    transform: isCurrentlyHighlighted ? "scale(1.02)" : "scale(1)",
    borderLeft: isCurrentlyHighlighted
      ? "3px solid rgb(59, 130, 246)"
      : "3px solid transparent",
    paddingLeft: "12px",
    marginLeft: "-12px",
  };
}

function useStepCycle(
  isHovered: boolean,
  setActiveStep: React.Dispatch<React.SetStateAction<SetupStep>>,
  setHighlightIndex: React.Dispatch<React.SetStateAction<number>>,
) {
  React.useEffect(() => {
    if (isHovered) return;

    const steps: SetupStep[] = ["install", "import", "custom"];
    const interval = setInterval(() => {
      setActiveStep((current) => {
        const currentIndex = steps.indexOf(current);
        const nextIndex = (currentIndex + 1) % steps.length;
        setHighlightIndex(0);
        return steps[nextIndex];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, setActiveStep, setHighlightIndex]);
}

function useHighlightCycle(
  activeStep: SetupStep,
  isHovered: boolean,
  setHighlightIndex: React.Dispatch<React.SetStateAction<number>>,
) {
  React.useEffect(() => {
    if (isHovered) return;

    const highlightedLines = getHighlightedLines(activeStep);
    if (highlightedLines.length === 0) return;

    const interval = setInterval(() => {
      setHighlightIndex((previous) => (previous + 1) % highlightedLines.length);
    }, 800);

    return () => clearInterval(interval);
  }, [activeStep, isHovered, setHighlightIndex]);
}

function useSetupAnimation() {
  const [activeStep, setActiveStep] = useState<SetupStep>("install");
  const [isHovered, setIsHovered] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useStepCycle(isHovered, setActiveStep, setHighlightIndex);
  useHighlightCycle(activeStep, isHovered, setHighlightIndex);

  return {
    activeStep,
    setActiveStep,
    isHovered,
    setIsHovered,
    highlightIndex,
    setHighlightIndex,
  };
}

type SetupContent = (typeof SETUP_CONTENT)[SetupStep];

function SetupCodeHeader({
  content,
  activeStep,
}: {
  content: SetupContent;
  activeStep: SetupStep;
}) {
  return (
    <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>{activeStep === "install" ? "terminal" : "app.js"}</span>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getLanguageColor(content.language) }}
          />
        </div>
      </div>
    </div>
  );
}

function SetupCodeLineContent({
  line,
  index,
  codeClassName,
}: {
  line: CodeLine;
  index: number;
  codeClassName: string;
}) {
  return (
    <div className="flex">
      <span
        className="text-slate-600 select-none pr-4 text-xs"
        style={{ minWidth: "2rem" }}
      >
        {index + 1}
      </span>
      <pre className="flex-1">
        <code
          className={codeClassName}
          dangerouslySetInnerHTML={{ __html: line.text || "&nbsp;" }}
        />
      </pre>
    </div>
  );
}

function SetupCodeLine({
  line,
  index,
  content,
  highlightedLines,
  highlightIndex,
  isHovered,
}: {
  line: CodeLine;
  index: number;
  content: SetupContent;
  highlightedLines: number[];
  highlightIndex: number;
  isHovered: boolean;
}) {
  const lineStyle = getLineStyle({
    lineIndex: index,
    line,
    highlightedLines,
    highlightIndex,
    isHovered,
  });
  const codeClassName =
    content.language === "bash" ? "text-green-400" : "text-slate-300";

  return (
    <div className="transition-all duration-300 ease-in-out" style={lineStyle}>
      <SetupCodeLineContent
        line={line}
        index={index}
        codeClassName={codeClassName}
      />
    </div>
  );
}

function SetupCodeLines({
  content,
  highlightedLines,
  highlightIndex,
  isHovered,
}: {
  content: SetupContent;
  highlightedLines: number[];
  highlightIndex: number;
  isHovered: boolean;
}) {
  return (
    <div className="p-4 font-mono text-sm">
      <div className="space-y-0">
        {content.lines.map((line, index) => (
          <SetupCodeLine
            key={index}
            line={line}
            index={index}
            content={content}
            highlightedLines={highlightedLines}
            highlightIndex={highlightIndex}
            isHovered={isHovered}
          />
        ))}
      </div>
    </div>
  );
}

function SetupCodeCard({
  activeStep,
  isHovered,
  setIsHovered,
  highlightIndex,
}: {
  activeStep: SetupStep;
  isHovered: boolean;
  setIsHovered: (value: boolean) => void;
  highlightIndex: number;
}) {
  const content = SETUP_CONTENT[activeStep];
  const highlightedLines = getHighlightedLines(activeStep);

  return (
    <div className="relative lg:sticky lg:top-24">
      <div className="absolute -top-2 right-4 z-10 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full shadow-lg">
        Step {getStepNumber(activeStep)} of 3
      </div>
      <Card
        className="overflow-hidden bg-slate-900 border-slate-700 h-fit"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SetupCodeHeader content={content} activeStep={activeStep} />
        <SetupCodeLines
          content={content}
          highlightedLines={highlightedLines}
          highlightIndex={highlightIndex}
          isHovered={isHovered}
        />
        <div className="px-4 pb-3 pt-2 border-t border-slate-700 text-xs">
          <div className="text-slate-500">{content.title}</div>
        </div>
      </Card>
    </div>
  );
}

const SETUP_STEPS: Array<{
  step: SetupStep;
  number: string;
  title: string;
  description: string;
}> = [
  {
    step: "install",
    number: "1",
    title: "Install Package",
    description: "Works with npm, yarn, pnpm, or bun",
  },
  {
    step: "import",
    number: "2",
    title: "Import & Use",
    description: "Choose from built-in themes or create your own",
  },
  {
    step: "custom",
    number: "3",
    title: "Customize Themes",
    description: "Match your brand with custom color schemes",
  },
];

function SetupStepNumber({
  isActive,
  number,
}: {
  isActive: boolean;
  number: string;
}) {
  const activeClass = "bg-gradient-to-r from-blue-600 to-purple-600 text-white";
  const inactiveClass =
    "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400";

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        isActive ? activeClass : inactiveClass
      }`}
    >
      {number}
    </div>
  );
}

function SetupStepCopy({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function SetupStepButton({
  item,
  activeStep,
  onSelect,
  setIsHovered,
  setHighlightIndex,
}: {
  item: (typeof SETUP_STEPS)[number];
  activeStep: SetupStep;
  onSelect: (step: SetupStep) => void;
  setIsHovered: (value: boolean) => void;
  setHighlightIndex: (value: number) => void;
}) {
  const isActive = activeStep === item.step;
  const activeButton = "border-blue-500 bg-blue-50 dark:bg-blue-950/30";
  const inactiveButton =
    "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600";

  return (
    <button
      onClick={() => {
        onSelect(item.step);
        setHighlightIndex(0);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`text-left p-4 rounded-lg border transition-all ${
        isActive ? activeButton : inactiveButton
      }`}
    >
      <div className="flex items-center gap-3">
        <SetupStepNumber isActive={isActive} number={item.number} />
        <SetupStepCopy title={item.title} description={item.description} />
      </div>
    </button>
  );
}

function SetupStepButtons({
  activeStep,
  setActiveStep,
  setIsHovered,
  setHighlightIndex,
}: {
  activeStep: SetupStep;
  setActiveStep: (step: SetupStep) => void;
  setIsHovered: (value: boolean) => void;
  setHighlightIndex: (value: number) => void;
}) {
  return (
    <div className="pt-6 space-y-4">
      <div className="flex flex-col gap-3">
        {SETUP_STEPS.map((item) => (
          <SetupStepButton
            key={item.step}
            item={item}
            activeStep={activeStep}
            onSelect={setActiveStep}
            setIsHovered={setIsHovered}
            setHighlightIndex={setHighlightIndex}
          />
        ))}
      </div>
    </div>
  );
}

function SetupIntro() {
  return (
    <h2 className="mb-8 text-5xl lg:text-6xl font-bold">
      Quick Start
      <br />
      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        in 30 seconds
      </span>
    </h2>
  );
}

function SetupCopy() {
  return (
    <>
      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
        Get up and running with logsDx in less than a minute. No configuration
        needed to start.
      </p>
      <p>
        logsDx works out of the box with zero configuration. Just install,
        import, and your logs will look beautiful in both terminal and browser
        environments.
      </p>
    </>
  );
}

function SetupConclusion() {
  return (
    <div className="pt-6 border-t">
      <p className="font-semibold text-slate-900 dark:text-slate-100">
        That's it! Your logs now look identical in terminal and browser, with
        zero additional configuration.
      </p>
    </div>
  );
}

function SetupDescription({
  activeStep,
  setActiveStep,
  setIsHovered,
  setHighlightIndex,
}: {
  activeStep: SetupStep;
  setActiveStep: (step: SetupStep) => void;
  setIsHovered: (value: boolean) => void;
  setHighlightIndex: (value: number) => void;
}) {
  return (
    <div>
      <SetupIntro />
      <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400">
        <SetupCopy />
        <SetupStepButtons
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          setIsHovered={setIsHovered}
          setHighlightIndex={setHighlightIndex}
        />
        <SetupConclusion />
      </div>
    </div>
  );
}

export function SetupSection() {
  const {
    activeStep,
    setActiveStep,
    isHovered,
    setIsHovered,
    highlightIndex,
    setHighlightIndex,
  } = useSetupAnimation();

  return (
    <section id="setup" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            <SetupCodeCard
              activeStep={activeStep}
              isHovered={isHovered}
              setIsHovered={setIsHovered}
              highlightIndex={highlightIndex}
            />

            <SetupDescription
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              setIsHovered={setIsHovered}
              setHighlightIndex={setHighlightIndex}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
