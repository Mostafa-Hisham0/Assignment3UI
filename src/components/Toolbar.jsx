import { useBoard } from '../context/BoardProvider'
import { useCallback, useState } from 'react'
import ArchivedListsModal from './ArchivedListsModal'
import ConfirmDialog from './ConfirmDialog'

const Toolbar = () => {
  const { addList, undo, redo, historyIndex, history, lists, unarchiveList, deleteList, clearAll } =
    useBoard()
  const [showArchivedModal, setShowArchivedModal] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)

  const archivedLists = lists.filter((list) => list.archived)

  const handleAddList = useCallback(() => {
    const title = prompt('Enter list title:')
    if (title && title.trim()) {
      addList(title.trim())
    }
  }, [addList])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleRestore = useCallback(
    async (listId) => {
      unarchiveList(listId)
      setShowArchivedModal(false)
    },
    [unarchiveList]
  )

  const handleDeleteArchived = useCallback(
    async (listId) => {
      if (window.confirm('Are you sure you want to permanently delete this archived list?')) {
        deleteList(listId)
      }
    },
    [deleteList]
  )

  const handleClearAll = useCallback(async () => {
    await clearAll()
    setShowClearDialog(false)
  }, [clearAll])

  return (
    <>
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
        {archivedLists.length > 0 && (
          <button
            onClick={() => setShowArchivedModal(true)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label={`View archived lists (${archivedLists.length})`}
          >
            📦 Archived ({archivedLists.length})
          </button>
        )}
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
        <button
          onClick={() => setShowClearDialog(true)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Clear all data"
        >
          🗑️ Clear All
        </button>
      </div>
      <ArchivedListsModal
        isOpen={showArchivedModal}
        archivedLists={archivedLists}
        onRestore={handleRestore}
        onDelete={handleDeleteArchived}
        onClose={() => setShowArchivedModal(false)}
      />
      <ConfirmDialog
        isOpen={showClearDialog}
        title="Clear All Data"
        message="Are you sure you want to delete all lists and cards? This action cannot be undone."
        onConfirm={handleClearAll}
        onCancel={() => setShowClearDialog(false)}
        confirmText="Clear All"
        cancelText="Cancel"
      />
    </>
  )
}

export default Toolbar

