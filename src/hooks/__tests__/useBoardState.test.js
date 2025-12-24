import { renderHook } from '@testing-library/react'
import { useBoardState } from '../useBoardState'
import { BoardProvider } from '../../context/BoardProvider'

describe('useBoardState', () => {
  it('should throw error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => {
      renderHook(() => useBoardState())
    }).toThrow('useBoard must be used within BoardProvider')
    consoleError.mockRestore()
  })

  it('should return board state when used inside provider', () => {
    const wrapper = ({ children }) => <BoardProvider>{children}</BoardProvider>
    const { result } = renderHook(() => useBoardState(), { wrapper })
    expect(result.current).toHaveProperty('lists')
    expect(result.current).toHaveProperty('cards')
    expect(result.current).toHaveProperty('addList')
    expect(result.current).toHaveProperty('updateList')
  })
})

