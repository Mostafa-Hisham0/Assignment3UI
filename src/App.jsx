import { Suspense, lazy } from 'react'
import { BoardProvider } from './context/BoardProvider'
import { useOfflineSync } from './hooks/useOfflineSync'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import './styles/global.css'
import './styles/components.css'

const Board = lazy(() => import('./components/Board'))

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-white text-xl">Loading Kanban Board...</div>
  </div>
)

const AppContent = () => {
  useOfflineSync()
  return (
    <div className="min-h-screen">
      <Header />
      <Toolbar />
      <Suspense fallback={<LoadingFallback />}>
        <Board />
      </Suspense>
    </div>
  )
}

function App() {
  return (
    <BoardProvider>
      <AppContent />
    </BoardProvider>
  )
}

export default App

