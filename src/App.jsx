import React from 'react'
import useStore from './store/useStore'
import DashboardLayout from './components/layout/DashboardLayout'
import ChatRoom from './pages/ChatRoom'
import TaskHistory from './pages/TaskHistory'
import SystemHealth from './pages/SystemHealth'

function App() {
  const { activeTab } = useStore()

  // Resolve which page to display in layout viewport
  const renderActivePage = () => {
    switch (activeTab) {
      case 'agent-control':
        return <ChatRoom />
      case 'task-history':
        return <TaskHistory />
      case 'system-health':
        return <SystemHealth />
      default:
        return <ChatRoom />
    }
  }

  return (
    <DashboardLayout>
      {renderActivePage()}
    </DashboardLayout>
  )
}

export default App
