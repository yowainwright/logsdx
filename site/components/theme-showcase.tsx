"use client";

import React, { useState, useEffect } from "react";
import { ThemeCard } from "./theme-card";

interface ThemeShowcaseProps {
  autoPlay?: boolean;
  speed?: "slow" | "medium" | "fast";
  visibleCards?: number;
  themes?: string[];
  dimOpacity?: number;
  children?: React.ReactNode; // For headline overlay content
}

// Animation configuration based on speed
const getAnimationConfig = (speed: "slow" | "medium" | "fast") => {
  const configs = {
    slow: { duration: 20, stagger: 2 },
    medium: { duration: 15, stagger: 1.5 },
    fast: { duration: 10, stagger: 1 },
  };
  return configs[speed];
};

// ShowcaseContainer component for animation wrapper
function ShowcaseContainer({
  children,
  speed,
  autoPlay,
}: {
  children: React.ReactNode;
  speed: "slow" | "medium" | "fast";
  autoPlay: boolean;
}) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const config = getAnimationConfig(speed);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Multi-column layout for desktop, single column for mobile */}
      <div className="flex h-full">
        {/* Column 1 */}
        <div className="flex-1 relative overflow-hidden">
          <div
            className={`${!isReducedMotion && autoPlay ? "animate-slot-machine-1" : ""}`}
            style={{
              animationDuration: !isReducedMotion
                ? `${config.duration}s`
                : undefined,
              animationDelay: !isReducedMotion ? "0s" : undefined,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
            }}
          >
            {children}
          </div>
        </div>

        {/* Column 2 - Hidden on mobile */}
        <div className="flex-1 relative overflow-hidden hidden md:block">
          <div
            className={`${!isReducedMotion && autoPlay ? "animate-slot-machine-2" : ""}`}
            style={{
              animationDuration: !isReducedMotion
                ? `${config.duration}s`
                : undefined,
              animationDelay: !isReducedMotion
                ? `${config.stagger}s`
                : undefined,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
            }}
          >
            {children}
          </div>
        </div>

        {/* Column 3 - Hidden on tablet and mobile */}
        <div className="flex-1 relative overflow-hidden hidden xl:block">
          <div
            className={`${!isReducedMotion && autoPlay ? "animate-slot-machine-3" : ""}`}
            style={{
              animationDuration: !isReducedMotion
                ? `${config.duration}s`
                : undefined,
              animationDelay: !isReducedMotion
                ? `${config.stagger * 2}s`
                : undefined,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThemeShowcase({
  autoPlay = true,
  speed = "medium",
  visibleCards = 6,
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
  // Create extended theme list for infinite scroll effect
  const extendedThemes = [...themes, ...themes, ...themes];

  return (
    <section className="relative overflow-hidden min-h-screen">
      {/* Background Animation Container */}
      <div className="absolute inset-0" style={{ opacity: dimOpacity }}>
        <div className="h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <ShowcaseContainer speed={speed} autoPlay={autoPlay}>
            <div className="space-y-6 p-6">
              {/* Triple the themes for seamless infinite scroll */}
              {[...themes, ...themes, ...themes].map((theme, i) => (
                <ThemeCard
                  key={`${theme}-${i}`}
                  themeName={theme}
                  animationDelay={i * 0.5}
                  isVisible={true}
                />
              ))}
            </div>
          </ShowcaseContainer>
        </div>
      </div>

      {/* Headline Overlay */}
      <div className="relative z-20 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-4 text-center">{children}</div>
      </div>
    </section>
  );
}
