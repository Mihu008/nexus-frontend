import React from 'react'
import useStore from './store/useStore'
import DashboardLayout from './components/layout/DashboardLayout'
import AgentControl from './pages/AgentControl'
import TaskHistory from './pages/TaskHistory'
import SystemHealth from './pages/SystemHealth'

function App() {
  const { activeTab } = useStore()

  // Resolve which page to display in layout viewport
  const renderActivePage = () => {
    switch (activeTab) {
      case 'agent-control':
        return <AgentControl />
      case 'task-history':
        return <TaskHistory />
      case 'system-health':
        return <SystemHealth />
      default:
        return <AgentControl />
    }
  }

  return (
    <DashboardLayout>
      {renderActivePage()}
    </DashboardLayout>
  )
}

export default App
