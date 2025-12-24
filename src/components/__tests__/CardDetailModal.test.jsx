import { render, screen, fireEvent } from '@testing-library/react'
import CardDetailModal from '../CardDetailModal'

const mockCard = {
  id: 'card-1',
  title: 'Test Card',
  description: 'Test Description',
  tags: ['tag1', 'tag2'],
}

describe('CardDetailModal', () => {
  const defaultProps = {
    card: mockCard,
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    onDelete: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    window.confirm = jest.fn(() => true)
  })

  it('renders when open', () => {
    render(<CardDetailModal {...defaultProps} />)
    expect(screen.getByDisplayValue('Test Card')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<CardDetailModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByDisplayValue('Test Card')).not.toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed', () => {
    render(<CardDetailModal {...defaultProps} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('displays tags', () => {
    render(<CardDetailModal {...defaultProps} />)
    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
  })
})
