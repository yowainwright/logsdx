"use client";

import React, { useState, useEffect } from "react";
import { FaGithub } from "react-icons/fa";
import { ThemeToggle } from "./theme-toggle";
import { Search } from "./search";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#problem", label: "Why" },
  { href: "#setup", label: "Quick Start" },
  { href: "#examples", label: "Themes" },
  { href: "#theme-creator", label: "Theme Generator" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (window.scrollY < 300) {
        setActiveSection("");
        return;
      }

      const sections = navLinks.map((link) => link.href.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + element.offsetHeight;

          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            setActiveSection(`#${section}`);
            return;
          }
        }
      }

      setActiveSection("");
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offsetTop =
        element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6 pl-8">
            <a href="/" className="text-xl font-bold flex items-center">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                logsDx
              </span>
              <span
                className="inline-block animate-pulse"
                style={{
                  width: "3px",
                  height: "1.25rem",
                  backgroundColor: "#ef4444",
                  marginLeft: "2px",
                }}
              ></span>
            </a>

            <nav className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`text-sm transition-all ${
                    activeSection === link.href
                      ? "font-bold text-slate-900 dark:text-slate-100"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 pr-8">
            {/* Docs link hidden for now */}
            {/* <a
              href="https://docs.claude.com/en/docs/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3"
            >
              Docs
            </a> */}
            <Search />
            <Button variant="outline" size="icon" asChild>
              <a
                href="https://github.com/yowainwright/logsdx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
