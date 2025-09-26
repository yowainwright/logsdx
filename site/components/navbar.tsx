"use client";

import React, { useState, useEffect } from "react";
import { FaGithub } from "react-icons/fa";
import { ThemeToggle } from "./theme-toggle";
import { Search } from "./search";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            <a href="/" className="text-xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                logsDx
              </span>
            </a>
            <a
              href="#setup"
              className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors hidden sm:inline"
            >
              Docs
            </a>
          </div>

          <div className="flex items-center gap-2 pr-8">
            <Search />
            <Button
              variant="outline"
              size="icon"
              asChild
            >
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