import React from 'react'
import { motion } from 'framer-motion'
import PromptPanel from '../components/ui/PromptPanel'
import TerminalConsole from '../components/ui/TerminalConsole'
import ArtifactVault from '../components/ui/ArtifactVault'
import useAgentStream from '../hooks/useAgentStream'

export default function AgentControl() {
  // Initialize dynamic backend log polling subscription loop
  useAgentStream()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="h-full p-6 grid grid-cols-1 xl:grid-cols-5 gap-6 overflow-hidden"
    >
      {/* Left Panel: Control Room (Grid span 2) */}
      <section className="xl:col-span-2 flex flex-col min-h-0 gap-6">
        <PromptPanel />
        <TerminalConsole />
      </section>

      {/* Right Panel: Artifact Vault (Grid span 3) */}
      <section className="xl:col-span-3 min-h-0">
        <ArtifactVault />
      </section>
    </motion.div>
  )
}
