import React, { useState } from 'react'
import { Terminal, Play, RefreshCw, Square } from 'lucide-react'
import useNexusStore from '../../store/useNexusStore'

export default function PromptPanel() {
  const {
    status,
    executePrompt,
    stopExecutingPrompt
  } = useNexusStore()

  // Manage prompt inputs via clean local state to prevent redundant global re-renders
  const [prompt, setPrompt] = useState(
    'Generate an executive security analysis report for public REST API endpoints.'
  )

  const isExecuting = status === 'RUNNING'

  const handleExecute = () => {
    executePrompt(undefined, prompt)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault() // Stop standard newline generation
      if (!isExecuting && prompt.trim()) {
        handleExecute()
      }
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          Prompt Controller
        </span>
        <span className="text-[10px] font-mono text-zinc-500">
          Context: d:/Nexus
        </span>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a task prompt instruction (e.g. Generate database configurations or analyze pom.xml endpoint security)..."
        disabled={isExecuting}
        className="w-full h-28 px-4 py-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 resize-none font-sans transition-all disabled:opacity-50"
      />

      <div className="flex gap-3">
        {isExecuting ? (
          <>
            <button
              disabled
              className="flex-1 h-11 bg-zinc-900/60 border border-zinc-800 text-zinc-500 font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-all opacity-80"
            >
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-zinc-400 text-xs">Running AST Scan...</span>
            </button>
            <button
              onClick={stopExecutingPrompt}
              className="px-5 h-11 bg-red-950/30 hover:bg-red-950/50 border border-red-900/40 hover:border-red-500/50 text-red-400 hover:text-red-300 font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-950/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleExecute}
            disabled={!prompt.trim()}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-zinc-800 disabled:to-zinc-800 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:scale-100 disabled:opacity-50 group cursor-pointer"
          >
            <Play className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span>Execute Sentinel Agent</span>
          </button>
        )}
      </div>
    </div>
  )
}
