import { create } from 'zustand'
import api from '../services/api'

// A predictable default test UUID seeded in the backend on startup
export const DEFAULT_USER_ID = 'd7b29a24-4f27-4632-bd88-5188f6fa9809'

export const useNexusStore = create((set, get) => ({
  // State variables
  tasks: [],
  currentTaskId: null,
  logs: [],
  status: 'IDLE', // IDLE | RUNNING | COMPLETED | FAILED
  finalArtifact: null,

  // Action: Trigger task execution
  executePrompt: async (userId = DEFAULT_USER_ID, prompt) => {
    if (!prompt || !prompt.trim()) return null

    set({
      status: 'RUNNING',
      logs: [],
      finalArtifact: null,
      currentTaskId: null
    })

    try {
      const response = await api.post('/tasks/execute', {
        userId,
        prompt
      })

      const { taskId } = response.data
      set({ currentTaskId: taskId })
      return taskId
    } catch (error) {
      set({ status: 'FAILED' })
      console.error('[Store Error] executePrompt failed:', error)
      return null
    }
  },

  // Action: Fetch logs for a given task ID
  fetchLogs: async (taskId) => {
    if (!taskId) return

    try {
      const response = await api.get(`/tasks/${taskId}/logs`)
      const backendLogs = response.data

      // Map backend logs to terminal format
      const formattedLogs = backendLogs.map((log) => {
        // Parse time from createdAt (format: HH:MM:SS)
        const dateObj = new Date(log.createdAt || Date.now())
        const timestamp = dateObj.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })

        return {
          id: log.id || Math.random().toString(),
          text: log.message || '',
          type: log.level ? log.level.toLowerCase() : 'info', // e.g. success, info, warn, error
          timestamp
        }
      })

      set({ logs: formattedLogs })
    } catch (error) {
      console.error('[Store Error] fetchLogs failed:', error)
    }
  },

  // Action: Fetch active task status, completion time, and artifacts
  fetchTaskDetails: async (taskId) => {
    if (!taskId) return

    try {
      const response = await api.get(`/tasks/${taskId}`)
      const { task, artifacts } = response.data

      // Map status from backend task
      const backendStatus = task.status || 'PENDING'
      let appStatus = 'RUNNING'
      if (backendStatus === 'COMPLETED') appStatus = 'COMPLETED'
      if (backendStatus === 'FAILED') appStatus = 'FAILED'

      set({ status: appStatus })

      // Map artifacts to finalArtifact format
      if (artifacts && artifacts.length > 0) {
        const primaryArtifact = artifacts[0]
        set({
          finalArtifact: {
            title: primaryArtifact.title || 'Agent Verification Report',
            type: primaryArtifact.artifactType || 'markdown',
            markdown: primaryArtifact.artifactType === 'markdown' ? primaryArtifact.content : primaryArtifact.content,
            code: primaryArtifact.artifactType === 'code' ? primaryArtifact.content : primaryArtifact.content
          }
        })
      }
    } catch (error) {
      console.error('[Store Error] fetchTaskDetails failed:', error)
    }
  },

  // Action: Fetch audit history of tasks
  fetchTaskHistory: async () => {
    try {
      const response = await api.get('/tasks')
      const backendTasks = response.data

      // Map backend tasks to the historical transaction audit structure
      const formattedTasks = backendTasks.map((t) => {
        const created = new Date(t.createdAt)
        const completed = t.completedAt ? new Date(t.completedAt) : null

        // Format duration
        let duration = 'In Progress'
        if (completed) {
          const diffMs = completed.getTime() - created.getTime()
          duration = `${(diffMs / 1000).toFixed(1)}s`
        }

        // Format date string
        const timestamp = created.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })

        return {
          id: `TX-${t.id.slice(0, 4).toUpperCase()}`,
          rawId: t.id,
          prompt: t.prompt || '',
          status: t.status ? t.status.toLowerCase() : 'pending',
          timestamp,
          agent: 'Sentinel-V4', // Default AI Agent name
          duration
        }
      })

      set({ tasks: formattedTasks })
    } catch (error) {
      console.error('[Store Error] fetchTaskHistory failed:', error)
    }
  },

  // Action: Reset store
  resetStore: () => set({
    currentTaskId: null,
    logs: [],
    status: 'IDLE',
    finalArtifact: null
  })
}))

export default useNexusStore
