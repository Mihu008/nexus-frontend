import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Copy, Check, Zap, Activity, AlertTriangle, Info } from 'lucide-react'
import useNexusStore from '../../store/useNexusStore'

// A premium helper function to parse backend markdown into beautiful, styled JSX
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
        <div key={`table-${idx}`} className="my-5 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/60">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-900/60">
              <tr>
                {currentHeaders.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-medium text-zinc-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {currentRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-zinc-900/35 transition-colors">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 text-zinc-300 font-mono text-xs">
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
        <h1 key={idx} className="text-2xl font-bold text-slate-100 border-b border-zinc-800 pb-2 mt-6 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400" />
          {trimmed.replace('# ', '')}
        </h1>
      );
    }

    // H2 Header
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-lg font-semibold text-zinc-200 mt-5 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          {trimmed.replace('## ', '')}
        </h2>
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
          className={`p-4 rounded-r-lg border-l-4 my-4 flex gap-3 ${
            isWarn
              ? 'bg-amber-950/20 border-amber-500 text-amber-200'
              : 'bg-indigo-950/20 border-indigo-500 text-indigo-200'
          }`}
        >
          {isWarn ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <Info className="w-5 h-5 flex-shrink-0" />}
          <div>
            <strong className="font-semibold block text-xs uppercase tracking-wider mb-1">
              {isWarn ? 'Warning Warning' : 'Nexus Note'}
            </strong>
            <span className="text-sm opacity-90">{content}</span>
          </div>
        </div>
      );
    }

    // Checklist list items
    if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
      const checked = trimmed.startsWith('- [x]');
      const text = trimmed.replace(/- \[( |x)\]/, '').trim();
      return (
        <div key={idx} className="flex items-center gap-3 my-2 text-sm text-zinc-300 pl-2">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className={`w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-950 ${
              checked ? 'accent-indigo-500' : ''
            }`}
          />
          <span className={checked ? 'line-through text-zinc-500' : 'text-zinc-300'}>{text}</span>
        </div>
      );
    }

    // Horizontal Rule
    if (trimmed === '---') {
      return <hr key={idx} className="my-6 border-zinc-800/80" />;
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
          <code key={match.index} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-indigo-400 font-mono text-xs">
            {match[1]}
          </code>
        );
        lastIdx = inlineCodeRegex.lastIndex;
      }

      if (lastIdx < text.length) {
        parts.push(text.substring(lastIdx));
      }

      return (
        <p key={idx} className="text-zinc-300 text-sm leading-relaxed my-3 pl-1">
          {parts.length > 0 ? parts : text}
        </p>
      );
    }

    return null;
  });

  return <div className="space-y-1">{elements}</div>;
};

export default function ArtifactVault() {
  const { finalArtifact: artifact } = useNexusStore()
  const [copied, setCopied] = useState(false)
  const [artifactSubTab, setArtifactSubTab] = useState('markdown') // 'markdown' | 'code'

  const handleCopyCode = () => {
    if (!artifact?.code) return
    navigator.clipboard.writeText(artifact.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Premium, visually wowing standby layout when no active artifact is available
  if (!artifact) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center items-center h-full text-center relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(99,102,241,0.03)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
        <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-900/60 flex items-center justify-center mb-4 text-indigo-400/90 shadow-lg shadow-indigo-500/5 animate-pulse">
          <FileText className="w-5.5 h-5.5" />
        </div>
        <h3 className="text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
          Vault Standby
        </h3>
        <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
          Awaiting agentic prompt execution. Trigger the Sentinel Agent to synthesize verification metrics and generate markdown/code artifacts.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col min-h-0 h-full">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center">
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 max-w-[200px] md:max-w-md truncate">
              {artifact.title}
            </h3>
            <p className="text-[10px] text-zinc-500">
              Generated in response to prompt
            </p>
          </div>
        </div>

        {/* Tabs switcher: Markdown View vs Code View */}
        <div className="flex items-center bg-zinc-950 border border-zinc-900 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setArtifactSubTab('markdown')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              artifactSubTab === 'markdown'
                ? 'bg-zinc-800 text-white font-semibold shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Markdown View
          </button>
          <button
            onClick={() => setArtifactSubTab('code')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              artifactSubTab === 'code'
                ? 'bg-zinc-800 text-white font-semibold shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Code View
          </button>
        </div>
      </div>

      {/* Render view contents */}
      <div className="flex-1 overflow-y-auto bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 relative select-text">
        <AnimatePresence mode="wait">
          {artifactSubTab === 'markdown' ? (
            <motion.div
              key="markdown-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="prose prose-invert max-w-none text-zinc-300"
            >
              {renderMarkdown(artifact.markdown)}
            </motion.div>
          ) : (
            <motion.div
              key="code-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col"
            >
              {/* Copy button */}
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1.5 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-md text-xs flex items-center gap-1.5 backdrop-blur transition-all active:scale-95 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              
              <pre className="flex-1 overflow-auto rounded-lg text-[11px] leading-relaxed font-mono text-indigo-200 bg-zinc-950 p-4 border border-zinc-900 select-text">
                <code>{artifact.code}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
