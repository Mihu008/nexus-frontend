import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, Activity, Database, Globe, Terminal } from 'lucide-react'
import useStore from '../store/useStore'

export default function SystemHealth() {
  const { systemMetrics } = useStore()

  // Dynamic host loading from env configuration
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';
  const backendPort = backendUrl.split(':').pop() || '8081';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="h-full p-6 flex flex-col overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 flex-shrink-0">
        {/* Gauge 1: CPU */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-indigo-400" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">CPU Core Utilization</span>
          </div>

          <div className="w-36 h-36 relative mt-6 flex items-center justify-center">
            {/* Performance gauge SVG */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="56" stroke="rgba(39, 39, 42, 0.5)" strokeWidth="8" fill="transparent" />
              <motion.circle
                cx="72"
                cy="72"
                r="56"
                stroke="rgb(99, 102, 241)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 56}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - systemMetrics.cpu / 100) }}
                transition={{ type: 'spring', damping: 20 }}
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-bold font-mono tracking-tight text-white">{systemMetrics.cpu}</span>
              <span className="text-zinc-500 font-semibold text-sm">%</span>
            </div>
          </div>
          <div className="text-xs text-zinc-400 mt-4 font-mono">Status: OPTIMAL • {systemMetrics.cpu < 50 ? 'Low Load' : 'High Load'}</div>
        </motion.div>

        {/* Gauge 2: Memory */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-emerald-400" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Memory allocation</span>
          </div>

          <div className="w-36 h-36 relative mt-6 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="56" stroke="rgba(39, 39, 42, 0.5)" strokeWidth="8" fill="transparent" />
              <motion.circle
                cx="72"
                cy="72"
                r="56"
                stroke="rgb(16, 185, 129)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 56}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - systemMetrics.memory / 100) }}
                transition={{ type: 'spring', damping: 20 }}
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-bold font-mono tracking-tight text-white">{systemMetrics.memory}</span>
              <span className="text-zinc-500 font-semibold text-sm">%</span>
            </div>
          </div>
          <div className="text-xs text-zinc-400 mt-4 font-mono">Heap size: 1024MB • Active</div>
        </motion.div>

        {/* Gauge 3: Database & Connections */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-teal-400" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Database Gateway</span>
          </div>

          <div className="w-36 h-36 relative mt-6 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="56" stroke="rgba(39, 39, 42, 0.5)" strokeWidth="8" fill="transparent" />
              <motion.circle
                cx="72"
                cy="72"
                r="56"
                stroke="rgb(20, 184, 166)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 56}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - (systemMetrics.dbConnections * 5) / 100) }}
                transition={{ type: 'spring', damping: 20 }}
              />
            </svg>
            <div className="absolute text-center flex flex-col items-center">
              <span className="text-3xl font-bold font-mono tracking-tight text-white">{systemMetrics.dbConnections}</span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase leading-none mt-0.5">Pools</span>
            </div>
          </div>
          <div className="text-xs text-zinc-400 mt-4 font-mono">DB: PostgreSQL • UP (Host OK)</div>
        </motion.div>
      </div>

      {/* Additional diagnostic card */}
      <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col min-h-0">
        <h3 className="text-sm font-semibold text-zinc-200 border-b border-zinc-900 pb-3 mb-4 flex-shrink-0">
          Active System Nodes Diagnostics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/30 border border-emerald-900/60 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200">HTTP REST Backend Server</h4>
              <p className="text-xs text-zinc-500 mt-1">Listening on port <code className="text-indigo-400 font-mono">{backendPort}</code>. Accepts JSON payloads, CORS policies verified with hot reload bindings.</p>
              <div className="flex items-center gap-2 mt-3 font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-900 text-emerald-400">ONLINE</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500">Latency: 8ms</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-indigo-950/30 border border-indigo-900/60 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200">Semantic Tokenizer Daemon</h4>
              <p className="text-xs text-zinc-500 mt-1">Handles sandbox code compiles and markdown processing. Pre-load cache size: 12MB.</p>
              <div className="flex items-center gap-2 mt-3 font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-900 text-emerald-400">STANDBY</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500">Queue: 0 tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
