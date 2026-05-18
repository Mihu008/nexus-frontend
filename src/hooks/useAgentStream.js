import { useEffect, useRef } from 'react'
import useNexusStore from '../store/useNexusStore'

export default function useAgentStream() {
  const {
    currentTaskId,
    status,
    fetchLogs,
    fetchTaskDetails
  } = useNexusStore()

  // Track the active interval to prevent overlapping timers
  const intervalRef = useRef(null)

  useEffect(() => {
    // Clear any existing intervals on dependency changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Only start polling if we have an active task ID and the status is RUNNING
    if (currentTaskId && status === 'RUNNING') {
      
      // Perform an immediate initial fetch to bootstrap logs instantly
      fetchLogs(currentTaskId)
      fetchTaskDetails(currentTaskId)

      // Start the long-polling interval (every 1.5 seconds)
      intervalRef.current = setInterval(() => {
        fetchLogs(currentTaskId)
        fetchTaskDetails(currentTaskId)
      }, 1500)
    }

    // Clean up interval completely on unmount or task termination to prevent leaks
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [currentTaskId, status, fetchLogs, fetchTaskDetails])
}
