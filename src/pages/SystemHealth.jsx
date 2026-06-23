import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cpu, 
  Activity, 
  Database, 
  Globe, 
  Terminal, 
  Zap, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react'
import useStore from '../store/useStore'
import useNexusStore from '../store/useNexusStore'

// Self-contained reusable Sparkline Component
const Sparkline = ({ data, colorClass = "text-indigo-500", width = 140, height = 28, maxVal = 100, minVal = 0 }) => {
  if (!data || data.length === 0) return null;
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    const range = maxVal - minVal;
    const y = height - (range > 0 ? ((clamped - minVal) / range) * height : height / 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const pathData = `M ${points.join(' L ')}`;

  return (
    <div className="w-full flex justify-center mt-3 mb-1" style={{ height }}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Glow Line */}
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={`${colorClass} opacity-20 blur-[1px] transition-all duration-300`}
        />
        {/* Core Line */}
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className={`${colorClass} transition-all duration-300`}
        />
      </svg>
    </div>
  );
};

export default function SystemHealth() {
  const { 
    systemMetrics, 
    oscillateMetrics, 
    clearLogs, 
    addLog, 
    setRateLimit, 
    resetMetrics 
  } = useStore()

  // Dynamic host loading from env configuration
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';
  const backendPort = backendUrl.split(':').pop() || '8081';

  // State to hold running histories for the sparkline charts
  const [cpuHistory, setCpuHistory] = useState(() => Array(30).fill(24))
  const [memHistory, setMemHistory] = useState(() => Array(30).fill(42.8))
  const [dbHistory, setDbHistory] = useState(() => Array(30).fill(14))
  const [tpHistory, setTpHistory] = useState(() => Array(30).fill(350))

  // State for interactive diagnostics nodes
  const [nodes, setNodes] = useState([
    {
      id: 'core-gateway',
      name: 'Core Gateway Node',
      address: `localhost:${backendPort}`,
      status: 'active', // active | degraded | rate_limited
      latency: 8,
      details: 'Accepts API payloads, CORS policies verified with hot reload bindings.',
      icon: Globe
    },
    {
      id: 'mcp-executor',
      name: 'MCP Health Executor',
      address: 'localhost:8082',
      status: 'active',
      latency: 12,
      details: 'Executes Model Context Protocol (MCP) health checks and tool discovery.',
      icon: Terminal
    },
    {
      id: 'db-broker',
      name: 'Database Sync Broker',
      address: 'localhost:8083',
      status: 'active',
      latency: 15,
      details: 'Handles database sync, replication pools, and asynchronous event streams.',
      icon: Database
    }
  ])

  // State for success/error alert toasts
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  // 1s Interval to run metrics oscillation
  useEffect(() => {
    const timer = setInterval(() => {
      oscillateMetrics()
    }, 1000)

    return () => clearInterval(timer)
  }, [oscillateMetrics])

  // Append new metric points to histories whenever systemMetrics updates in store
  useEffect(() => {
    setCpuHistory(prev => [...prev.slice(1), systemMetrics.cpu])
    setMemHistory(prev => [...prev.slice(1), systemMetrics.memory])
    setDbHistory(prev => [...prev.slice(1), systemMetrics.dbConnections])
    setTpHistory(prev => [...prev.slice(1), systemMetrics.rateLimitActive ? 0 : (systemMetrics.tokenThroughput ?? 350)])
  }, [systemMetrics.cpu, systemMetrics.memory, systemMetrics.dbConnections, systemMetrics.tokenThroughput, systemMetrics.rateLimitActive])

  // Click handler to toggle 429 Rate Limit block manually
  const handleToggleRateLimit = () => {
    if (systemMetrics.rateLimitActive) {
      setRateLimit(false, 0)
      addLog("[SYSTEM] Operator override: Cleared active rate limit block.", "success")
      showToast("Rate limit block cleared.", "success")
    } else {
      setRateLimit(true, 15) // Trigger 15s rate limit
      addLog("[SYSTEM] Operator simulated 429 Rate Limit (15s reset countdown).", "warning")
      showToast("429 Rate Limit simulated (15s countdown).", "error")
    }
  }

  // Cycle node status on click
  const cycleNodeStatus = (nodeId) => {
    setNodes(prevNodes => prevNodes.map(node => {
      if (node.id === nodeId) {
        let nextStatus = 'active'
        let nextLatency = node.latency
        if (node.status === 'active') {
          nextStatus = 'degraded'
          nextLatency = Math.floor(Math.random() * 200) + 150
        } else if (node.status === 'degraded') {
          nextStatus = 'rate_limited'
          nextLatency = 999
        } else {
          nextStatus = 'active'
          nextLatency = Math.floor(Math.random() * 10) + 5
        }
        
        const statusLabels = { active: '🟢 ACTIVE', degraded: '🟡 DEGRADED', rate_limited: '🔴 RATE LIMITED' };
        addLog(`[SYSTEM] Node ${node.name} status updated to ${statusLabels[nextStatus]} (Ping: ${nextLatency}ms).`, nextStatus === 'active' ? 'success' : nextStatus === 'degraded' ? 'warning' : 'error')
        
        return {
          ...node,
          status: nextStatus,
          latency: nextLatency
        }
      }
      return node
    }))
  }

  // Purge Session Cache Action
  const handlePurgeCache = () => {
    clearLogs()
    useNexusStore.setState({
      messages: [
        {
          id: 'welcome',
          sender: 'ai',
          isStreaming: false,
          currentStatus: '',
          conversationText: 'Hello! I am the Nexus AI Sentinel Agent. How can I help you research, verify, or build today?',
          thinkingLogs: [],
          artifact: null,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        }
      ],
      logs: [],
      status: 'IDLE',
      currentTaskId: null,
      activeArtifact: null,
      finalArtifact: null,
      isArtifactPanelOpen: false
    })
    
    addLog("[SYSTEM] Session memory stacks and conversation history purged by operator.", "success")
    showToast("Session memory stacks and logs purged.", "success")
  }

  // Force Terminate Agents Action
  const handleForceTerminate = async () => {
    const { stopExecutingPrompt } = useNexusStore.getState()
    await stopExecutingPrompt()
    
    useStore.setState({
      isExecuting: false
    })
    resetMetrics()
    
    addLog("[SYSTEM] Force termination signal sent. Runaway AI loops aborted.", "error")
    showToast("Emergency global abort triggered. AI loop terminated.", "error")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="w-full h-full overflow-y-auto p-4 md:p-6 pb-20 flex flex-col gap-6 relative"
    >
      {/* 4-Column Responsive Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 flex-shrink-0">
        
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

          {/* CPU Sparkline */}
          <Sparkline data={cpuHistory} colorClass="text-indigo-400" maxVal={100} />

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

          {/* Memory Sparkline */}
          <Sparkline data={memHistory} colorClass="text-emerald-400" maxVal={100} />

          <div className="text-xs text-zinc-400 mt-4 font-mono">Heap size: 1024MB • Active</div>
        </motion.div>

        {/* Gauge 3: Database Gateway */}
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

          {/* DB Sparkline */}
          <Sparkline data={dbHistory} colorClass="text-teal-400" maxVal={20} />

          <div className="text-xs text-zinc-400 mt-4 font-mono">DB: PostgreSQL • UP (Host OK)</div>
        </motion.div>

        {/* Gauge 4: LLM Operations & Throttle Status */}
        <motion.div
          whileHover={{ y: -4 }}
          onClick={handleToggleRateLimit}
          className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none group"
          title="Click to toggle simulated 429 Rate Limit"
        >
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className={`w-4.5 h-4.5 ${systemMetrics.rateLimitActive ? 'text-rose-400 animate-bounce' : 'text-violet-400'}`} />
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">AI Ingestion & Limits</span>
            </div>
            {systemMetrics.rateLimitActive && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </div>

          <div className="w-36 h-36 relative mt-6 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="56" stroke="rgba(39, 39, 42, 0.5)" strokeWidth="8" fill="transparent" />
              <motion.circle
                cx="72"
                cy="72"
                r="56"
                stroke={systemMetrics.rateLimitActive ? 'rgb(239, 68, 68)' : 'rgb(139, 92, 246)'}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 56}
                animate={{ 
                  strokeDashoffset: 2 * Math.PI * 56 * (1 - (systemMetrics.rateLimitActive ? 0 : (systemMetrics.tokenThroughput || 350) / 1000)) 
                }}
                transition={{ type: 'spring', damping: 20 }}
              />
            </svg>
            <div className="absolute text-center flex flex-col items-center justify-center">
              {systemMetrics.rateLimitActive ? (
                <>
                  <span className="text-2xl font-extrabold font-mono tracking-tight text-rose-500 animate-pulse">429</span>
                  <span className="text-[9px] text-rose-400 font-bold uppercase leading-none mt-0.5">BLOCKED</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold font-mono tracking-tight text-white">
                    {systemMetrics.tokenThroughput || 0}
                  </span>
                  <span className="text-zinc-500 font-semibold text-xs leading-none mt-0.5">t/s</span>
                </>
              )}
            </div>
          </div>

          {/* Throughput Sparkline */}
          <Sparkline 
            data={tpHistory} 
            colorClass={systemMetrics.rateLimitActive ? "text-rose-400" : "text-violet-400"} 
            maxVal={1000} 
          />

          <div className="text-xs mt-4 font-mono flex items-center gap-1.5 transition-colors duration-200">
            {systemMetrics.rateLimitActive ? (
              <span className="text-rose-400 font-bold animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                RATE LIMITED: {systemMetrics.rateLimitCountdown}s
              </span>
            ) : (
              <span className="text-zinc-400 group-hover:text-zinc-200">
                Status: ACTIVE • Click to test 429
              </span>
            )}
          </div>
        </motion.div>

      </div>

      {/* Supercharged Active System Nodes Diagnostics Section */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col">
        <h3 className="text-sm font-semibold text-zinc-200 border-b border-zinc-900 pb-3 mb-4 flex-shrink-0 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Active System Nodes Diagnostics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {nodes.map((node) => {
            const NodeIcon = node.icon;
            
            // Determine styling based on node status
            let statusText = '';
            let statusBadgeClass = '';
            let ringGlowClass = '';
            let iconClass = '';
            
            if (node.status === 'active') {
              statusText = '🟢 Active';
              statusBadgeClass = 'text-emerald-400 bg-emerald-950/60 border border-emerald-900/80 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
              ringGlowClass = 'border-emerald-950/80 shadow-[0_0_15px_rgba(16,185,129,0.04)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/30';
              iconClass = 'bg-emerald-950/20 border-emerald-900/60 text-emerald-400';
            } else if (node.status === 'degraded') {
              statusText = '🟡 Degraded';
              statusBadgeClass = 'text-amber-400 bg-amber-950/60 border border-amber-900/80 shadow-[0_0_8px_rgba(245,158,11,0.15)] animate-pulse';
              ringGlowClass = 'border-amber-950/80 shadow-[0_0_15px_rgba(245,158,11,0.04)] hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-500/30';
              iconClass = 'bg-amber-950/20 border-amber-900/60 text-amber-400';
            } else {
              statusText = '🔴 Rate Limited';
              statusBadgeClass = 'text-rose-400 bg-rose-950/60 border border-rose-900/80 shadow-[0_0_8px_rgba(239,68,68,0.15)] animate-pulse';
              ringGlowClass = 'border-rose-950/80 shadow-[0_0_15px_rgba(239,68,68,0.04)] hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:border-rose-500/30';
              iconClass = 'bg-rose-950/20 border-rose-900/60 text-rose-400';
            }

            return (
              <motion.div
                key={node.id}
                whileHover={{ y: -3 }}
                onClick={() => cycleNodeStatus(node.id)}
                className={`p-5 rounded-2xl bg-zinc-950/50 border backdrop-blur-sm transition-all duration-300 flex flex-col justify-between cursor-pointer group select-none ${ringGlowClass}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-300 ${iconClass}`}>
                    <NodeIcon className={`w-5 h-5 ${node.status !== 'active' ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
                        {node.name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-semibold whitespace-nowrap ${statusBadgeClass}`}>
                        {statusText}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono mt-1 truncate">
                      {node.address}
                    </p>
                    <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                      {node.details}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-900/60 font-mono text-[10px] text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-indigo-400 transition-colors" />
                    <span>Ping Latency</span>
                  </div>
                  <span className={`font-semibold ${node.status === 'active' ? 'text-emerald-400' : node.status === 'degraded' ? 'text-amber-400' : 'text-rose-400'}`}>
                    {node.latency} ms
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Infrastructure Optimizer Emergency Control Actions */}
        <div className="mt-auto flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-zinc-900 pt-5">
          <div className="flex flex-col text-center sm:text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Infrastructure Optimizer</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Emergency Overrules & Session Memory Flushes</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePurgeCache}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 shadow-md flex items-center gap-2 font-mono hover:text-white"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
              Purge Session Cache
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleForceTerminate}
              className="px-4 py-2 bg-rose-950/25 hover:bg-rose-950/40 border border-rose-900/50 hover:border-rose-800 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 shadow-md flex items-center gap-2 font-mono"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              Force Terminate Agents
            </motion.button>
          </div>
        </div>
      </div>

      {/* Floating Interactive Toast Alert Center */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-800/80 text-rose-200 shadow-rose-950/20'
                : 'bg-emerald-950/90 border-emerald-800/80 text-emerald-200 shadow-emerald-950/20'
            }`}
          >
            {toast.type === 'error' ? (
              <ShieldAlert className="w-4.5 h-4.5 text-rose-400 flex-shrink-0 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
            )}
            <span className="text-xs font-semibold tracking-wide font-mono">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
