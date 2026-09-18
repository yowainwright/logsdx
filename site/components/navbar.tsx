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

function getActiveSection(scrollPosition: number) {
  const sections = navLinks.map((link) => link.href.substring(1));

  for (const section of sections) {
    const element = document.getElementById(section);
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const elementBottom = elementTop + element.offsetHeight;
    const isInSection =
      scrollPosition >= elementTop && scrollPosition < elementBottom;
    if (isInSection) return `#${section}`;
  }

  return "";
}

function useNavbarState() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
      if (scrollY < 300) {
        setActiveSection("");
        return;
      }
      setActiveSection(getActiveSection(scrollY + 100));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { activeSection, isScrolled, isVisible };
}

function NavbarBrand() {
  return (
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
  );
}

function handleNavClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  href: string,
) {
  event.preventDefault();
  const element = document.querySelector(href);
  if (!element) return;

  const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top: offsetTop, behavior: "smooth" });
}

function NavbarLinks({
  activeSection,
  onNavClick,
}: {
  activeSection: string;
  onNavClick: (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => void;
}) {
  return (
    <nav className="hidden md:flex items-center gap-4">
      {navLinks.map((link) => {
        const isActive = activeSection === link.href;
        const className = `text-sm transition-all ${
          isActive
            ? "font-bold text-slate-900 dark:text-slate-100"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        }`;

        return (
          <a
            key={link.href}
            href={link.href}
            onClick={(event) => onNavClick(event, link.href)}
            className={className}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}

function NavbarActions() {
  return (
    <div className="flex items-center gap-2 pr-8">
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
  );
}

export function Navbar() {
  const { activeSection, isScrolled, isVisible } = useNavbarState();

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
            <NavbarBrand />
            <NavbarLinks
              activeSection={activeSection}
              onNavClick={handleNavClick}
            />
          </div>

          <NavbarActions />
        </div>
      </div>
    </nav>
  );
}
