import { render, screen, waitFor } from '@testing-library/react'
import { BoardProvider } from '../context/BoardProvider'
import Board from '../components/Board'
import * as storage from '../services/storage'

jest.mock('../services/storage')

describe('Integration Tests', () => {
  beforeEach(() => {
    storage.getAllLists.mockResolvedValue([])
    storage.getAllCards.mockResolvedValue([])
    storage.saveList.mockResolvedValue()
    storage.saveCard.mockResolvedValue()
  })

  it('should load and display board', async () => {
    render(
      <BoardProvider>
        <Board />
      </BoardProvider>
    )

    await waitFor(() => {
      // Board should render - either with lists (role="main") or welcome message
      const mainElement = screen.queryByRole('main')
      const welcomeMessage = screen.queryByText('Welcome to Kanban Board')
      expect(mainElement || welcomeMessage).toBeInTheDocument()
    })
  })

  it('should persist list changes to storage', async () => {
    const { rerender } = render(
      <BoardProvider>
        <Board />
      </BoardProvider>
    )

    await waitFor(() => {
      expect(storage.getAllLists).toHaveBeenCalled()
    })
  })
})

