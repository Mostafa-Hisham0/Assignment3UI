import { boardReducer, ACTION_TYPES } from '../boardReducer'
import { generateId } from '../../utils/helpers'

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
    expect(state.lists[0].id).toBeDefined()
  })

  it('should update a list', () => {
    const listId = generateId()
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
    const listId = generateId()
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

  it('should add a card', () => {
    const listId = generateId()
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
    const cardId = generateId()
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
    const cardId = generateId()
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
})

