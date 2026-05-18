import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import useNexusStore from '../store/useNexusStore'

export default function TaskHistory() {
  const { tasks, fetchTaskHistory } = useNexusStore()

  // Load active database transactions on component mount
  useEffect(() => {
    fetchTaskHistory()
  }, [fetchTaskHistory])

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
            <p className="text-xs text-zinc-500">Review historical agent transactions and compiler diagnostics</p>
          </div>
          <span className="px-2.5 py-1 bg-indigo-950/40 border border-indigo-900 text-indigo-400 rounded-lg text-xs font-mono">
            {tasks.length} Transactions
          </span>
        </div>

        {/* Tasks Table wrapper */}
        <div className="flex-1 overflow-y-auto">
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
                  <th className="px-6 py-3.5 text-left font-medium">Task ID</th>
                  <th className="px-6 py-3.5 text-left font-medium">Prompt Instruction</th>
                  <th className="px-6 py-3.5 text-left font-medium">Agent</th>
                  <th className="px-6 py-3.5 text-left font-medium">Execution Time</th>
                  <th className="px-6 py-3.5 text-left font-medium">Timestamp</th>
                  <th className="px-6 py-3.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                {tasks.map((task, idx) => {
                  const isCompleted = task.status === 'completed'
                  const isFailed = task.status === 'failed'

                  return (
                    <motion.tr
                      key={task.rawId || task.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-zinc-900/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-indigo-400">
                        {task.id}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium max-w-sm truncate text-zinc-300" title={task.prompt}>
                        {task.prompt}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400 font-mono">
                        {task.agent}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400 font-mono">
                        {task.duration}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500 font-mono">
                        {task.timestamp}
                      </td>
                      <td className="px-6 py-4 text-right">
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
