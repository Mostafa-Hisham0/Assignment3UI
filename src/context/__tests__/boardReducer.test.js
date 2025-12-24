import { boardReducer, ACTION_TYPES } from '../boardReducer'
import { v4 as uuidv4 } from 'uuid'

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-id-123'),
}))

describe('boardReducer', () => {
  const initialState = {
    lists: [],
    cards: [],
    history: [],
    historyIndex: -1,
    syncQueue: [],
    lastSyncTime: null,
    conflicts: [],
  }

  it('should set initial state', () => {
    const lists = [{ id: '1', title: 'List 1' }]
    const cards = [{ id: '1', listId: '1', title: 'Card 1' }]
    const action = {
      type: ACTION_TYPES.SET_INITIAL_STATE,
      payload: { lists, cards },
    }
    const state = boardReducer(initialState, action)
    expect(state.lists).toEqual(lists)
    expect(state.cards).toEqual(cards)
  })

  it('should add a list', () => {
    const action = {
      type: ACTION_TYPES.ADD_LIST,
      payload: { title: 'New List' },
    }
    const state = boardReducer(initialState, action)
    expect(state.lists).toHaveLength(1)
    expect(state.lists[0].title).toBe('New List')
    expect(state.lists[0].id).toBe('test-id-123')
  })

  it('should update a list', () => {
    const listId = 'list-1'
    const stateWithList = {
      ...initialState,
      lists: [{ id: listId, title: 'Old Title', version: 1 }],
    }
    const action = {
      type: ACTION_TYPES.UPDATE_LIST,
      payload: { listId, updates: { title: 'New Title' } },
    }
    const state = boardReducer(stateWithList, action)
    expect(state.lists[0].title).toBe('New Title')
    expect(state.lists[0].version).toBe(2)
  })

  it('should delete a list', () => {
    const listId = 'list-1'
    const stateWithList = {
      ...initialState,
      lists: [{ id: listId, title: 'List' }],
      cards: [{ id: '1', listId, title: 'Card' }],
    }
    const action = {
      type: ACTION_TYPES.DELETE_LIST,
      payload: { listId },
    }
    const state = boardReducer(stateWithList, action)
    expect(state.lists).toHaveLength(0)
    expect(state.cards).toHaveLength(0)
  })

  it('should archive a list', () => {
    const listId = 'list-1'
    const stateWithList = {
      ...initialState,
      lists: [{ id: listId, title: 'List', archived: false }],
    }
    const action = {
      type: ACTION_TYPES.ARCHIVE_LIST,
      payload: { listId },
    }
    const state = boardReducer(stateWithList, action)
    expect(state.lists[0].archived).toBe(true)
  })

  it('should add a card', () => {
    const listId = 'list-1'
    const action = {
      type: ACTION_TYPES.ADD_CARD,
      payload: { listId, title: 'New Card' },
    }
    const state = boardReducer(initialState, action)
    expect(state.cards).toHaveLength(1)
    expect(state.cards[0].title).toBe('New Card')
    expect(state.cards[0].listId).toBe(listId)
  })

  it('should update a card', () => {
    const cardId = 'card-1'
    const stateWithCard = {
      ...initialState,
      cards: [{ id: cardId, title: 'Old Title', version: 1 }],
    }
    const action = {
      type: ACTION_TYPES.UPDATE_CARD,
      payload: { cardId, updates: { title: 'New Title' } },
    }
    const state = boardReducer(stateWithCard, action)
    expect(state.cards[0].title).toBe('New Title')
    expect(state.cards[0].version).toBe(2)
  })

  it('should delete a card', () => {
    const cardId = 'card-1'
    const stateWithCard = {
      ...initialState,
      cards: [{ id: cardId, title: 'Card' }],
    }
    const action = {
      type: ACTION_TYPES.DELETE_CARD,
      payload: { cardId },
    }
    const state = boardReducer(stateWithCard, action)
    expect(state.cards).toHaveLength(0)
  })

  it('should handle undo', () => {
    const stateWithHistory = {
      ...initialState,
      history: [{ lists: [], cards: [] }, { lists: [{ id: '1', title: 'List' }], cards: [] }],
      historyIndex: 1,
    }
    const action = { type: ACTION_TYPES.UNDO }
    const state = boardReducer(stateWithHistory, action)
    expect(state.historyIndex).toBe(0)
  })

  it('should handle redo', () => {
    const stateWithHistory = {
      ...initialState,
      history: [{ lists: [], cards: [] }, { lists: [{ id: '1', title: 'List' }], cards: [] }],
      historyIndex: 0,
    }
    const action = { type: ACTION_TYPES.REDO }
    const state = boardReducer(stateWithHistory, action)
    expect(state.historyIndex).toBe(1)
  })

  it('should move a card', () => {
    const cardId = 'card-1'
    const listId1 = 'list-1'
    const listId2 = 'list-2'
    const stateWithCard = {
      ...initialState,
      lists: [
        { id: listId1, title: 'List 1' },
        { id: listId2, title: 'List 2' },
      ],
      cards: [{ id: cardId, listId: listId1, title: 'Card', order: 0 }],
    }
    const action = {
      type: ACTION_TYPES.MOVE_CARD,
      payload: { cardId, newListId: listId2, newIndex: 0 },
    }
    const state = boardReducer(stateWithCard, action)
    expect(state.cards[0].listId).toBe(listId2)
  })

  it('should reorder cards', () => {
    const listId = 'list-1'
    const stateWithCards = {
      ...initialState,
      cards: [
        { id: 'card-1', listId, order: 0 },
        { id: 'card-2', listId, order: 1 },
      ],
    }
    const action = {
      type: ACTION_TYPES.REORDER_CARDS,
      payload: { listId, cardIds: ['card-2', 'card-1'] },
    }
    const state = boardReducer(stateWithCards, action)
    expect(state.cards.find((c) => c.id === 'card-2').order).toBe(0)
    expect(state.cards.find((c) => c.id === 'card-1').order).toBe(1)
  })
})
