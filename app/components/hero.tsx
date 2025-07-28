import React from "react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-24">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              logsDx
            </span>
          </h1>
          <p className="mb-8 text-xl text-slate-600 dark:text-slate-400">
            Schema-based styling layer that makes logs look identical between terminal and browser environments
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#setup"
              className="rounded-lg bg-slate-900 px-6 py-3 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Get Started
            </a>
            <a
              href="https://github.com/yourusername/logsdx"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}