import { useState, useRef } from 'react'
import { runQuery, QueryResult } from '../api'
import ResultTable from './ResultTable'

const PLACEHOLDER_QUERY = 'SELECT * FROM Artist LIMIT 10;'

export default function SqlEditor() {
  const [query, setQuery] = useState(PLACEHOLDER_QUERY)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleRun = async () => {
    if (!query.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await runQuery(query.trim())
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter → execute
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleRun()
      return
    }
    // Tab → insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = textareaRef.current!
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = query.substring(0, start) + '  ' + query.substring(end)
      setQuery(next)
      // restore cursor after state update
      requestAnimationFrame(() => {
        el.selectionStart = start + 2
        el.selectionEnd = start + 2
      })
    }
  }

  const handleClear = () => {
    setQuery('')
    setResult(null)
    setError(null)
    textareaRef.current?.focus()
  }

  return (
    <div className="space-y-4">
      {/* Editor card */}
      <div className="bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-sm transition-all duration-200 focus-within:border-slate-700 focus-within:shadow-cyan-500/5">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            {/* Traffic-light dots */}
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-700" />
              <span className="w-3 h-3 rounded-full bg-slate-700" />
              <span className="w-3 h-3 rounded-full bg-slate-700" />
            </div>
            <span className="text-xs text-slate-500 font-mono-code">query.sql</span>
            <span className="hidden sm:inline text-xs text-slate-700">·  Ctrl+Enter to run</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-800"
            >
              Clear
            </button>
            <button
              onClick={handleRun}
              disabled={loading || !query.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-semibold rounded-lg transition-all duration-150 shadow-lg shadow-cyan-500/25"
            >
              {loading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Execute
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor area with line numbers */}
        <div className="flex">
          {/* Line numbers */}
          <LineNumbers query={query} />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="-- Write your SQL query here..."
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="flex-1 bg-transparent text-slate-200 font-mono-code text-sm p-4 pl-3 resize-none outline-none placeholder-slate-700 min-h-[180px] leading-6"
            style={{ caretColor: '#06b6d4' }}
          />
        </div>
      </div>

      {/* Results */}
      <ResultTable result={result} error={error} />
    </div>
  )
}

function LineNumbers({ query }: { query: string }) {
  const lines = query.split('\n').length || 1
  return (
    <div
      className="select-none text-right pr-3 pl-4 pt-4 pb-4 text-slate-700 font-mono-code text-sm leading-6 border-r border-slate-800 bg-slate-900/40 min-w-[3rem]"
      aria-hidden="true"
    >
      {Array.from({ length: lines }, (_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  )
}
