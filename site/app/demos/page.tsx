"use client";

import { Navbar } from "@/components/navbar";
import { OutputComparison } from "@/components/output-comparison";
import { LogPlayground } from "@/components/log-playground";
import { NavCard } from "@/components/nav-card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Card, CardContent } from "@/components/ui/card";

function Separator() {
  return (
    <div className="w-full flex justify-center py-8">
      <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
    </div>
  );
}

export default function DemosPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="mx-auto max-w-4xl text-center">
              <h1
                className="mb-6 text-6xl lg:text-7xl font-bold"
                style={{
                  filter:
                    "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                }}
              >
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Live
                </span>{" "}
                Demos
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">
                See logsDX in action with real terminal and browser output
                comparisons
              </p>
              <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                <NavCard
                  title="Output Comparison"
                  href="#output-comparison"
                  previewLight="/images/demos/output-comparison-light.png"
                  previewDark="/images/demos/output-comparison-dark.png"
                />
                <NavCard
                  title="Log Playground"
                  href="#playground"
                  previewLight="/images/demos/log-playground-light.png"
                  previewDark="/images/demos/log-playground-dark.png"
                />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <AnimatedSection>
        <div className="py-8">
          <OutputComparison />
        </div>
      </AnimatedSection>

      <Separator />

      <AnimatedSection delay={100}>
        <div className="py-8 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50">
          <div className="container mx-auto px-4">
            <Card className="mx-auto max-w-6xl rounded-2xl border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <LogPlayground />
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
