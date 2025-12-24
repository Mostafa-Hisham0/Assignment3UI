import { createContext, useContext, useReducer, useEffect } from 'react'
import { boardReducer, ACTION_TYPES } from './boardReducer'
import * as storage from '../services/storage'

const BoardContext = createContext(null)

export const useBoard = () => {
  const context = useContext(BoardContext)
  if (!context) {
    throw new Error('useBoard must be used within BoardProvider')
  }
  return context
}

export const BoardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(boardReducer, {
    lists: [],
    cards: [],
    history: [],
    historyIndex: -1,
    syncQueue: [],
    lastSyncTime: null,
    conflicts: [],
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const lists = await storage.getAllLists()
        const cards = await storage.getAllCards()
        dispatch({
          type: ACTION_TYPES.SET_INITIAL_STATE,
          payload: { lists: lists || [], cards: cards || [] },
        })
      } catch (error) {
        console.error('Failed to load data from storage:', error)
        // Initialize with empty state if storage fails
        dispatch({
          type: ACTION_TYPES.SET_INITIAL_STATE,
          payload: { lists: [], cards: [] },
        })
      }
    }
    loadData()
  }, [])

  const addList = (title) => {
    dispatch({ type: ACTION_TYPES.ADD_LIST, payload: { title } })
  }

  const updateList = (listId, updates) => {
    dispatch({ type: ACTION_TYPES.UPDATE_LIST, payload: { listId, updates } })
  }

  const deleteList = (listId) => {
    dispatch({ type: ACTION_TYPES.DELETE_LIST, payload: { listId } })
  }

  const archiveList = (listId) => {
    dispatch({ type: ACTION_TYPES.ARCHIVE_LIST, payload: { listId } })
  }

  const addCard = (listId, cardData) => {
    dispatch({ type: ACTION_TYPES.ADD_CARD, payload: { listId, ...cardData } })
  }

  const updateCard = (cardId, updates) => {
    dispatch({ type: ACTION_TYPES.UPDATE_CARD, payload: { cardId, updates } })
  }

  const deleteCard = (cardId) => {
    dispatch({ type: ACTION_TYPES.DELETE_CARD, payload: { cardId } })
  }

  const moveCard = (cardId, newListId, newIndex) => {
    dispatch({
      type: ACTION_TYPES.MOVE_CARD,
      payload: { cardId, newListId, newIndex },
    })
  }

  const reorderCards = (listId, cardIds) => {
    dispatch({ type: ACTION_TYPES.REORDER_CARDS, payload: { listId, cardIds } })
  }

  const undo = () => {
    dispatch({ type: ACTION_TYPES.UNDO })
  }

  const redo = () => {
    dispatch({ type: ACTION_TYPES.REDO })
  }

  const value = {
    ...state,
    dispatch,
    addList,
    updateList,
    deleteList,
    archiveList,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    reorderCards,
    undo,
    redo,
  }

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}

