import React, { useState, useRef, useEffect } from 'react'
import { askAI } from '../api'

interface Message {
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  isError?: boolean
}

const SUGGESTIONS = [
  'Show me the top 5 selling artists',
  'Which genre has the most tracks?',
  'List albums from 2000 onwards',
  'Who are the top 3 customers by revenue?',
]

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await askAI(trimmed)
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: data.response, timestamp: new Date() },
      ])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: e instanceof Error ? e.message : 'Something went wrong. Please try again.',
          timestamp: new Date(),
          isError: true,
        },
      ])
    } finally {
      setLoading(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '520px' }}>
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-5 pb-2 pr-1">
        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-cyan-500/60">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 font-medium text-base">Ask anything about your database</p>
              <p className="text-slate-600 text-sm mt-1">I'll write the SQL and return the answer</p>
            </div>
            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-3 py-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-full hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-slate-800 transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}

        {/* Loading bubble */}
        {loading && (
          <div className="flex gap-3 items-end animate-fade-slide-in">
            <AiAvatar />
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '160ms' }} />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '320ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-slate-800/60">
        <div className="flex gap-3 items-end bg-slate-900/80 border border-slate-800 rounded-2xl p-3 focus-within:border-cyan-500/40 focus-within:shadow-lg focus-within:shadow-cyan-500/5 transition-all duration-200 backdrop-blur-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your data…"
            rows={1}
            className="flex-1 bg-transparent text-slate-200 text-sm outline-none resize-none placeholder-slate-600 leading-relaxed max-h-40"
            style={{ caretColor: '#06b6d4' }}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="w-9 h-9 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all duration-150 shadow-lg shadow-cyan-500/25 flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-950 translate-x-px">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-700 mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

function renderInline(text: string): React.ReactNode[] {
  // Split on **bold** and *italic* tokens
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

function MarkdownText({ text, isUser }: { text: string; isUser: boolean }) {
  const lines = text.split('\n')

  return (
    <div className="space-y-1 break-words">
      {lines.map((line, i) => {
        // Numbered list item: "1. something"
        const listMatch = line.match(/^(\d+)\.\s+(.+)/)
        if (listMatch) {
          return (
            <div key={i} className="flex gap-2">
              <span className={`flex-shrink-0 font-semibold ${isUser ? 'text-cyan-900' : 'text-cyan-400'}`}>
                {listMatch[1]}.
              </span>
              <span>{renderInline(listMatch[2])}</span>
            </div>
          )
        }
        // Empty line → small spacer
        if (!line.trim()) return <div key={i} className="h-1" />
        // Normal line
        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 items-end animate-fade-slide-in ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && <AiAvatar />}

      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
          isUser
            ? 'bg-cyan-500 text-slate-950 rounded-br-sm shadow-cyan-500/20'
            : message.isError
            ? 'bg-red-950/40 border border-red-800/50 text-red-300 rounded-bl-sm'
            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
        }`}
      >
        <MarkdownText text={message.content} isUser={isUser} />
        <p className={`text-xs mt-1.5 ${isUser ? 'text-cyan-800' : 'text-slate-600'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

function AiAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    </div>
  )
}
