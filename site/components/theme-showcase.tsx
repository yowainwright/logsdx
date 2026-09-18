"use client";

import React, { useState, useEffect } from "react";
import { ThemeCard } from "./theme-card";

interface ThemeShowcaseProps {
  autoPlay?: boolean;
  speed?: "slow" | "medium" | "fast";
  themes?: string[];
  dimOpacity?: number;
  children?: React.ReactNode;
}

const getAnimationConfig = (speed: "slow" | "medium" | "fast") => {
  const configs = {
    slow: { duration: 30, stagger: 3 },
    medium: { duration: 20, stagger: 2 },
    fast: { duration: 15, stagger: 1.5 },
  };
  return configs[speed];
};

interface ThemeColumnProps {
  column: number;
  hoveredCard: string | null;
  isHovered: boolean;
  onCardHover: (cardKey: string | null) => void;
  onColumnHover: (isHovered: boolean) => void;
  themes: string[];
  visibilityClassName?: string;
}

function getCardStyle(isHovered: boolean, isCardHovered: boolean) {
  let opacity = 0.7;
  if (isHovered) opacity = 0.5;
  if (isCardHovered) opacity = 1;
  const transform = isCardHovered ? "scale(1.02)" : "scale(1)";

  return {
    opacity,
    transform,
    transition: "all 0.3s ease",
  };
}

function ThemeCards({
  column,
  hoveredCard,
  isHovered,
  onCardHover,
  themes,
}: Omit<ThemeColumnProps, "onColumnHover" | "visibilityClassName">) {
  return (
    <div className="space-y-4 py-4">
      {themes.map((theme, index) => {
        const cardKey = `col${column}-${theme}-${index}`;
        const isCardHovered = hoveredCard === cardKey;
        const cardStyle = getCardStyle(isHovered, isCardHovered);

        return (
          <div
            key={cardKey}
            style={cardStyle}
            onMouseEnter={() => onCardHover(cardKey)}
            onMouseLeave={() => onCardHover(null)}
          >
            <ThemeCard themeName={theme} isVisible={true} />
          </div>
        );
      })}
    </div>
  );
}

function ThemeColumn({
  column,
  hoveredCard,
  isHovered,
  onCardHover,
  onColumnHover,
  themes,
  visibilityClassName = "",
}: ThemeColumnProps) {
  const animationClassName = `scroll-animation-${column} ${
    isHovered ? "animation-paused" : ""
  }`;
  const columnClassName = `flex-1 overflow-hidden ${visibilityClassName}`;

  return (
    <div
      className={columnClassName}
      onMouseEnter={() => onColumnHover(true)}
      onMouseLeave={() => {
        onColumnHover(false);
        onCardHover(null);
      }}
    >
      <div className={animationClassName}>
        <ThemeCards
          column={column}
          hoveredCard={hoveredCard}
          isHovered={isHovered}
          onCardHover={onCardHover}
          themes={themes}
        />
      </div>
    </div>
  );
}

function useScrollStyles(duration: number) {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes scrollColumn1 {
        0% { transform: translateY(0); }
        100% { transform: translateY(-33.333%); }
      }

      @keyframes scrollColumn2 {
        0% { transform: translateY(-10%); }
        100% { transform: translateY(-43.333%); }
      }

      @keyframes scrollColumn3 {
        0% { transform: translateY(-20%); }
        100% { transform: translateY(-53.333%); }
      }

      .scroll-animation-1 {
        animation: scrollColumn1 ${duration}s linear infinite;
      }

      .scroll-animation-2 {
        animation: scrollColumn2 ${duration}s linear infinite;
      }

      .scroll-animation-3 {
        animation: scrollColumn3 ${duration}s linear infinite;
      }

      .animation-paused {
        animation-play-state: paused !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [duration]);
}

interface ThemeColumnsProps {
  hoveredCard: string | null;
  hoveredColumn: number | null;
  onCardHover: (cardKey: string | null) => void;
  onColumnHover: (column: number | null) => void;
  themes: string[];
}

function ThemeColumns({
  hoveredCard,
  hoveredColumn,
  onCardHover,
  onColumnHover,
  themes,
}: ThemeColumnsProps) {
  const columns = [
    { column: 1, visibilityClassName: "" },
    { column: 2, visibilityClassName: "hidden md:block" },
    { column: 3, visibilityClassName: "hidden xl:block" },
  ];

  return (
    <div className="flex h-full gap-8 px-8">
      {columns.map(({ column, visibilityClassName }) => {
        const isHovered = hoveredColumn === column;
        const handleColumnHover = (columnIsHovered: boolean) => {
          onColumnHover(columnIsHovered ? column : null);
        };

        return (
          <ThemeColumn
            key={column}
            column={column}
            hoveredCard={hoveredCard}
            isHovered={isHovered}
            onCardHover={onCardHover}
            onColumnHover={handleColumnHover}
            themes={themes}
            visibilityClassName={visibilityClassName}
          />
        );
      })}
    </div>
  );
}

export function ThemeShowcase({
  autoPlay: _autoPlay = true,
  speed = "medium",
  themes = [
    "oh-my-zsh",
    "dracula",
    "github-light",
    "github-dark",
    "solarized-light",
    "solarized-dark",
  ],
  dimOpacity = 0.3,
  children,
}: ThemeShowcaseProps) {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const config = getAnimationConfig(speed);
  const tripleThemes = [...themes, ...themes, ...themes];

  useScrollStyles(config.duration);

  return (
    <section className="relative overflow-hidden min-h-screen">
      <div className="absolute inset-0" style={{ opacity: dimOpacity }}>
        <div className="h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <ThemeColumns
            hoveredCard={hoveredCard}
            hoveredColumn={hoveredColumn}
            onCardHover={setHoveredCard}
            onColumnHover={setHoveredColumn}
            themes={tripleThemes}
          />
        </div>
      </div>

      <div className="relative z-20 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-4 text-center">{children}</div>
      </div>
    </section>
  );
}
