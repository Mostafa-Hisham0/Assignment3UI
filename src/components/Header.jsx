import { useBoard } from '../context/BoardProvider'

const Header = () => {
  const { lastSyncTime } = useBoard()

  return (
    <header className="bg-white shadow-sm p-4 mb-4" role="banner">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800" id="main-heading">
          Kanban Board
        </h1>
        {lastSyncTime && (
          <div className="text-sm text-gray-600" aria-live="polite" aria-atomic="true">
            Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

