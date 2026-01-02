"use client";

import { Navbar } from "@/components/navbar";
import { OutputComparison } from "@/components/output-comparison";
import { LogPlayground } from "@/components/log-playground";
import { CliDemo } from "@/components/cli-demo";
import { SchemaVisualization } from "@/components/schema-viz";

export default function DemosPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-6xl lg:text-7xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Live
              </span>{" "}
              Demos
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              See logsDX in action with real terminal and browser output
              comparisons
            </p>
          </div>
        </div>
      </section>

      <OutputComparison />
      <LogPlayground />
      <CliDemo />
      <SchemaVisualization />
    </main>
  );
}
