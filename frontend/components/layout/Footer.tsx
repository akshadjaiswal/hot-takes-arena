import { Flame, Github, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-sm">
                <Flame className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-amber-700">
                    Hot Takes Arena
                  </p>
                  <h2 className="text-xl font-bold text-text-primary">
                    Where opinions collide
                  </h2>
                </div>
                <p className="max-w-xl text-sm text-text-secondary">
                  Drop your spiciest takes and let the arena vote in real time. Anonymous posting, controversy scoring, and a community built for fearless debates.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    Anonymous by default
                  </span>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Live vote swings
                  </span>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-text-primary">
                    Community moderated
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-2xl border border-amber-100 bg-white/70 p-4 shadow-sm backdrop-blur md:items-end">
              <p className="text-sm font-semibold text-text-primary">
                Stay in the arena
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
                <a
                  href="https://github.com/akshadjaiswal/hot-takes-arena"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2 font-medium text-text-primary transition-colors hover:border-amber-300 hover:text-amber-700"
                  aria-label="Hot Takes Arena on GitHub"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  <span>Star the repo</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/akshadsantoshjaiswal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2 font-medium text-text-primary transition-colors hover:border-amber-300 hover:text-amber-700"
                  aria-label="Akshad Jaiswal on LinkedIn"
                >
                  <Linkedin className="h-4 w-4" aria-hidden="true" />
                  <span>Connect</span>
                </a>
                <a
                  href="https://x.com/akshad_999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2 font-medium text-text-primary transition-colors hover:border-amber-300 hover:text-amber-700"
                  aria-label="Follow Akshad on X"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-4 w-4 items-center justify-center rounded-full border border-stone-300 text-[0.6rem] font-semibold text-text-primary"
                  >
                    X
                  </span>
                  <span>Follow</span>
                </a>
              </div>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
              >
                <Flame className="h-4 w-4" aria-hidden="true" />
                <span>Drop a hot take</span>
              </a>
            </div>
          </div>

          <div className="h-px bg-stone-200" />

          <div className="flex flex-col gap-3 text-xs text-text-secondary sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} Hot Takes Arena. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="flex items-center gap-1 text-text-primary">
                Built by
                <a
                  href="https://github.com/akshadjaiswal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold transition-colors hover:text-amber-700"
                  aria-label="Akshad Jaiswal on GitHub"
                >
                  Akshad Jaiswal
                </a>
              </span>
              <span className="hidden text-stone-300 sm:inline">•</span>
              <a
                href="https://github.com/akshadjaiswal/hot-takes-arena"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-text-primary transition-colors hover:text-amber-700"
              >
                Open source contributions welcome
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
