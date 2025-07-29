"use client"

import { useState, useEffect } from "react"
import { ThemePreviewCard } from "@/components/theme-preview-card"
import { Hero } from "@/components/hero"
import { ProblemSection } from "@/components/problem-section"
import { SetupSection } from "@/components/setup-section"
import { ExamplesSection } from "@/components/examples-section"
import { AdaptiveThemeDemo } from "@/components/adaptive-theme-demo"
// import { CustomThemeExamples } from "@/components/custom-theme-examples"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // All available themes from logsDx
  const themes = [
    "oh-my-zsh",
    "dracula", 
    "github-light",
    "github-dark",
    "solarized-light",
    "solarized-dark",
  ]

  return (
    <main className="min-h-screen">
      <Hero />
      
      {/* Theme Gallery Section */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Theme Gallery</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our built-in themes. Each theme provides consistent styling across terminal and browser environments.
            </p>
          </div>
          
          {/* Masonry-style grid with responsive columns */}
          <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
            {themes.map((theme) => (
              <div key={theme} className="break-inside-avoid">
                <ThemePreviewCard themeName={theme} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Adaptive Theming Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Adaptive Theming</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Themes that automatically adapt to system preferences and user settings
            </p>
          </div>
          <div className="flex justify-center">
            <AdaptiveThemeDemo />
          </div>
        </div>
      </section>

      {/* <CustomThemeExamples /> */}
      <ProblemSection />
      <SetupSection />
      <ExamplesSection />
    </main>
  )
}