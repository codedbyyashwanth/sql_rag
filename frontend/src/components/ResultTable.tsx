import { QueryResult } from '../api'

interface Props {
  result: QueryResult | null
  error: string | null
}

export default function ResultTable({ result, error }: Props) {
  if (error) {
    return (
      <div className="mt-4 flex items-start gap-3 p-4 bg-red-950/30 border border-red-800/50 rounded-xl animate-fade-slide-in">
        <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-red-400">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-red-400">Query Error</p>
          <p className="text-xs text-red-400/80 mt-0.5 font-mono-code">{error}</p>
        </div>
      </div>
    )
  }

  if (!result) return null

  if (result.row_count === 0) {
    return (
      <div className="mt-4 flex items-center gap-3 p-5 bg-slate-900/60 border border-slate-800 rounded-xl animate-fade-slide-in">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-slate-600 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <p className="text-sm text-slate-500">Query executed successfully — no rows returned</p>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-2 animate-fade-slide-in">
      {/* Meta bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-emerald-400 font-medium">{result.row_count}</span> row{result.row_count !== 1 ? 's' : ''} returned
          </span>
          <span className="text-slate-700">|</span>
          <span>{result.columns.length} column{result.columns.length !== 1 ? 's' : ''}</span>
        </div>
        <span className="font-mono-code text-slate-600">SQLite</span>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-xl border border-slate-800 max-h-[520px] shadow-xl">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-800/90 sticky top-0 backdrop-blur-sm">
              {/* Row number header */}
              <th className="px-3 py-3 text-left font-semibold text-slate-600 border-r border-slate-700/60 w-10 select-none">
                #
              </th>
              {result.columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-semibold text-cyan-400/90 border-r border-slate-700/60 last:border-r-0 whitespace-nowrap font-mono-code tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-t border-slate-800/50 hover:bg-slate-800/30 transition-colors duration-100 group"
              >
                {/* Row number */}
                <td className="px-3 py-2.5 text-slate-700 border-r border-slate-800/40 font-mono-code select-none group-hover:text-slate-600 transition-colors">
                  {rowIdx + 1}
                </td>
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="px-4 py-2.5 text-slate-300 border-r border-slate-800/40 last:border-r-0 font-mono-code max-w-xs"
                  >
                    {cell === 'NULL' ? (
                      <span className="text-slate-600 italic text-xs">NULL</span>
                    ) : (
                      <span className="truncate block" title={cell}>
                        {cell}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
