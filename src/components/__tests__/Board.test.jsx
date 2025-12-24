import { render, screen } from '@testing-library/react'
import Board from '../Board'
import { BoardProvider } from '../../context/BoardProvider'

// Mock storage
jest.mock('../../services/storage', () => ({
  getAllLists: jest.fn(() => Promise.resolve([])),
  getAllCards: jest.fn(() => Promise.resolve([])),
  saveCard: jest.fn(() => Promise.resolve()),
  deleteCard: jest.fn(() => Promise.resolve()),
  saveList: jest.fn(() => Promise.resolve()),
  deleteList: jest.fn(() => Promise.resolve()),
}))

describe('Board', () => {
  it('renders welcome message when no lists exist', () => {
    render(
      <BoardProvider>
        <Board />
      </BoardProvider>
    )
    expect(screen.getByText('Welcome to Kanban Board')).toBeInTheDocument()
  })
})
