import { generateId } from '../utils/helpers'

export const ACTION_TYPES = {
  SET_INITIAL_STATE: 'SET_INITIAL_STATE',
  ADD_LIST: 'ADD_LIST',
  UPDATE_LIST: 'UPDATE_LIST',
  DELETE_LIST: 'DELETE_LIST',
  ARCHIVE_LIST: 'ARCHIVE_LIST',
  UNARCHIVE_LIST: 'UNARCHIVE_LIST',
  ADD_CARD: 'ADD_CARD',
  UPDATE_CARD: 'UPDATE_CARD',
  DELETE_CARD: 'DELETE_CARD',
  MOVE_CARD: 'MOVE_CARD',
  REORDER_CARDS: 'REORDER_CARDS',
  SYNC_SUCCESS: 'SYNC_SUCCESS',
  SYNC_FAILURE: 'SYNC_FAILURE',
  UNDO: 'UNDO',
  REDO: 'REDO',
  CLEAR_ALL: 'CLEAR_ALL',
}

export const boardReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_INITIAL_STATE: {
      return {
        ...state,
        lists: action.payload.lists || [],
        cards: action.payload.cards || [],
      }
    }

    case ACTION_TYPES.ADD_LIST: {
      const newList = {
        id: generateId(),
        title: action.payload.title,
        order: state.lists.length,
        archived: false,
        version: 1,
        lastModifiedAt: new Date().toISOString(),
        ...action.payload,
      }
      return {
        ...state,
        lists: [...state.lists, newList],
        history: [...state.history.slice(0, state.historyIndex + 1), state],
        historyIndex: state.historyIndex + 1,
      }
    }

    case ACTION_TYPES.UPDATE_LIST: {
      const { listId, updates } = action.payload
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                ...updates,
                version: (list.version || 1) + 1,
                lastModifiedAt: new Date().toISOString(),
              }
            : list
        ),
        history: [...state.history.slice(0, state.historyIndex + 1), state],
        historyIndex: state.historyIndex + 1,
      }
    }

    case ACTION_TYPES.DELETE_LIST: {
      const { listId } = action.payload
      return {
        ...state,
        lists: state.lists.filter((list) => list.id !== listId),
        cards: state.cards.filter((card) => card.listId !== listId),
        history: [...state.history.slice(0, state.historyIndex + 1), state],
        historyIndex: state.historyIndex + 1,
      }
    }

    case ACTION_TYPES.ARCHIVE_LIST: {
      const { listId } = action.payload
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId ? { ...list, archived: true } : list
        ),
        history: [...state.history.slice(0, state.historyIndex + 1), state],
        historyIndex: state.historyIndex + 1,
      }
    }

    case ACTION_TYPES.UNARCHIVE_LIST: {
      const { listId } = action.payload
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId ? { ...list, archived: false } : list
        ),
        history: [...state.history.slice(0, state.historyIndex + 1), state],
        historyIndex: state.historyIndex + 1,
      }
    }

    case ACTION_TYPES.ADD_CARD: {
      const newCard = {
        id: generateId(),
        listId: action.payload.listId,
        title: action.payload.title || 'New Card',
        description: action.payload.description || '',
        tags: action.payload.tags || [],
        order: state.cards.filter((c) => c.listId === action.payload.listId).length,
        version: 1,
        lastModifiedAt: new Date().toISOString(),
        ...action.payload,
      }
      return {
        ...state,
        cards: [...state.cards, newCard],
        history: [...state.history.slice(0, state.historyIndex + 1), state],
        historyIndex: state.historyIndex + 1,
      }
    }

    case ACTION_TYPES.UPDATE_CARD: {
      const { cardId, updates } = action.payload
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                ...updates,
                version: (card.version || 1) + 1,
                lastModifiedAt: new Date().toISOString(),
              }
            : card
        ),
        history: [...state.history.slice(0, state.historyIndex + 1), state],
        historyIndex: state.historyIndex + 1,
      }
    }

    case ACTION_TYPES.DELETE_CARD: {
      const { cardId } = action.payload
      return {
        ...state,
        cards: state.cards.filter((card) => card.id !== cardId),
        history: [...state.history.slice(0, state.historyIndex + 1), state],
        historyIndex: state.historyIndex + 1,
      }
    }

    case ACTION_TYPES.MOVE_CARD: {
      const { cardId, newListId, newIndex } = action.payload
      const card = state.cards.find((c) => c.id === cardId)
      if (!card) return state

      const oldListId = card.listId
      const oldListCards = state.cards
        .filter((c) => c.listId === oldListId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
      const newListCards = state.cards
        .filter((c) => c.listId === newListId && c.id !== cardId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      const cardIndex = oldListCards.findIndex((c) => c.id === cardId)
      if (cardIndex === -1) return state

      oldListCards.splice(cardIndex, 1)
      newListCards.splice(newIndex, 0, card)

      const updatedCards = state.cards.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            listId: newListId,
            order: newIndex,
            version: (c.version || 1) + 1,
            lastModifiedAt: new Date().toISOString(),
          }
        }
        const oldIndex = oldListCards.findIndex((oc) => oc.id === c.id)
        if (oldIndex !== -1) {
          return { ...c, order: oldIndex, lastModifiedAt: new Date().toISOString() }
        }
        const newCardIndex = newListCards.findIndex((nc) => nc.id === c.id)
        if (newCardIndex !== -1) {
          return { ...c, order: newCardIndex, lastModifiedAt: new Date().toISOString() }
        }
        return c
      })

      return {
        ...state,
        cards: updatedCards,
        history: [...state.history.slice(0, state.historyIndex + 1), state],
        historyIndex: state.historyIndex + 1,
      }
    }

    case ACTION_TYPES.REORDER_CARDS: {
      const { listId, cardIds } = action.payload
      const updatedCards = state.cards.map((card) => {
        if (card.listId === listId) {
          const newOrder = cardIds.indexOf(card.id)
          if (newOrder !== -1) {
            return {
              ...card,
              order: newOrder,
              lastModifiedAt: new Date().toISOString(),
            }
          }
        }
        return card
      })

      return {
        ...state,
        cards: updatedCards,
        history: [...state.history.slice(0, state.historyIndex + 1), state],
        historyIndex: state.historyIndex + 1,
      }
    }

    case ACTION_TYPES.SYNC_SUCCESS: {
      return {
        ...state,
        lastSyncTime: new Date().toISOString(),
        syncQueue: [],
      }
    }

    case ACTION_TYPES.SYNC_FAILURE: {
      return {
        ...state,
        syncQueue: action.payload?.queue || state.syncQueue,
      }
    }

    case ACTION_TYPES.UNDO: {
      if (state.historyIndex <= 0) return state
      const previousState = state.history[state.historyIndex - 1]
      return {
        ...previousState,
        history: state.history,
        historyIndex: state.historyIndex - 1,
      }
    }

    case ACTION_TYPES.REDO: {
      if (state.historyIndex >= state.history.length - 1) return state
      const nextState = state.history[state.historyIndex + 1]
      return {
        ...nextState,
        history: state.history,
        historyIndex: state.historyIndex + 1,
      }
    }

    case ACTION_TYPES.CLEAR_ALL: {
      return {
        ...state,
        lists: [],
        cards: [],
        history: [...state.history.slice(0, state.historyIndex + 1), state],
        historyIndex: state.historyIndex + 1,
        syncQueue: [],
        conflicts: [],
      }
    }

    default:
      return state
  }
}

