import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Loader2, 
  Square, 
  FileText, 
  Sparkles, 
  Brain, 
  Terminal, 
  Zap, 
  Activity, 
  AlertTriangle, 
  Info 
} from 'lucide-react'
import useNexusStore from '../store/useNexusStore'
import useAgentStream from '../hooks/useAgentStream'

// A premium helper function to parse backend markdown into beautiful, styled JSX directly in the chat bubbles
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
      const isNote = trimmed.includes('NOTE');
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

export default function ChatRoom() {
  // Bind dynamic log polling hook
  useAgentStream()

  const {
    messages,
    status,
    executePrompt,
    stopExecutingPrompt,
    openArtifactPanel,
    fetchTaskDetails
  } = useNexusStore()

  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)
  const isExecuting = status === 'RUNNING'

  // Scroll to bottom of chat feed when new messages or logs arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isExecuting) return
    executePrompt(undefined, input)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle opening artifacts from older tasks dynamically
  const handleOpenArtifact = async (taskId) => {
    try {
      // Find the message in our local state to see if it already has the artifact loaded
      const targetMsg = messages.find(m => m.id === taskId)
      if (targetMsg && targetMsg.artifact) {
        openArtifactPanel(targetMsg.artifact)
        return
      }
      // Fallback: fetch from database
      await fetchTaskDetails(taskId)
      const state = useNexusStore.getState()
      if (state.activeArtifact) {
        state.openArtifactPanel(state.activeArtifact)
      }
    } catch (err) {
      console.error('Failed to retrieve historical artifact:', err)
    }
  }

  // Quick Action triggers for easy prompt injection
  const quickActions = [
    { label: 'Security Analysis', text: 'Generate an executive security analysis report for public REST API endpoints.' },
    { label: 'MCP Health Check', text: 'Perform a full database health check diagnostics report.' },
    { label: 'Ingestion Check', text: 'Analyze document upload schema and explain PGVector store indexing.' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col min-h-0 h-full relative"
    >
      {/* Dynamic Grid Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="glow-bg top-[20%] left-[30%]" style={{ animationDuration: '25s' }} />
      </div>

      {/* Main chat viewport */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 z-10 terminal-scroll">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user'

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-lg flex flex-col gap-2.5 ${
                    isUser
                      ? 'bg-gradient-to-br from-indigo-650 to-indigo-600 border border-indigo-500/40 text-slate-100 rounded-tr-none'
                      : 'glass-panel rounded-tl-none border-zinc-800/80 text-zinc-200'
                  }`}
                >
                  {/* Sender title & Timestamp */}
                  <div className="flex items-center gap-2.5 pb-1 border-b border-white/5 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                    <span className={isUser ? 'text-indigo-200 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {isUser ? 'Operator' : 'Sentinel Agent'}
                    </span>
                    <span>•</span>
                    <span className="opacity-75">{msg.timestamp}</span>
                  </div>

                  {/* Top Block: Status/Telemetry Tracking (Only for AI) */}
                  {!isUser && msg.currentStatus && (
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400/60 font-mono bg-zinc-950/40 px-2.5 py-1.5 rounded-lg border border-zinc-900/50 w-fit select-none">
                      {msg.isStreaming && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                      )}
                      <span>{msg.currentStatus}</span>
                    </div>
                  )}

                  {/* Bottom Block: Main Chat Message Body */}
                  {(isUser || msg.conversationText) && (
                    <div className="text-sm leading-relaxed break-words font-sans select-text">
                      {isUser ? (msg.conversationText || msg.text) : renderMarkdown(msg.conversationText)}
                    </div>
                  )}

                  {/* Expandable thoughts logs accordion (Only for AI bubbles with logs) */}
                  {!isUser && msg.thinkingLogs && msg.thinkingLogs.length > 0 && (
                    <details className="mt-2 text-xs bg-zinc-950/70 border border-zinc-900/60 rounded-xl p-3 flex flex-col select-none">
                      <summary className="cursor-pointer text-indigo-400 font-mono font-semibold hover:text-indigo-300 flex items-center gap-1.5 outline-none">
                        <Brain className="w-3.5 h-3.5" />
                        <span>View Thinking Process ({msg.thinkingLogs.length} steps)</span>
                      </summary>
                      
                      <div className="mt-3 space-y-2 font-mono text-[10px] text-zinc-400 max-h-48 overflow-y-auto pr-1 terminal-scroll select-text">
                        {msg.thinkingLogs.map((log) => {
                          let typeColor = 'text-indigo-400 font-semibold'
                          let typeText = '[THOUGHT]'
                          let textColor = 'text-zinc-500 italic'
                          
                          if (log.type === 'success') {
                            typeColor = 'text-emerald-400 font-bold'
                            typeText = '[OK]'
                            textColor = 'text-emerald-300'
                          } else if (log.type === 'tool_call') {
                            typeColor = 'text-emerald-500 font-bold'
                            typeText = '[TOOL]'
                            textColor = 'text-emerald-400'
                          } else if (log.type === 'error') {
                            typeColor = 'text-rose-500 font-bold'
                            typeText = '[FAIL]'
                            textColor = 'text-rose-300'
                          } else if (log.type === 'warning') {
                            typeColor = 'text-amber-500 font-bold'
                            typeText = '[WARN]'
                            textColor = 'text-amber-200'
                          } else if (log.type === 'info') {
                            typeColor = 'text-blue-400 font-semibold'
                            typeText = '[INFO]'
                            textColor = 'text-zinc-300'
                          }
                          
                          return (
                            <div key={log.id} className="flex gap-2 py-0.5 border-b border-zinc-900/30 break-all leading-relaxed">
                              <span className="text-zinc-600 flex-shrink-0 select-none">{log.timestamp}</span>
                              <span className={`${typeColor} flex-shrink-0 select-none`}>{typeText}</span>
                              <span className={textColor}>{log.text}</span>
                            </div>
                          )
                        })}
                      </div>
                    </details>
                  )}

                  {/* Vault Artifact integration shortcut - Only rendered if message contains active artifact */}
                  {!isUser && msg.artifact && (
                    <button
                      onClick={() => handleOpenArtifact(msg.id)}
                      className="mt-2 px-3 py-1.5 bg-zinc-950 border border-zinc-900 hover:border-indigo-500/50 text-indigo-400 hover:text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 w-fit transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open Generated Report</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Footer controls & prompt input area */}
      <div className="px-4 md:px-8 pb-6 pt-2 z-10 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex-shrink-0">
        
        {/* Quick Action Pills */}
        {!isExecuting && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1.5 select-none terminal-scroll">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => setInput(action.text)}
                className="px-3 py-1.5 bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/60 rounded-full text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer flex-shrink-0 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input layout card */}
        <div className="glass-panel rounded-2xl p-3.5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isExecuting ? "Sentinel Agent is processing task..." : "Type a task prompt instruction (e.g. Analyze pom.xml security)..."}
              disabled={isExecuting}
              className="flex-grow h-14 bg-zinc-950/70 border border-zinc-850 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 resize-none transition-all disabled:opacity-50"
            />
            
            <div className="flex flex-col gap-2">
              {isExecuting ? (
                <button
                  onClick={stopExecutingPrompt}
                  className="p-3 bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 hover:border-red-500/60 text-red-400 hover:text-red-300 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  title="Cancel execution"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-zinc-800 disabled:to-zinc-800 text-white rounded-xl flex items-center justify-center transition-all shadow shadow-indigo-650/10 active:scale-95 disabled:scale-100 disabled:opacity-30 cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 px-1 select-none">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-indigo-500" />
              <span>Workspace: d:/Nexus</span>
            </span>
            {isExecuting && (
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Agent Streaming...</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
