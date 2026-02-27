export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/75 backdrop-blur-xl border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-5 h-5">
              <ellipse cx="12" cy="6" rx="8" ry="3" />
              <path d="M4 6v4c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
              <path d="M4 10v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4" />
              <path d="M4 14v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4" />
            </svg>
            {/* Glow dot */}
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 leading-none">SQL RAG Agent</h1>
            <p className="text-xs text-slate-500 mt-0.5 leading-none">Powered by GPT-4o</p>
          </div>
        </div>

        {/* DB Badge */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-cyan-500">
              <ellipse cx="12" cy="6" rx="8" ry="3" />
              <path d="M4 6v4c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
              <path d="M4 10v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4" />
            </svg>
            <span className="text-slate-400 font-mono-code">chinook.db</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  )
}
