import { useBoard } from '../context/BoardProvider'
import { useCallback } from 'react'

const Toolbar = () => {
  const { addList, undo, redo, historyIndex, history } = useBoard()

  const handleAddList = useCallback(() => {
    const title = prompt('Enter list title:')
    if (title && title.trim()) {
      addList(title.trim())
    }
  }, [addList])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div
      className="bg-white shadow-sm p-4 mb-4 flex gap-2 flex-wrap"
      role="toolbar"
      aria-label="Board toolbar"
    >
      <button
        onClick={handleAddList}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Add new list"
      >
        + Add List
      </button>
      <button
        onClick={undo}
        disabled={!canUndo}
        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Undo"
        aria-disabled={!canUndo}
      >
        ↶ Undo
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Redo"
        aria-disabled={!canRedo}
      >
        ↷ Redo
      </button>
    </div>
  )
}

export default Toolbar

