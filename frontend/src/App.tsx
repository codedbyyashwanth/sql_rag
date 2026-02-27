import { useState } from 'react'
import Header from './components/Header'
import SqlEditor from './components/SqlEditor'
import AiChat from './components/AiChat'

type Tab = 'sql' | 'ai'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('sql')

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Tab Bar */}
        <div className="flex items-center gap-1 mb-6 bg-slate-900/80 p-1 rounded-xl border border-slate-800 w-fit backdrop-blur-sm">
          <TabButton
            label="SQL Query"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            }
            active={activeTab === 'sql'}
            onClick={() => setActiveTab('sql')}
          />
          <TabButton
            label="Ask AI"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            }
            active={activeTab === 'ai'}
            onClick={() => setActiveTab('ai')}
          />
        </div>

        {/* Panels */}
        <div className={activeTab === 'sql' ? 'block' : 'hidden'}>
          <SqlEditor />
        </div>
        <div className={activeTab === 'ai' ? 'block' : 'hidden'}>
          <AiChat />
        </div>
      </main>
    </div>
  )
}

interface TabButtonProps {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}

function TabButton({ label, icon, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
