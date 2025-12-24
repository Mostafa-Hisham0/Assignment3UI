import { renderHook, act } from '@testing-library/react'
import { BoardProvider, useBoard } from '../BoardProvider'

// Mock storage
jest.mock('../../services/storage', () => ({
  getAllLists: jest.fn(() => Promise.resolve([])),
  getAllCards: jest.fn(() => Promise.resolve([])),
}))

const wrapper = ({ children }) => <BoardProvider>{children}</BoardProvider>

describe('BoardProvider', () => {
  it('provides board context', () => {
    const { result } = renderHook(() => useBoard(), { wrapper })
    expect(result.current.lists).toBeDefined()
    expect(result.current.cards).toBeDefined()
    expect(result.current.addList).toBeDefined()
  })

  it('adds a list', () => {
    const { result } = renderHook(() => useBoard(), { wrapper })
    act(() => {
      result.current.addList('New List')
    })
    expect(result.current.lists.length).toBeGreaterThan(0)
  })

  it('adds a card', () => {
    const { result } = renderHook(() => useBoard(), { wrapper })
    act(() => {
      result.current.addList('Test List')
    })
    const listId = result.current.lists[0].id
    act(() => {
      result.current.addCard(listId, { title: 'New Card' })
    })
    expect(result.current.cards.length).toBeGreaterThan(0)
  })
})
