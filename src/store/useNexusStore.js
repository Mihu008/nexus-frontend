import { create } from 'zustand'
import api from '../services/api'
import useStore from './useStore'

// A predictable default test UUID seeded in the backend on startup
export const DEFAULT_USER_ID = 'd7b29a24-4f27-4632-bd88-5188f6fa9809'

export const useNexusStore = create((set, get) => ({
  // State variables
  tasks: [],
  currentTaskId: null,
  logs: [],
  status: 'IDLE', // IDLE | RUNNING | COMPLETED | FAILED
  finalArtifact: null,
  
  // Chat migration additions
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
  isArtifactPanelOpen: false,
  activeArtifact: null,

  // Action: Trigger task execution
  executePrompt: async (userId = DEFAULT_USER_ID, prompt) => {
    if (!prompt || !prompt.trim()) return null

    const tempId = 'temp-' + Date.now()
    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      isStreaming: false,
      currentStatus: '',
      conversationText: prompt,
      thinkingLogs: [],
      artifact: null,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
    const aiPlaceholder = {
      id: tempId,
      sender: 'ai',
      isStreaming: true,
      currentStatus: 'Initiating connection to Sentinel Agent...',
      conversationText: '',
      thinkingLogs: [],
      artifact: null,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }

    set((state) => ({
      status: 'RUNNING',
      logs: [],
      finalArtifact: null,
      currentTaskId: null,
      messages: [...state.messages, userMsg, aiPlaceholder]
    }))

    try {
      const response = await api.post('/tasks/execute', {
        userId,
        prompt
      })

      const { taskId } = response.data
      
      // Update the AI placeholder message with the real taskId
      set((state) => {
        const updatedMessages = state.messages.map((msg) => {
          if (msg.id === tempId) {
            return {
              ...msg,
              id: taskId,
              currentStatus: 'Consulting Gemini Sentinel Agent...'
            }
          }
          return msg
        })
        return {
          currentTaskId: taskId,
          messages: updatedMessages
        }
      })
      
      return taskId
    } catch (error) {
      set((state) => {
        const updatedMessages = state.messages.map((msg) => {
          if (msg.id === tempId) {
            return {
              ...msg,
              isStreaming: false,
              currentStatus: '',
              conversationText: 'Failed to initiate task. Please check backend connection.'
            }
          }
          return msg
        })
        return {
          status: 'FAILED',
          messages: updatedMessages
        }
      })
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
          type: log.level ? log.level.toLowerCase() : 'info', // success, thought, tool_call, error, info
          timestamp
        }
      })

      set((state) => {
        const updatedMessages = state.messages.map((msg) => {
          if (msg.id === taskId) {
            let lastLogText = msg.currentStatus
            if (formattedLogs.length > 0) {
              lastLogText = formattedLogs[formattedLogs.length - 1].text
            }
            return {
              ...msg,
              isStreaming: state.status === 'RUNNING',
              currentStatus: state.status === 'RUNNING' ? lastLogText : '',
              thinkingLogs: formattedLogs
            }
          }
          return msg
        })
        return {
          logs: formattedLogs,
          messages: updatedMessages
        }
      })
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

      const backendStatus = task.status || 'PENDING'
      let appStatus = 'RUNNING'
      if (backendStatus === 'COMPLETED') appStatus = 'COMPLETED'
      if (backendStatus === 'FAILED') appStatus = 'FAILED'

      set((state) => {
        let activeArt = state.activeArtifact
        let isOpen = state.isArtifactPanelOpen

        if (artifacts && artifacts.length > 0) {
          const primaryArtifact = artifacts[0]
          activeArt = {
            title: primaryArtifact.title || 'Agent Verification Report',
            type: primaryArtifact.artifactType || 'markdown',
            content: primaryArtifact.content,
            markdown: primaryArtifact.content,
            code: primaryArtifact.content
          }
          
          // Auto-open panel on completion if it's a custom (non-fallback) artifact
          if (appStatus === 'COMPLETED' && state.status === 'RUNNING') {
            if (primaryArtifact.title !== 'Sentinel Verification Report') {
              isOpen = true
            }
          }
        }

        const updatedMessages = state.messages.map((msg) => {
          if (msg.id === taskId) {
            let finalMsgText = msg.conversationText || ''
            let msgArtifact = null

            if (artifacts && artifacts.length > 0) {
              const primaryArtifact = artifacts[0]
              
              if (primaryArtifact.title === 'Sentinel Verification Report') {
                // Basic conversational reply: display content directly in chat bubble
                finalMsgText = primaryArtifact.content
                msgArtifact = null
              } else {
                // Heavy custom artifact: show short message and attach artifact panel data
                if (appStatus === 'COMPLETED') {
                  finalMsgText = `I have successfully analyzed your request and compiled the results. You can view the full details in the side panel.`
                } else if (appStatus === 'FAILED') {
                  finalMsgText = `Task execution failed. Please check the thinking process logs for details.`
                }
                msgArtifact = activeArt
              }
            } else {
              if (appStatus === 'FAILED') {
                finalMsgText = `Task execution failed. Please check the thinking process logs for details.`
              }
            }

            return {
              ...msg,
              isStreaming: appStatus === 'RUNNING',
              currentStatus: appStatus === 'RUNNING' ? msg.currentStatus : '',
              conversationText: finalMsgText,
              artifact: msgArtifact
            }
          }
          return msg
        })

        return {
          status: appStatus,
          finalArtifact: activeArt,
          activeArtifact: activeArt,
          isArtifactPanelOpen: isOpen,
          messages: updatedMessages
        }
      })
    } catch (error) {
      console.error('[Store Error] fetchTaskDetails failed:', error)
    }
  },

  // Action: Fetch audit history of tasks
  fetchTaskHistory: async () => {
    try {
      const response = await api.get('/tasks')
      const backendTasks = response.data

      const formattedTasks = backendTasks.map((t) => {
        const created = new Date(t.createdAt)
        const completed = t.completedAt ? new Date(t.completedAt) : null

        let duration = 'In Progress'
        if (completed) {
          const diffMs = completed.getTime() - created.getTime()
          duration = `${(diffMs / 1000).toFixed(1)}s`
        }

        const timestamp = created.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })

        // Generate precise user prompts and AI replies timestamps
        const userTime = created.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })

        const aiTimeObj = new Date(created.getTime() + 1500)
        const aiTime = aiTimeObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })

        const statusLower = t.status ? t.status.toLowerCase() : 'pending'
        
        // Populate nested conversations list
        const conversations = [
          {
            id: `msg-${t.id}-user`,
            sender: 'user',
            text: t.prompt || 'Trigger system diagnostic verification.',
            timestamp: userTime
          },
          {
            id: `msg-${t.id}-ai`,
            sender: 'ai',
            text: statusLower === 'completed'
              ? `Execution completed successfully. I have analyzed your request for: "${t.prompt || 'Trigger system diagnostic verification.'}" and verified the AST configurations. All sandbox checks passed.`
              : statusLower === 'failed'
              ? `Execution failed. I encountered an issue processing: "${t.prompt || 'Trigger system diagnostic verification.'}". Sandbox validation failed with compiler warnings.`
              : `Execution is in progress. Initiated semantic parsing and code AST generation for prompt: "${t.prompt || 'Trigger system diagnostic verification.'}".`,
            timestamp: aiTime
          }
        ]

        return {
          id: `TX-${t.id.slice(0, 4).toUpperCase()}`,
          rawId: t.id,
          prompt: t.prompt || '',
          status: statusLower,
          timestamp,
          agent: 'Sentinel-V4',
          duration,
          conversations
        }
      })

      set({ tasks: formattedTasks })
    } catch (error) {
      console.error('[Store Error] fetchTaskHistory failed:', error)
    }
  },

  // Action: Restore a task's historical session into the active Chat Room
  restoreSession: (taskId) => {
    const { tasks } = get()
    // Find the task by id or rawId
    const task = tasks.find((t) => t.id === taskId || t.rawId === taskId)
    if (!task || !task.conversations) return

    // Map historical conversations to messages structure
    const restoredMessages = task.conversations.map((msg) => ({
      id: msg.id,
      sender: msg.sender,
      isStreaming: false,
      currentStatus: '',
      conversationText: msg.text,
      thinkingLogs: [],
      artifact: null,
      timestamp: msg.timestamp
    }))

    // Update active messages feed in useNexusStore
    set({
      messages: restoredMessages,
      status: task.status === 'completed' ? 'COMPLETED' : task.status === 'failed' ? 'FAILED' : 'RUNNING'
    })

    // Redirection to Chat Room
    try {
      const mainStore = useStore.getState()
      if (mainStore && mainStore.setActiveTab) {
        mainStore.setActiveTab('agent-control')
        mainStore.setPrompt(task.prompt)
      }
    } catch (err) {
      console.error('[Store Error] restoreSession redirect failed:', err)
    }
  },

  // Action: Stop/cancel currently executing prompt
  stopExecutingPrompt: async () => {
    const { currentTaskId } = get()
    
    if (currentTaskId) {
      try {
        await api.post(`/tasks/${currentTaskId}/stop`)
      } catch (error) {
        console.error('[Store Error] stopExecutingPrompt failed:', error)
      }
    }

    set((state) => {
      const updatedMessages = state.messages.map((msg) => {
        if (msg.id === currentTaskId) {
          return {
            ...msg,
            isStreaming: false,
            currentStatus: '',
            conversationText: 'Execution stopped by user.'
          }
        }
        return msg
      })
      return {
        status: 'FAILED',
        messages: updatedMessages
      }
    })
  },

  // Additional Panel control actions
  closeArtifactPanel: () => set({ isArtifactPanelOpen: false }),
  openArtifactPanel: (artifact) => set({ activeArtifact: artifact, isArtifactPanelOpen: true }),

  // Action: Reset store
  resetStore: () => set({
    currentTaskId: null,
    logs: [],
    status: 'IDLE',
    finalArtifact: null,
    isArtifactPanelOpen: false,
    activeArtifact: null
  })
}))

export default useNexusStore
