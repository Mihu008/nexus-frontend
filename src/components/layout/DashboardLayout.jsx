import React from 'react'
import { motion } from 'framer-motion'
import {
  Terminal,
  Cpu,
  History,
  Globe,
  Activity,
  Database
} from 'lucide-react'
import useStore from '../../store/useStore'

export default function DashboardLayout({ children }) {
  const {
    activeTab,
    setActiveTab,
    systemMetrics
  } = useStore()

  // Sidebar navigation mapping
  const navItems = [
    { id: 'agent-control', label: 'Agent Control', icon: Terminal },
    { id: 'task-history', label: 'Task History', icon: History },
    { id: 'system-health', label: 'System Health', icon: Cpu }
  ]

  const activeLabel = navItems.find((n) => n.id === activeTab)?.label || 'Dashboard'

  // Dynamic host loading from env configuration
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';
  const backendHost = backendUrl.replace(/^https?:\/\//, '');

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      
      {/* Premium Background Glowing Elements (Strictly locked to prevent scroll-height extension) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="glow-bg top-[-10%] left-[20%]" />
        <div className="glow-bg bottom-[-20%] right-[-10%]" style={{ animationDelay: '-5s' }} />
      </div>

      {/* FIXED SIDEBAR (width: 64) */}
      <aside className="w-64 flex-shrink-0 bg-zinc-950/80 border-r border-zinc-900/90 flex flex-col z-10 backdrop-blur-xl">
        {/* Branding header */}
        <div className="h-16 px-6 border-b border-zinc-900 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cpu className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-widest bg-gradient-to-r from-slate-100 to-zinc-400 bg-clip-text text-transparent">
              NEXUS AI
            </h1>
            <span className="text-[9px] font-mono tracking-wider text-emerald-400 font-medium uppercase leading-none block">
              Node Active
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium cursor-pointer ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                {/* Framer Motion background highlight for active tab */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-950/40 to-zinc-900/60 border border-indigo-500/30 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                
                <Icon className={`w-4 h-4 z-10 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                <span className="z-10">{item.label}</span>
                
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-500" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-indigo-400">
              SE
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-300">Sr. Engineer</p>
              <p className="text-[10px] text-zinc-500">operator-9</p>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500 animate-ping" />
        </div>
      </aside>

      {/* FLEXIBLE CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 z-10 h-full overflow-hidden">
        
        {/* Top Status Bar */}
        <header className="h-16 px-8 border-b border-zinc-900 bg-zinc-950/30 backdrop-blur-md flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-400">
              {activeLabel}
            </h2>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span>Host: </span>
              <span className="text-indigo-400">{backendHost}</span>
            </div>
          </div>

          {/* Quick Metrics Header widget */}
          <div className="flex items-center gap-6 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-zinc-500">CPU:</span>
              <span className={`font-semibold ${systemMetrics.cpu > 70 ? 'text-rose-400' : 'text-zinc-300'}`}>
                {systemMetrics.cpu}%
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-zinc-500">RAM:</span>
              <span className="text-zinc-300 font-semibold">{systemMetrics.memory}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Latency:</span>
              <span className="text-emerald-400 font-semibold">{systemMetrics.latency}ms</span>
            </div>
          </div>
        </header>

        {/* WORKSPACE VIEW WRAPPER (Propagates strict height to children) */}
        <div className="flex-1 h-full overflow-hidden relative flex flex-col min-h-0">
          {children}
        </div>
      </main>
    </div>
  )
}
