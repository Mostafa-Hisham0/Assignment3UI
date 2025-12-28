import { renderHook } from '@testing-library/react'
import { useUndoRedo } from '../useUndoRedo'
import { BoardProvider } from '../../context/BoardProvider'

const wrapper = ({ children }) => <BoardProvider>{children}</BoardProvider>

describe('useUndoRedo', () => {
  it('returns undo and redo functions', () => {
    const { result } = renderHook(() => useUndoRedo(), { wrapper })
    expect(result.current.undo).toBeDefined()
    expect(result.current.redo).toBeDefined()
  })

  it('returns canUndo and canRedo flags', () => {
    const { result } = renderHook(() => useUndoRedo(), { wrapper })
    expect(typeof result.current.canUndo).toBe('boolean')
    expect(typeof result.current.canRedo).toBe('boolean')
  })
})
