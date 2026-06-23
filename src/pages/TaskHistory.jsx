import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  CornerUpLeft, 
  Zap, 
  Activity, 
  Info 
} from 'lucide-react'
import useNexusStore from '../store/useNexusStore'

// A premium helper function to parse backend markdown into beautiful, styled JSX directly in the timeline audit bubbles
const renderMarkdown = (markdownText) => {
  if (!markdownText) return null;

  const lines = markdownText.split('\n');
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];

  const elements = lines.map((line, idx) => {
    // Check if we are inside a table
    if (line.trim().startsWith('|')) {
      inTable = true;
      const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
      
      // Skip separator line (e.g. | :--- | :---: |)
      if (line.includes('---') || line.includes(':---')) {
        return null;
      }

      if (tableHeaders.length === 0) {
        tableHeaders = cells;
        return null;
      } else {
        tableRows.push(cells);
        return null;
      }
    } else if (inTable) {
      // Table ended, compile it
      inTable = false;
      const currentHeaders = [...tableHeaders];
      const currentRows = [...tableRows];
      tableHeaders = [];
      tableRows = [];

      return (
        <div key={`table-${idx}`} className="my-3 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/60 select-text">
          <table className="min-w-full divide-y divide-zinc-800 text-xs">
            <thead className="bg-zinc-900/60">
              <tr>
                {currentHeaders.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-medium text-zinc-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {currentRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-zinc-900/35 transition-colors">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 text-zinc-350 font-mono text-[11px]">
                      {cell.startsWith('`') && cell.endsWith('`') ? (
                        <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-300 border border-zinc-700">{cell.replace(/`/g, '')}</code>
                      ) : cell.includes('**') ? (
                        <strong className="text-zinc-100 font-semibold">{cell.replace(/\*\*/g, '')}</strong>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    const trimmed = line.trim();

    // H1 Header
    if (trimmed.startsWith('# ')) {
      return (
        <h4 key={idx} className="text-sm font-bold text-slate-100 border-b border-zinc-800 pb-1 mt-4 mb-2 flex items-center gap-1.5 font-mono tracking-wide">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          {trimmed.replace('# ', '')}
        </h4>
      );
    }

    // H2 Header
    if (trimmed.startsWith('## ')) {
      return (
        <h5 key={idx} className="text-xs font-semibold text-zinc-200 mt-3 mb-1.5 flex items-center gap-1.5 font-mono">
          <Activity className="w-3 h-3 text-emerald-400" />
          {trimmed.replace('## ', '')}
        </h5>
      );
    }

    // Callout boxes (e.g. > [!NOTE], > [!WARNING])
    if (trimmed.startsWith('> [!')) {
      const isWarn = trimmed.includes('WARNING');
      const content = trimmed.replace(/> \[\!(NOTE|WARNING)\]/, '').trim();
      return (
        <div
          key={idx}
          className={`p-3 rounded-r-lg border-l-2 my-3 flex gap-2.5 ${
            isWarn
              ? 'bg-amber-950/20 border-amber-500 text-amber-200'
              : 'bg-indigo-950/20 border-indigo-500 text-indigo-200'
          }`}
        >
          {isWarn ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <Info className="w-4 h-4 flex-shrink-0" />}
          <div>
            <span className="text-xs opacity-95">{content}</span>
          </div>
        </div>
      );
    }

    // Checklist list items
    if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
      const checked = trimmed.startsWith('- [x]');
      const text = trimmed.replace(/- \[( |x)\]/, '').trim();
      return (
        <div key={idx} className="flex items-center gap-2.5 my-1.5 text-xs text-zinc-300 pl-1">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className={`w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-indigo-650 focus:ring-indigo-500 focus:ring-offset-zinc-950 ${
              checked ? 'accent-indigo-500' : ''
            }`}
          />
          <span className={checked ? 'line-through text-zinc-500' : 'text-zinc-300'}>{text}</span>
        </div>
      );
    }

    // Horizontal Rule
    if (trimmed === '---') {
      return <hr key={idx} className="my-4 border-zinc-800/80" />;
    }

    // Default paragraphs
    if (trimmed !== '') {
      // Process inline code blocks inside text
      let text = trimmed;
      const inlineCodeRegex = /`([^`]+)`/g;
      const parts = [];
      let lastIdx = 0;
      let match;

      while ((match = inlineCodeRegex.exec(text)) !== null) {
        if (match.index > lastIdx) {
          parts.push(text.substring(lastIdx, match.index));
        }
        parts.push(
          <code key={match.index} className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-900 text-indigo-400 font-mono text-[11px]">
            {match[1]}
          </code>
        );
        lastIdx = inlineCodeRegex.lastIndex;
      }

      if (lastIdx < text.length) {
        parts.push(text.substring(lastIdx));
      }

      return (
        <p key={idx} className="text-zinc-350 text-xs leading-relaxed my-2">
          {parts.length > 0 ? parts : text}
        </p>
      );
    }

    return null;
  });

  return <div className="space-y-0.5">{elements}</div>;
};

export default function TaskHistory() {
  const { tasks, fetchTaskHistory, restoreSession } = useNexusStore()
  const [expandedTaskId, setExpandedTaskId] = useState(null)

  // Load active database transactions on component mount
  useEffect(() => {
    fetchTaskHistory()
  }, [fetchTaskHistory])

  const toggleExpandRow = (taskId) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="h-full p-6 flex flex-col overflow-hidden"
    >
      <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col min-h-0">
        <div className="pb-4 border-b border-zinc-900 mb-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-md font-semibold text-zinc-200">Execution Audit Log</h3>
            <p className="text-xs text-zinc-500">Review historical agent transactions and compiler diagnostics (Click rows to expand streams)</p>
          </div>
          <span className="px-2.5 py-1 bg-indigo-950/40 border border-indigo-900 text-indigo-400 rounded-lg text-xs font-mono">
            {tasks.length} Transactions
          </span>
        </div>

        <div className="flex-1 overflow-auto w-full">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center select-none">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-xs text-zinc-400 font-mono">No execution records found in database.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-zinc-900 text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase font-mono tracking-wider border-b border-zinc-900">
                  <th className="px-4 md:px-6 py-3.5 text-left font-medium">Task ID</th>
                  <th className="px-4 md:px-6 py-3.5 text-left font-medium">Prompt Instruction</th>
                  <th className="px-4 md:px-6 py-3.5 text-left font-medium hidden md:table-cell">Agent</th>
                  <th className="px-4 md:px-6 py-3.5 text-left font-medium hidden sm:table-cell">Execution Time</th>
                  <th className="px-4 md:px-6 py-3.5 text-left font-medium hidden lg:table-cell">Timestamp</th>
                  <th className="px-4 md:px-6 py-3.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                {tasks.map((task, idx) => {
                  const isCompleted = task.status === 'completed'
                  const isFailed = task.status === 'failed'
                  const isExpanded = expandedTaskId === task.id

                  return (
                    <React.Fragment key={task.rawId || task.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => toggleExpandRow(task.id)}
                        className={`hover:bg-zinc-900/30 transition-colors cursor-pointer select-none ${isExpanded ? 'bg-zinc-900/20' : ''}`}
                      >
                        <td className="px-4 md:px-6 py-4 font-mono text-xs font-semibold text-indigo-400">
                          {task.id}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs font-medium max-w-[150px] sm:max-w-sm truncate text-zinc-300" title={task.prompt}>
                          {task.prompt}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs text-zinc-400 font-mono hidden md:table-cell">
                          {task.agent}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs text-zinc-400 font-mono hidden sm:table-cell">
                          {task.duration}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs text-zinc-500 font-mono hidden lg:table-cell">
                          {task.timestamp}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-right">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase border bg-emerald-950/30 border-emerald-900/60 text-emerald-400">
                              <CheckCircle className="w-2.5 h-2.5" />
                              <span>Success</span>
                            </span>
                          ) : isFailed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase border bg-rose-950/30 border-rose-900/60 text-rose-400">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Failed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase border bg-amber-950/30 border-amber-900/60 text-amber-400 animate-pulse">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              <span>Processing</span>
                            </span>
                          )}
                        </td>
                      </motion.tr>

                      {/* Timeline Expandable Dropdown */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <tr className="bg-zinc-950/40 border-b border-zinc-900/80">
                            <td colSpan={6} className="px-4 md:px-6 py-5">
                              <motion.div
                                initial={{ opacity: 0, height: 0, y: -6 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -6 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-5 text-left overflow-hidden"
                              >
                                <div className="flex items-center justify-between gap-4 border-b border-zinc-900/80 pb-3 flex-wrap">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
                                      Conversation Stream Audit
                                    </span>
                                    <span className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                                      Chronological telemetry timeline for session {task.id}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      restoreSession(task.rawId || task.id)
                                    }}
                                    className="px-3 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-900/80 hover:border-indigo-500/50 text-indigo-450 hover:text-indigo-305 text-indigo-400 hover:text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer font-mono"
                                  >
                                    <CornerUpLeft className="w-3.5 h-3.5" />
                                    Restore Session
                                  </button>
                                </div>

                                <div className="border-l-2 border-zinc-900 ml-2 pl-4 py-1 space-y-4">
                                  {task.conversations && task.conversations.map((msg) => {
                                    const isUserMsg = msg.sender === 'user'
                                    return (
                                      <div key={msg.id} className="relative flex flex-col gap-2.5 group">
                                        {/* Timeline Node dot */}
                                        <div className={`absolute left-[-21px] top-1.5 w-2 h-2 rounded-full border border-zinc-950 ring-4 ring-zinc-950/90 transition-colors duration-200 ${
                                          isUserMsg 
                                            ? 'bg-indigo-650 group-hover:bg-indigo-400' 
                                            : 'bg-emerald-650 group-hover:bg-emerald-400'
                                        }`} />

                                        {/* Message block */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                                            <span className={isUserMsg ? 'text-indigo-450 text-indigo-405 text-indigo-400 font-semibold' : 'text-emerald-450 text-emerald-405 text-emerald-400 font-semibold'}>
                                              {isUserMsg ? 'Operator Prompt' : 'AI Agent Response'}
                                            </span>
                                            <span>•</span>
                                            <span>{msg.timestamp}</span>
                                          </div>

                                          <div className={`p-4 rounded-xl border text-xs max-w-full leading-relaxed font-sans select-text ${
                                            isUserMsg
                                              ? 'bg-zinc-950/60 border-zinc-900/80 text-zinc-200 shadow-inner'
                                              : 'bg-zinc-900/15 border-zinc-900/40 text-zinc-300'
                                          }`}>
                                            {isUserMsg ? (
                                              <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                                            ) : (
                                              <div className="select-text">{renderMarkdown(msg.text)}</div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  )
}
