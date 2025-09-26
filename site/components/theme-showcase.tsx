"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { FaGithub } from "react-icons/fa";
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

export function ThemeShowcase({
  autoPlay = true,
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
  const [isCol1Hovered, setIsCol1Hovered] = useState(false);
  const [isCol2Hovered, setIsCol2Hovered] = useState(false);
  const [isCol3Hovered, setIsCol3Hovered] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const config = getAnimationConfig(speed);
  const tripleThemes = [...themes, ...themes, ...themes];

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
        animation: scrollColumn1 ${config.duration}s linear infinite;
      }

      .scroll-animation-2 {
        animation: scrollColumn2 ${config.duration}s linear infinite;
      }

      .scroll-animation-3 {
        animation: scrollColumn3 ${config.duration}s linear infinite;
      }

      .animation-paused {
        animation-play-state: paused !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [config]);

  return (
    <section className="relative overflow-hidden min-h-screen">
      <div className="absolute inset-0" style={{ opacity: dimOpacity }}>
        <div className="h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <div className="flex h-full gap-8 px-8">
            {/* Column 1 */}
            <div
              className="flex-1 overflow-hidden"
              onMouseEnter={() => setIsCol1Hovered(true)}
              onMouseLeave={() => {
                setIsCol1Hovered(false);
                setHoveredCard(null);
              }}
            >
              <div
                className={`scroll-animation-1 ${isCol1Hovered ? "animation-paused" : ""}`}
              >
                <div className="space-y-4 py-4">
                  {tripleThemes.map((theme, i) => (
                    <div
                      key={`col1-${theme}-${i}`}
                      style={{
                        opacity:
                          hoveredCard === `col1-${theme}-${i}`
                            ? 1
                            : isCol1Hovered
                              ? 0.5
                              : 0.7,
                        transform:
                          hoveredCard === `col1-${theme}-${i}`
                            ? "scale(1.02)"
                            : "scale(1)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={() => setHoveredCard(`col1-${theme}-${i}`)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <ThemeCard themeName={theme} isVisible={true} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div
              className="flex-1 overflow-hidden hidden md:block"
              onMouseEnter={() => setIsCol2Hovered(true)}
              onMouseLeave={() => {
                setIsCol2Hovered(false);
                setHoveredCard(null);
              }}
            >
              <div
                className={`scroll-animation-2 ${isCol2Hovered ? "animation-paused" : ""}`}
              >
                <div className="space-y-4 py-4">
                  {tripleThemes.map((theme, i) => (
                    <div
                      key={`col2-${theme}-${i}`}
                      style={{
                        opacity:
                          hoveredCard === `col2-${theme}-${i}`
                            ? 1
                            : isCol2Hovered
                              ? 0.5
                              : 0.7,
                        transform:
                          hoveredCard === `col2-${theme}-${i}`
                            ? "scale(1.02)"
                            : "scale(1)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={() => setHoveredCard(`col2-${theme}-${i}`)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <ThemeCard themeName={theme} isVisible={true} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div
              className="flex-1 overflow-hidden hidden xl:block"
              onMouseEnter={() => setIsCol3Hovered(true)}
              onMouseLeave={() => {
                setIsCol3Hovered(false);
                setHoveredCard(null);
              }}
            >
              <div
                className={`scroll-animation-3 ${isCol3Hovered ? "animation-paused" : ""}`}
              >
                <div className="space-y-4 py-4">
                  {tripleThemes.map((theme, i) => (
                    <div
                      key={`col3-${theme}-${i}`}
                      style={{
                        opacity:
                          hoveredCard === `col3-${theme}-${i}`
                            ? 1
                            : isCol3Hovered
                              ? 0.5
                              : 0.7,
                        transform:
                          hoveredCard === `col3-${theme}-${i}`
                            ? "scale(1.02)"
                            : "scale(1)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={() => setHoveredCard(`col3-${theme}-${i}`)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <ThemeCard themeName={theme} isVisible={true} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-4 text-center">{children}</div>
      </div>
    </section>
  );
}
