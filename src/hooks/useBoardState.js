import { useBoard } from '../context/BoardProvider'

/**
 * Custom hook that wraps board reducer actions for easier use
 * Provides a simplified API for board operations
 */
export const useBoardState = () => {
  const board = useBoard()

  return {
    lists: board.lists,
    cards: board.cards,
    addList: board.addList,
    updateList: board.updateList,
    deleteList: board.deleteList,
    archiveList: board.archiveList,
    addCard: board.addCard,
    updateCard: board.updateCard,
    deleteCard: board.deleteCard,
    moveCard: board.moveCard,
    reorderCards: board.reorderCards,
  }
}

