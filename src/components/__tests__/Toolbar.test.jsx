import { render, screen, fireEvent } from '@testing-library/react'
import Toolbar from '../Toolbar'
import { BoardProvider } from '../../context/BoardProvider'

// Mock window.prompt
const mockPrompt = jest.fn()

describe('Toolbar', () => {
  beforeEach(() => {
    window.prompt = mockPrompt
    jest.clearAllMocks()
  })

  it('renders Add List button', () => {
    render(
      <BoardProvider>
        <Toolbar />
      </BoardProvider>
    )
    expect(screen.getByText('+ Add List')).toBeInTheDocument()
  })

  it('renders Undo and Redo buttons', () => {
    render(
      <BoardProvider>
        <Toolbar />
      </BoardProvider>
    )
    expect(screen.getByText('↶ Undo')).toBeInTheDocument()
    expect(screen.getByText('↷ Redo')).toBeInTheDocument()
  })

  it('calls prompt when Add List is clicked', () => {
    mockPrompt.mockReturnValue('New List')
    render(
      <BoardProvider>
        <Toolbar />
      </BoardProvider>
    )
    const addButton = screen.getByText('+ Add List')
    fireEvent.click(addButton)
    expect(mockPrompt).toHaveBeenCalled()
  })
})
