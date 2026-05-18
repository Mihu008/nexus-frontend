import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import useNexusStore from '../../store/useNexusStore'

export default function TerminalConsole() {
  const {
    logs,
    clearLogs,
    status
  } = useNexusStore()

  const isExecuting = status === 'RUNNING'
  const terminalEndRef = useRef(null)

  // Auto-scroll terminal on log change
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  return (
    <div className="glass-panel rounded-2xl p-5 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
            Nexus Logs
          </span>
        </div>
        <button
          onClick={clearLogs}
          disabled={isExecuting || logs.length === 0}
          className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-md hover:bg-zinc-800/50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Clear console"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Console body */}
      <div className="flex-1 bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 font-mono text-xs overflow-y-auto terminal-scroll space-y-2 select-text">
        {logs.map((log) => {
          let textClass = 'text-zinc-300'
          let typeHeader = '[INFO]'
          let typeClass = 'text-indigo-400 font-semibold'

          if (log.type === 'success') {
            textClass = 'text-emerald-300 font-medium'
            typeHeader = '[OK]'
            typeClass = 'text-emerald-400 font-bold'
          } else if (log.type === 'warning') {
            textClass = 'text-amber-200'
            typeHeader = '[WARN]'
            typeClass = 'text-amber-500 font-bold'
          } else if (log.type === 'error') {
            textClass = 'text-rose-300'
            typeHeader = '[FAIL]'
            typeClass = 'text-rose-500 font-bold'
          } else if (log.type === 'thought') {
            // THOUGHT level is styled in dimmed, italic grey
            textClass = 'text-zinc-500 font-normal italic'
            typeHeader = '[THOUGHT]'
            typeClass = 'text-zinc-600 font-semibold'
          } else if (log.type === 'tool_call') {
            // TOOL_CALL level is styled in glowing emerald
            textClass = 'text-emerald-400 font-semibold drop-shadow-[0_0_8px_rgba(16,185,129,0.15)]'
            typeHeader = '[TOOL_CALL]'
            typeClass = 'text-emerald-500 font-bold'
          } else if (log.type === 'input') {
            textClass = 'text-indigo-200 font-semibold'
            typeHeader = 'SYS@INPUT>'
            typeClass = 'text-indigo-400 font-bold'
          }

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="flex gap-2.5 leading-relaxed break-all hover:bg-zinc-900/10 py-0.5 px-1 rounded transition-colors"
            >
              <span className="text-zinc-600 flex-shrink-0 select-none">
                {log.timestamp}
              </span>
              <span className={`${typeClass} flex-shrink-0 select-none`}>
                {typeHeader}
              </span>
              <span className={textClass}>{log.text}</span>
            </motion.div>
          )
        })}

        {isExecuting && (
          <div className="flex items-center gap-2 text-indigo-400 animate-pulse pl-1 py-1">
            <span className="w-1.5 h-3 bg-indigo-500 animate-caret" />
            <span className="text-[11px] font-medium tracking-wide">Stream cursor actively processing...</span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  )
}
