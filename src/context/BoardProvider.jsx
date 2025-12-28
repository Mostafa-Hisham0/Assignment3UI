import { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { boardReducer, ACTION_TYPES } from './boardReducer'
import * as storage from '../services/storage'

const BoardContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
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

  const isInitialLoad = useRef(true)
  const isSavingRef = useRef(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const lists = await storage.getAllLists()
        const cards = await storage.getAllCards()
        dispatch({
          type: ACTION_TYPES.SET_INITIAL_STATE,
          payload: { lists: lists || [], cards: cards || [] },
        })
        isInitialLoad.current = false
      } catch (error) {
        console.error('Failed to load data from storage:', error)
        // Initialize with empty state if storage fails
        dispatch({
          type: ACTION_TYPES.SET_INITIAL_STATE,
          payload: { lists: [], cards: [] },
        })
        isInitialLoad.current = false
      }
    }
    loadData()
  }, [])

  // Save to storage whenever lists or cards change (but skip initial load)
  useEffect(() => {
    if (isInitialLoad.current || isSavingRef.current) {
      return
    }

    const saveData = async () => {
      isSavingRef.current = true
      try {
        // Use saveAllData which clears and saves everything atomically
        await storage.saveAllData(state.lists, state.cards)
      } catch (error) {
        console.error('Failed to save to storage:', error)
      } finally {
        isSavingRef.current = false
      }
    }

    saveData()
  }, [state.lists, state.cards])

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

  const unarchiveList = (listId) => {
    dispatch({ type: ACTION_TYPES.UNARCHIVE_LIST, payload: { listId } })
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

  const clearAll = async () => {
    isSavingRef.current = true
    dispatch({ type: ACTION_TYPES.CLEAR_ALL })
    try {
      await storage.clearAllData()
    } catch (error) {
      console.error('Failed to clear storage:', error)
    } finally {
      isSavingRef.current = false
    }
  }

  const value = {
    ...state,
    dispatch,
    addList,
    updateList,
    deleteList,
    archiveList,
    unarchiveList,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    reorderCards,
    undo,
    redo,
    clearAll,
  }

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}

BoardProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

