import { useBoard } from '../context/BoardProvider'
import { useCallback } from 'react'

/**
 * Custom hook for undo/redo functionality
 * Manages history state and provides undo/redo operations
 */
export const useUndoRedo = () => {
  const { undo, redo, historyIndex, history } = useBoard()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo()
    }
  }, [canUndo, undo])

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo()
    }
  }, [canRedo, redo])

  return {
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
    historyLength: history.length,
    currentIndex: historyIndex,
  }
}

